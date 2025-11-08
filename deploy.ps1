# LumeAI - Deploy Script
param(
    [string]$Message = "Update project"
)

Write-Host "LumeAI Deploy Script" -ForegroundColor Cyan
Write-Host "====================" -ForegroundColor Cyan
Write-Host ""

# 1. Check changes
Write-Host "[1/5] Checking changes..." -ForegroundColor Yellow
$status = git status --porcelain

if (-not $status) {
    Write-Host "[OK] No changes to commit" -ForegroundColor Green
    exit 0
}

Write-Host "Changed files: $($status.Count)" -ForegroundColor Cyan
Write-Host ""

# 2. Show changes
Write-Host "[2/5] Changed files:" -ForegroundColor Yellow
git status --short
Write-Host ""

# 3. Add files
Write-Host "[3/5] Adding files to Git..." -ForegroundColor Yellow
git add .
Write-Host "[OK] Files added" -ForegroundColor Green
Write-Host ""

# 4. Create commit
Write-Host "[4/5] Creating commit: '$Message'" -ForegroundColor Yellow
git commit -m $Message

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to create commit" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Commit created" -ForegroundColor Green
Write-Host ""

# 5. Push to GitHub
Write-Host "[5/5] Pushing to GitHub..." -ForegroundColor Yellow
git push

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to push to GitHub" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Pushed to GitHub" -ForegroundColor Green
Write-Host ""
Write-Host "[SUCCESS] Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To update server, run:" -ForegroundColor Yellow
Write-Host "  ssh root@147.45.48.64 'cd ~/rest-api && git pull && pm2 restart lumeai'" -ForegroundColor Cyan
Write-Host ""
