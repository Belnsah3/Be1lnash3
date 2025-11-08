# Test Python G4F Providers Locally

Write-Host "Python G4F Provider Test" -ForegroundColor Cyan
Write-Host ""

# Check Python
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Python not installed!" -ForegroundColor Red
    exit 1
}
Write-Host "Python: $pythonVersion" -ForegroundColor Green
Write-Host ""

# Create venv if needed
if (!(Test-Path "venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
    Write-Host "Done" -ForegroundColor Green
}

# Activate venv
Write-Host "Activating venv..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
pip install -q -r requirements.txt
Write-Host ""

# Run test
Write-Host "Testing providers..." -ForegroundColor Cyan
Write-Host ""
python test_providers.py
Write-Host ""

Write-Host "Test complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To start API server run: .\start.ps1" -ForegroundColor Yellow
