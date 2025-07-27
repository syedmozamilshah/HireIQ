#!/usr/bin/env python3
"""
Improved server startup script for Windows.
Handles asyncio issues and provides better error messages.
"""

import os
import sys
import platform
import warnings
import asyncio
from dotenv import load_dotenv

# Import Windows fixes
from windows_fixes import WindowsNetworkingFixes

# Load environment variables
load_dotenv()

def setup_windows_asyncio():
    """Setup Windows-specific asyncio optimizations"""
    if platform.system() == "Windows":
        # Suppress specific Windows asyncio warnings
        warnings.filterwarnings("ignore", category=RuntimeWarning, message=".*Proactor.*")
        warnings.filterwarnings("ignore", category=ResourceWarning, message=".*unclosed.*")
        warnings.filterwarnings("ignore", category=DeprecationWarning, message=".*event loop.*")
        
        # Set the event loop policy for Windows
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
        
        # Create a new event loop and set it as the current one
        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.set_debug(False)
        except RuntimeError:
            # If there's already a loop, just disable debug mode
            try:
                current_loop = asyncio.get_event_loop()
                current_loop.set_debug(False)
            except RuntimeError:
                pass
        
        return True
    return False

def check_requirements():
    """Check if all required packages are installed"""
    package_imports = {
        'fastapi': 'fastapi',
        'uvicorn': 'uvicorn', 
        'python-multipart': 'multipart',
        'pypdf2': 'PyPDF2',
        'google-generativeai': 'google.generativeai',
        'python-dotenv': 'dotenv',
        'langgraph': 'langgraph'
    }
    
    missing_packages = []
    
    for package_name, import_name in package_imports.items():
        try:
            __import__(import_name)
        except ImportError:
            missing_packages.append(package_name)
    
    if missing_packages:
        print("❌ Missing required packages:")
        for package in missing_packages:
            print(f"   - {package}")
        print(f"\nInstall them with: pip install {' '.join(missing_packages)}")
        return False
    
    return True

def check_environment():
    """Check if required environment variables are set"""
    gemini_key = os.getenv("GEMINI_API_KEY")
    
    if not gemini_key:
        print("❌ GEMINI_API_KEY environment variable is not set!")
        print("Please create a .env file with your Gemini API key:")
        print("GEMINI_API_KEY=your_key_here")
        return False
    
    if len(gemini_key) < 20:
        print("⚠️  GEMINI_API_KEY seems too short. Please check your API key.")
        return False
        
    return True

def main():
    """Main startup function"""
    print("🚀 Starting AI Career Assistant API...")
    
    # Apply Windows fixes early
    if platform.system() == "Windows":
        WindowsNetworkingFixes.apply_all_fixes()
    
    # Check requirements
    if not check_requirements():
        sys.exit(1)
    
    # Check environment
    if not check_environment():
        sys.exit(1)
    
    # Setup Windows optimizations
    is_windows = setup_windows_asyncio()
    if is_windows:
        print("🔧 Applied Windows asyncio optimizations")
    
    # Import and start the server
    try:
        import uvicorn
        from main import app, GEMINI_API_KEY
        
        print(f"📋 Using Gemini API Key: {GEMINI_API_KEY[:20]}...")
        print("🔗 API will be available at: http://localhost:8000")
        print("📚 API Documentation: http://localhost:8000/docs")
        print("🏥 Health Check: http://localhost:8000/health")
        print("\n✨ Server starting... (Press Ctrl+C to stop)")
        
        # Configure uvicorn with Windows-friendly settings
        config = {
            "app": "main:app",
            "host": "127.0.0.1",  # Use localhost instead of 0.0.0.0 for Windows
            "port": 8000,
            "reload": False,
            "log_level": "info",  # Changed to info for better debugging
            "access_log": True,   # Enable access logging to see requests
            "use_colors": True
        }
        
        # Add Windows-specific configuration
        if is_windows:
            config["loop"] = "asyncio"
        
        uvicorn.run(**config)
        
    except KeyboardInterrupt:
        print("\n👋 Shutting down AI Career Assistant API...")
        sys.exit(0)
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("Please make sure all required packages are installed.")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
