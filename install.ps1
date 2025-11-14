# Smart Door Camera - Installation Script
# This script installs all dependencies and sets up the project

Write-Host "🚀 Smart Door Camera - Installation Starting..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js $nodeVersion detected" -ForegroundColor Green
Write-Host ""

# Check if npm is installed
Write-Host "Checking npm installation..." -ForegroundColor Yellow
$npmVersion = npm --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm is not installed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ npm $npmVersion detected" -ForegroundColor Green
Write-Host ""

# Install dependencies
Write-Host "Installing project dependencies..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Gray
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
Write-Host ""

# Install mock server dependencies
Write-Host "Installing mock server dependencies..." -ForegroundColor Yellow
npm install express cors
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Warning: Failed to install mock server dependencies" -ForegroundColor Yellow
    Write-Host "You can install them manually later with: npm install express cors" -ForegroundColor Yellow
} else {
    Write-Host "✅ Mock server dependencies installed" -ForegroundColor Green
}
Write-Host ""

# Check if .env exists
if (-Not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env file created from template" -ForegroundColor Green
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}
Write-Host ""

# Display success message
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "🎉 Installation Complete!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""

# Display next steps
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣  Start the mock backend server:" -ForegroundColor White
Write-Host "   npm run mock-server" -ForegroundColor Yellow
Write-Host ""
Write-Host "2️⃣  In a NEW terminal, start the development server:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "3️⃣  Open your browser to:" -ForegroundColor White
Write-Host "   https://localhost:5173" -ForegroundColor Yellow
Write-Host ""
Write-Host "4️⃣  Accept the SSL warning (self-signed certificate)" -ForegroundColor White
Write-Host ""
Write-Host "5️⃣  Grant camera permissions when prompted" -ForegroundColor White
Write-Host ""
Write-Host "6️⃣  Press the RING BELL button to test!" -ForegroundColor White
Write-Host ""

# Display documentation links
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   • README.md      - Full project documentation" -ForegroundColor White
Write-Host "   • QUICKSTART.md  - Quick setup guide" -ForegroundColor White
Write-Host "   • TESTING.md     - Testing instructions" -ForegroundColor White
Write-Host "   • API.md         - Backend API documentation" -ForegroundColor White
Write-Host ""

# Display quick commands
Write-Host "⚡ Quick Commands:" -ForegroundColor Cyan
Write-Host "   npm run dev          - Start development server" -ForegroundColor White
Write-Host "   npm run build        - Build for production" -ForegroundColor White
Write-Host "   npm run preview      - Preview production build" -ForegroundColor White
Write-Host "   npm run mock-server  - Start mock backend" -ForegroundColor White
Write-Host ""

Write-Host "Ready to go! 🚀" -ForegroundColor Green
Write-Host ""
