#!/usr/bin/env python3
"""
Test script to verify all required dependencies are installed
"""

import sys

def test_imports():
    """Test if all required packages can be imported"""
    failed_imports = []
    
    required_packages = [
        ('fastapi', 'FastAPI'),
        ('uvicorn', 'Uvicorn'),
        ('multipart', 'python-multipart'),
        ('PyPDF2', 'PyPDF2'),
        ('google.generativeai', 'google-generativeai'),
        ('langgraph', 'LangGraph'),
        ('langchain', 'LangChain'),
        ('langchain_google_genai', 'langchain-google-genai'),
        ('langchain_community', 'langchain-community'),
        ('requests', 'requests'),
        ('bs4', 'beautifulsoup4'),
        ('dotenv', 'python-dotenv'),
        ('pydantic', 'pydantic'),
        ('aiofiles', 'aiofiles'),
        ('nltk', 'nltk'),
        ('sklearn', 'scikit-learn'),
        ('numpy', 'numpy'),
        ('pandas', 'pandas')
    ]
    
    print("🔍 Checking dependencies...\n")
    
    for module_name, package_name in required_packages:
        try:
            __import__(module_name)
            print(f"✅ {package_name} - OK")
        except ImportError as e:
            print(f"❌ {package_name} - MISSING")
            failed_imports.append(package_name)
    
    # Check NLTK data
    print("\n🔍 Checking NLTK data...")
    try:
        import nltk
        try:
            nltk.data.find('tokenizers/punkt')
            print("✅ NLTK punkt tokenizer - OK")
        except LookupError:
            print("⚠️  NLTK punkt tokenizer - MISSING (will download on first run)")
        
        try:
            nltk.data.find('corpora/wordnet')
            print("✅ NLTK wordnet - OK")
        except LookupError:
            print("⚠️  NLTK wordnet - MISSING (will download on first run)")
    except:
        pass
    
    # Check environment variables
    print("\n🔍 Checking environment variables...")
    import os
    from dotenv import load_dotenv
    load_dotenv()
    
    if os.getenv("GEMINI_API_KEY"):
        print("✅ GEMINI_API_KEY - SET")
    else:
        print("❌ GEMINI_API_KEY - NOT SET")
    
    # Summary
    print("\n" + "="*50)
    if failed_imports:
        print(f"❌ {len(failed_imports)} packages missing:")
        print(f"   Run: pip install {' '.join(failed_imports)}")
        return False
    else:
        print("✅ All dependencies are installed!")
        return True

if __name__ == "__main__":
    success = test_imports()
    sys.exit(0 if success else 1)
