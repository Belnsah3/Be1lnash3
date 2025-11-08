# Full Deployment Script for LumeAI

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  LumeAI - Full Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Commit and push
Write-Host "[1/3] Committing changes to Git..." -ForegroundColor Yellow
git add .
git commit -m "Complete project setup with 41+ models"
git push origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Git push failed!" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Changes pushed to GitHub" -ForegroundColor Green
Write-Host ""

# Step 2: Update server
Write-Host "[2/3] Updating server..." -ForegroundColor Yellow
.\quick-update.ps1

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Server update failed!" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Server updated" -ForegroundColor Green
Write-Host ""

# Step 3: Verify deployment
Write-Host "[3/3] Verifying deployment..." -ForegroundColor Yellow
Write-Host ""

Write-Host "Checking services..." -ForegroundColor Cyan
$pass = "2246"
$server = "be1lnash3@192.168.31.26"
$plinkPath = "$PSScriptRoot\plink.exe"

Write-Output y | & $plinkPath -ssh $server -pw $pass "pm2 list"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Access your application:" -ForegroundColor Yellow
Write-Host "  http://192.168.31.26" -ForegroundColor Cyan
Write-Host ""
Write-Host "Check logs:" -ForegroundColor Yellow
Write-Host "  ssh be1lnash3@192.168.31.26" -ForegroundColor Cyan
Write-Host "  pm2 logs lumeai" -ForegroundColor Cyan
Write-Host "  pm2 logs python-g4f" -ForegroundColor Cyan
Write-Host ""
