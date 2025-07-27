#!/usr/bin/env pwsh

# Job-Khoji Startup Script
# This script starts all the required services for the Job-Khoji platform

Write-Host "🚀 Starting Job-Khoji Platform..." -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

$ErrorActionPreference = "Stop"

# Function to check if a port is in use
function Test-Port {
    param($Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    }
    catch {
        return $false
    }
}

# Function to start a service in a new terminal
function Start-Service {
    param($Name, $Path, $Command, $Port)
    
    Write-Host "Starting $Name..." -ForegroundColor Yellow
    
    if (Test-Port $Port) {
        Write-Host "⚠️  Port $Port is already in use. $Name may already be running." -ForegroundColor Yellow
        return
    }
    
    try {
        Start-Process -FilePath "pwsh" -ArgumentList "-NoExit", "-Command", "cd '$Path'; $Command" -WindowStyle Normal
        Write-Host "✅ $Name started successfully" -ForegroundColor Green
        Start-Sleep -Seconds 2
    }
    catch {
        Write-Host "❌ Failed to start $Name" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

# Get the current directory
$rootPath = Get-Location

# Check prerequisites
Write-Host "🔍 Checking prerequisites..." -ForegroundColor Cyan

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Node.js not found. Please install Node.js 18.x or higher." -ForegroundColor Red
    exit 1
}

# Check Python
try {
    $pythonVersion = python --version
    Write-Host "✅ Python: $pythonVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Python not found. Please install Python 3.9 or higher." -ForegroundColor Red
    exit 1
}

# Check MongoDB (optional for MongoDB Atlas)
Write-Host "ℹ️  Make sure MongoDB is running (locally or Atlas connection is configured)" -ForegroundColor Blue

Write-Host ""
Write-Host "🔧 Starting services..." -ForegroundColor Cyan

# Start Python Backend (AI Processing)
$pythonPath = Join-Path $rootPath "python-backend"
Start-Service -Name "Python AI Backend" -Path $pythonPath -Command "python main.py" -Port 8000

# Wait a bit for Python backend to start
Start-Sleep -Seconds 3

# Start Node.js Backend
$backendPath = Join-Path $rootPath "backend"
Start-Service -Name "Node.js Backend" -Path $backendPath -Command "npm run dev" -Port 3000

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start Frontend
$frontendPath = Join-Path $rootPath "frontend"
Start-Service -Name "React Frontend" -Path $frontendPath -Command "npm run dev" -Port 5173

Write-Host ""
Write-Host "🎉 All services started!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host "🌐 Frontend:      http://localhost:5173" -ForegroundColor Cyan
Write-Host "🔧 Node.js API:   http://localhost:3000" -ForegroundColor Cyan
Write-Host "🤖 Python AI:     http://localhost:8000" -ForegroundColor Cyan
Write-Host "📚 API Docs:      http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Yellow
Write-Host "- Each service runs in its own terminal window" -ForegroundColor White
Write-Host "- Press Ctrl+C in any terminal to stop that service" -ForegroundColor White
Write-Host "- Check the respective terminal windows for logs and errors" -ForegroundColor White
Write-Host ""
Write-Host "🐛 Troubleshooting:" -ForegroundColor Yellow
Write-Host "- If a service fails to start, check if the port is already in use" -ForegroundColor White
Write-Host "- Make sure all dependencies are installed (npm install, pip install -r requirements.txt)" -ForegroundColor White
Write-Host "- Check environment variables in .env files" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit this script..." -ForegroundColor Gray
[void][System.Console]::ReadKey($true)
