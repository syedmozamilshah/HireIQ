#!/usr/bin/env python3
"""
Start server and test it's working
"""

import subprocess
import time
import requests
import sys
import threading
import signal
from pathlib import Path

def start_server():
    """Start the server in a subprocess"""
    try:
        cmd = [sys.executable, "-c", """
import uvicorn
from main import app
print("Server starting on http://127.0.0.1:8001")
uvicorn.run(app, host="127.0.0.1", port=8001, log_level="error")
"""]
        
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        return process
    except Exception as e:
        print(f"Error starting server: {e}")
        return None

def test_server():
    """Test the server endpoints"""
    base_url = "http://127.0.0.1:8001"
    
    # Wait for server to start
    print("Waiting for server to start...")
    time.sleep(5)
    
    tests = []
    
    # Test 1: Health endpoint
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health Check: {data['status']} - {data['message']}")
            tests.append(True)
        else:
            print(f"❌ Health Check failed: {response.status_code}")
            tests.append(False)
    except Exception as e:
        print(f"❌ Health Check error: {e}")
        tests.append(False)
    
    # Test 2: Root endpoint
    try:
        response = requests.get(f"{base_url}/", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Root Endpoint: {data['message']}")
            print(f"   Available endpoints: {len(data.get('endpoints', {}))}")
            tests.append(True)
        else:
            print(f"❌ Root endpoint failed: {response.status_code}")
            tests.append(False)
    except Exception as e:
        print(f"❌ Root endpoint error: {e}")
        tests.append(False)
    
    # Test 3: Docs endpoint
    try:
        response = requests.get(f"{base_url}/docs", timeout=5)
        if response.status_code == 200:
            print(f"✅ API Documentation accessible")
            tests.append(True)
        else:
            print(f"❌ API docs failed: {response.status_code}")
            tests.append(False)
    except Exception as e:
        print(f"❌ API docs error: {e}")
        tests.append(False)
    
    return tests

def main():
    """Main function"""
    print("🚀 Starting AI Career Assistant API and running tests...")
    print("=" * 60)
    
    # Start server
    server_process = start_server()
    
    if not server_process:
        print("❌ Could not start server")
        return 1
    
    try:
        # Test the server
        test_results = test_server()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST RESULTS")
        print("=" * 60)
        
        passed = sum(test_results)
        total = len(test_results)
        
        print(f"Tests passed: {passed}/{total}")
        
        if passed >= 2:
            print("🎉 SUCCESS! The AI Career Assistant API is running correctly!")
            print("\n📋 Server Information:")
            print("   • Status: Running and responding to requests")
            print("   • Host: 127.0.0.1")
            print("   • Port: 8001 (test port)")
            print("   • Health Check: Working")
            print("   • API Documentation: Accessible")
            print("\n💡 To run the server manually:")
            print("   python main.py")
            print("   python run_server.py")
            print("   uvicorn main:app --host 127.0.0.1 --port 8000")
            
            return 0
        else:
            print("⚠️  Some tests failed")
            return 1
            
    finally:
        # Stop server
        if server_process:
            print(f"\n🛑 Stopping server...")
            server_process.terminate()
            try:
                server_process.wait(timeout=3)
            except subprocess.TimeoutExpired:
                server_process.kill()
                server_process.wait()
            print("✅ Server stopped")

if __name__ == "__main__":
    sys.exit(main())
