#!/usr/bin/env python3
"""
Test script to verify backend functionality
"""

import os
import sys
from dotenv import load_dotenv

def test_imports():
    """Test if all imports work correctly"""
    try:
        from career_agent import CareerAssistantAgent
        print("✅ Successfully imported CareerAssistantAgent")
        return True
    except Exception as e:
        print(f"❌ Import error: {e}")
        return False

def test_api_key():
    """Test API key configuration"""
    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")
    
    if not api_key:
        print("❌ GEMINI_API_KEY not found in environment")
        return False
    
    if len(api_key) < 20:
        print(f"❌ API key seems too short: {len(api_key)} characters")
        return False
        
    print(f"✅ API key found: {api_key[:10]}...")
    return True

def test_basic_initialization():
    """Test basic agent initialization"""
    try:
        from career_agent import CareerAssistantAgent
        load_dotenv()
        api_key = os.getenv("GEMINI_API_KEY")
        
        if not api_key:
            print("❌ Cannot test initialization - no API key")
            return False
            
        agent = CareerAssistantAgent(api_key)
        print("✅ Agent initialized successfully")
        return True
    except Exception as e:
        print(f"❌ Initialization error: {e}")
        return False

def main():
    print("🔍 Testing Backend Functionality")
    print("=" * 40)
    
    # Run tests
    tests = [
        ("Import Test", test_imports),
        ("API Key Test", test_api_key), 
        ("Initialization Test", test_basic_initialization)
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n🧪 Running {test_name}...")
        results.append(test_func())
    
    print("\n" + "=" * 40)
    print(f"📊 Test Results: {sum(results)}/{len(results)} passed")
    
    if all(results):
        print("🎉 All tests passed! Backend is ready.")
        return 0
    else:
        print("⚠️  Some tests failed. Check the errors above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
