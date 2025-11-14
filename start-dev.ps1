# Start both frontend and backend servers
Write-Host "`n🚀 Starting Door Camera Development Environment`n" -ForegroundColor Cyan

# Start mock server in background
Write-Host "📡 Starting Mock Backend Server (Port 5000)..." -ForegroundColor Yellow
$backend = Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run mock-server" -PassThru

# Wait a moment for backend to start
Start-Sleep -Seconds 2

# Start frontend dev server
Write-Host "⚛️  Starting Frontend Dev Server (Port 3000)..." -ForegroundColor Green
npm run dev

# Cleanup on exit
Stop-Process -Id $backend.Id -ErrorAction SilentlyContinue
