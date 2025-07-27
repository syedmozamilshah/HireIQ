#!/usr/bin/env python3
"""
Server test script to verify the API is working correctly
"""

import asyncio
import time
import subprocess
import sys
import requests
import threading
from pathlib import Path


def start_server():
    """Start the FastAPI server in the background"""
    try:
        # Start server as a subprocess
        cmd = [sys.executable, "-c", 
               "import uvicorn; from main import app; uvicorn.run(app, host='127.0.0.1', port=8000, log_level='error')"]
        
        print("🚀 Starting server...")
        process = subprocess.Popen(cmd, 
                                 stdout=subprocess.PIPE, 
                                 stderr=subprocess.PIPE,
                                 text=True)
        
        # Give server time to start
        time.sleep(3)
        
        return process
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        return None


def test_health_endpoint():
    """Test the health endpoint"""
    try:
        response = requests.get("http://127.0.0.1:8000/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("✅ Health check passed:")
            print(f"   Status: {data.get('status')}")
            print(f"   Message: {data.get('message')}")
            print(f"   Version: {data.get('version')}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Health check error: {e}")
        return False


def test_root_endpoint():
    """Test the root endpoint"""
    try:
        response = requests.get("http://127.0.0.1:8000/", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("✅ Root endpoint passed:")
            print(f"   Message: {data.get('message')}")
            print(f"   Available endpoints: {len(data.get('endpoints', {}))}")
            return True
        else:
            print(f"❌ Root endpoint failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Root endpoint error: {e}")
        return False


def test_docs_endpoint():
    """Test the docs endpoint"""
    try:
        response = requests.get("http://127.0.0.1:8000/docs", timeout=5)
        if response.status_code == 200:
            print("✅ API docs accessible at http://127.0.0.1:8000/docs")
            return True
        else:
            print(f"❌ API docs failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ API docs error: {e}")
        return False


def main():
    """Run server tests"""
    print("🧪 Testing AI Career Assistant API Server\n")
    print("=" * 50)
    
    # Start the server
    server_process = start_server()
    
    if not server_process:
        print("❌ Could not start server")
        return 1
    
    try:
        # Wait a bit more for server to be ready
        time.sleep(2)
        
        # Run tests
        tests = [
            ("Health Endpoint", test_health_endpoint),
            ("Root Endpoint", test_root_endpoint),
            ("API Docs", test_docs_endpoint)
        ]
        
        results = []
        for test_name, test_func in tests:
            print(f"\n🔍 Testing {test_name}...")
            results.append(test_func())
        
        # Summary
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {sum(results)}/{len(results)} passed")
        
        if all(results):
            print("🎉 All server tests passed!")
            print("📋 Server is running and accessible at:")
            print("   • API: http://127.0.0.1:8000")
            print("   • Docs: http://127.0.0.1:8000/docs")
            print("   • Health: http://127.0.0.1:8000/health")
            return_code = 0
        else:
            print("⚠️  Some tests failed. Check the errors above.")
            return_code = 1
            
    finally:
        # Clean up - terminate server
        if server_process:
            print(f"\n🛑 Stopping server (PID: {server_process.pid})...")
            server_process.terminate()
            try:
                server_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                server_process.kill()
                server_process.wait()
            print("✅ Server stopped")
    
    return return_code


if __name__ == "__main__":
    sys.exit(main())
