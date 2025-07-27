@echo off
echo 🚀 Starting AI Career Assistant API...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python and try again
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist .env (
    echo ❌ .env file not found!
    echo Please create a .env file with your Gemini API key:
    echo GEMINI_API_KEY=your_key_here
    pause
    exit /b 1
)

REM Start the server using the improved script
echo ✨ Starting server with Windows optimizations...
python start_server.py

echo.
echo 👋 Server stopped. Press any key to exit...
pause >nul
