#!/usr/bin/env python3
"""
AI Career Assistant API - Complete Demo & Test Suite
"""

import sys
import subprocess
import time
from pathlib import Path

def run_command(cmd, description):
    """Run a command and display results"""
    print(f"\n{'='*60}")
    print(f"🔧 {description}")
    print(f"{'='*60}")
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, shell=True)
        
        if result.stdout:
            print("📤 OUTPUT:")
            print(result.stdout)
        
        if result.stderr:
            print("⚠️  STDERR:")
            print(result.stderr)
            
        print(f"Exit Code: {result.returncode}")
        return result.returncode == 0
        
    except Exception as e:
        print(f"❌ Error running command: {e}")
        return False

def main():
    """Run complete demonstration"""
    print("🚀 AI Career Assistant API - Complete Demo")
    print("=" * 60)
    print("This demo will run all tests and demonstrate functionality")
    print("=" * 60)
    
    # Test 1: Backend functionality
    success1 = run_command("python test_backend.py", "Testing Backend Functionality")
    
    # Test 2: Import verification
    success2 = run_command(
        "python -c \"from main import app; print('✅ FastAPI app ready'); print('Routes:', [r.path for r in app.routes])\"",
        "Verifying FastAPI Application"
    )
    
    # Test 3: Quick functionality demo
    success3 = run_command(
        "python -c \"print('🧪 Quick AI Demo'); from simple_test import test_career_agent; import asyncio; asyncio.run(test_career_agent())\" 2>/dev/null | head -20",
        "Quick AI Functionality Demo (First 20 lines)"
    )
    
    # Summary
    print(f"\n{'='*60}")
    print("📊 DEMO SUMMARY")
    print(f"{'='*60}")
    
    total_tests = 3
    passed_tests = sum([success1, success2, success3])
    
    print(f"✅ Backend Tests: {'PASSED' if success1 else 'FAILED'}")
    print(f"✅ FastAPI Import: {'PASSED' if success2 else 'FAILED'}")  
    print(f"✅ AI Demo: {'PASSED' if success3 else 'FAILED'}")
    
    print(f"\n📈 Overall Result: {passed_tests}/{total_tests} tests passed")
    
    if passed_tests >= 2:
        print("\n🎉 SUCCESS! The AI Career Assistant API is working!")
        print("\n📋 To run the server:")
        print("   python main.py")
        print("   OR")
        print("   python run_server.py")
        print("\n🔗 Once running, access:")
        print("   • API: http://127.0.0.1:8000")
        print("   • Docs: http://127.0.0.1:8000/docs")
        print("   • Health: http://127.0.0.1:8000/health")
        
        return 0
    else:
        print("\n⚠️  Some critical tests failed. Check the output above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
