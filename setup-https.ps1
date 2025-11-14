# Setup Trusted HTTPS Certificate using mkcert
# This removes the browser warning completely

Write-Host "🔒 Setting up trusted HTTPS certificate..." -ForegroundColor Cyan

# Check if mkcert is installed
$mkcertInstalled = Get-Command mkcert -ErrorAction SilentlyContinue

if (-not $mkcertInstalled) {
    Write-Host "📦 Installing mkcert via Chocolatey..." -ForegroundColor Yellow
    
    # Check if Chocolatey is installed
    $chocoInstalled = Get-Command choco -ErrorAction SilentlyContinue
    
    if (-not $chocoInstalled) {
        Write-Host "❌ Chocolatey not found. Please install it first:" -ForegroundColor Red
        Write-Host "   Run PowerShell as Admin, then:" -ForegroundColor Yellow
        Write-Host "   Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "   Or install mkcert manually from: https://github.com/FiloSottile/mkcert" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "Installing mkcert..." -ForegroundColor Green
    choco install mkcert -y
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install mkcert" -ForegroundColor Red
        exit 1
    }
}

# Install local CA
Write-Host "📝 Installing local Certificate Authority..." -ForegroundColor Green
mkcert -install

# Create certs directory
$certsDir = ".\certs"
if (-not (Test-Path $certsDir)) {
    New-Item -ItemType Directory -Path $certsDir | Out-Null
}

# Generate certificate
Write-Host "🔑 Generating certificate for localhost..." -ForegroundColor Green
Set-Location $certsDir
mkcert localhost 127.0.0.1 ::1 192.168.1.65

# Rename files
if (Test-Path "localhost+3.pem") {
    Rename-Item "localhost+3.pem" "cert.pem" -Force
}
if (Test-Path "localhost+3-key.pem") {
    Rename-Item "localhost+3-key.pem" "key.pem" -Force
}

Set-Location ..

Write-Host ""
Write-Host "✅ Certificate setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Update vite.config.js with:" -ForegroundColor Cyan
Write-Host "   server: {" -ForegroundColor Yellow
Write-Host "     https: {" -ForegroundColor Yellow
Write-Host "       key: './certs/key.pem'," -ForegroundColor Yellow
Write-Host "       cert: './certs/cert.pem'," -ForegroundColor Yellow
Write-Host "     }," -ForegroundColor Yellow
Write-Host "     host: '0.0.0.0'," -ForegroundColor Yellow
Write-Host "     port: 5173," -ForegroundColor Yellow
Write-Host "   }" -ForegroundColor Yellow
Write-Host ""
Write-Host "🚀 Restart the dev server to use the new certificate" -ForegroundColor Green
