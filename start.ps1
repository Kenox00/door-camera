# Smart Door Camera - Startup Script
# This script starts both the mock backend and frontend dev server

$ErrorActionPreference = "Stop"

Write-Host "🚀 Smart Door Camera - Starting..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exists
if (-Not (Test-Path "node_modules")) {
    Write-Host "⚠️  Dependencies not installed!" -ForegroundColor Yellow
    Write-Host "Running installation script..." -ForegroundColor Yellow
    Write-Host ""
    & .\install.ps1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Installation failed!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "Starting servers..." -ForegroundColor Yellow
Write-Host ""

# Function to start a process in a new window
function Start-InNewWindow {
    param (
        [string]$Title,
        [string]$Command
    )
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '$Title' -ForegroundColor Cyan; $Command"
}

# Start mock backend server
Write-Host "📡 Starting mock backend server..." -ForegroundColor Green
Start-InNewWindow "Mock Backend Server - http://localhost:3000" "npm run mock-server"
Start-Sleep -Seconds 2

# Start frontend dev server
Write-Host "⚛️  Starting frontend dev server..." -ForegroundColor Green
Start-InNewWindow "Frontend Dev Server - https://localhost:5173" "npm run dev"
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "✅ Both servers are starting!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Frontend: https://localhost:5173" -ForegroundColor Cyan
Write-Host "📡 Backend:  http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 What to do next:" -ForegroundColor Yellow
Write-Host "   1. Wait for both servers to finish starting (check the new windows)" -ForegroundColor White
Write-Host "   2. Open Chrome/Edge browser" -ForegroundColor White
Write-Host "   3. Navigate to: https://localhost:5173" -ForegroundColor White
Write-Host "   4. Accept SSL warning (self-signed certificate)" -ForegroundColor White
Write-Host "   5. Grant camera permissions" -ForegroundColor White
Write-Host "   6. Press RING BELL to test!" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
