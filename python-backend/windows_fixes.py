"""
Windows-specific fixes for asyncio connection reset errors.
This module contains utilities to handle Windows networking quirks.
"""

import os
import sys
import platform
import warnings
import asyncio
import logging
from typing import Optional


def suppress_windows_connection_warnings():
    """
    Suppress common Windows connection reset warnings that don't affect functionality.
    """
    if platform.system() != "Windows":
        return
    
    # Suppress specific warnings that are common on Windows
    warnings.filterwarnings("ignore", category=ResourceWarning, message=".*unclosed.*")
    warnings.filterwarnings("ignore", category=RuntimeWarning, message=".*Proactor.*")
    warnings.filterwarnings("ignore", category=DeprecationWarning, message=".*event loop.*")
    
    # Suppress ConnectionResetError logging
    logging.getLogger("uvicorn.error").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)


def setup_windows_asyncio_policy():
    """
    Setup Windows-specific asyncio policy to handle connection resets gracefully.
    """
    if platform.system() != "Windows":
        return
    
    try:
        # Use WindowsProactorEventLoopPolicy for better Windows compatibility
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
        
        # Create new event loop if needed
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        
        # Disable debug mode to reduce noise
        loop.set_debug(False)
        
    except Exception as e:
        print(f"Warning: Could not setup Windows asyncio policy: {e}")


def handle_connection_reset_error(func):
    """
    Decorator to handle ConnectionResetError gracefully on Windows.
    """
    import functools
    
    @functools.wraps(func)
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except ConnectionResetError:
            # On Windows, this is often normal when client disconnects
            if platform.system() == "Windows":
                print("Client disconnected (ConnectionResetError) - this is normal for file uploads")
                return None
            raise
        except Exception:
            raise
    
    return wrapper


class WindowsNetworkingFixes:
    """
    Collection of Windows networking fixes for the FastAPI application.
    """
    
    @staticmethod
    def apply_all_fixes():
        """Apply all Windows networking fixes."""
        suppress_windows_connection_warnings()
        setup_windows_asyncio_policy()
        print("✅ Applied Windows networking fixes")
    
    @staticmethod
    def get_uvicorn_config() -> dict:
        """Get Windows-optimized uvicorn configuration."""
        config = {
            "host": "127.0.0.1",  # Use localhost instead of 0.0.0.0 on Windows
            "port": 8000,
            "reload": False,
            "log_level": "warning",  # Reduce log noise
            "access_log": False,
            "use_colors": True,
            "loop": "asyncio"
        }
        
        return config


def is_connection_reset_error_safe(exception: Exception) -> bool:
    """
    Check if a ConnectionResetError is safe to ignore on Windows.
    
    On Windows, these errors often occur during file uploads when the client
    closes the connection after the server has already processed the request.
    """
    if not isinstance(exception, ConnectionResetError):
        return False
    
    if platform.system() != "Windows":
        return False
    
    # Check if this is the common Windows error code
    error_code = getattr(exception, 'winerror', None)
    if error_code == 10054:  # WSAECONNRESET
        return True
    
    return False


# Comprehensive Windows connection reset fixes
if platform.system() == "Windows":
    
    def apply_windows_patches():
        """Apply all necessary Windows patches for connection handling."""
        try:
            # Patch socket operations
            import socket
            original_socket_shutdown = getattr(socket.socket, '_original_shutdown', None)
            if not original_socket_shutdown:
                socket.socket._original_shutdown = socket.socket.shutdown
                
                def safe_shutdown(self, how):
                    try:
                        if self.fileno() != -1:  # Socket is still valid
                            return socket.socket._original_shutdown(self, how)
                    except (ConnectionResetError, OSError, ValueError):
                        # Ignore all socket shutdown errors on Windows
                        pass
                
                socket.socket.shutdown = safe_shutdown
            
            # Patch asyncio proactor events
            try:
                from asyncio import proactor_events
                original_call_connection_lost = getattr(proactor_events._ProactorBasePipeTransport, '_original_call_connection_lost', None)
                
                if not original_call_connection_lost:
                    proactor_events._ProactorBasePipeTransport._original_call_connection_lost = proactor_events._ProactorBasePipeTransport._call_connection_lost
                    
                    def patched_call_connection_lost(self, exc):
                        # Just ignore all connection lost calls on Windows to prevent socket errors
                        if exc and isinstance(exc, (ConnectionResetError, OSError)):
                            return
                        
                        # For clean disconnections (exc is None), also ignore to prevent shutdown errors
                        if exc is None:
                            return
                        
                        # For other exceptions, try original but catch errors
                        try:
                            return proactor_events._ProactorBasePipeTransport._original_call_connection_lost(self, exc)
                        except (ConnectionResetError, OSError, ValueError):
                            return
                    
                    proactor_events._ProactorBasePipeTransport._call_connection_lost = patched_call_connection_lost
            
            except ImportError:
                pass
            
            # Set up better error handling for asyncio
            def handle_exception(loop, context):
                exception = context.get('exception')
                if isinstance(exception, (ConnectionResetError, ConnectionAbortedError)):
                    # Silently ignore connection reset errors
                    return
                
                # For other exceptions, just log them at debug level
                message = context.get('message', '')
                if 'connection' in message.lower() and 'reset' in message.lower():
                    return
                
                # Default handling for real errors
                logging.getLogger('asyncio').debug(f"Asyncio exception: {context}")
            
            # Apply exception handler to current loop
            try:
                loop = asyncio.get_event_loop()
                loop.set_exception_handler(handle_exception)
            except RuntimeError:
                pass
                
        except Exception as e:
            print(f"Warning: Could not apply all Windows patches: {e}")
    
    # Apply patches immediately when module is imported
    apply_windows_patches()
