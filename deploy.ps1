# LumeAI - Deploy Script

param(
    [string]$Message = "Update project"
)

Write-Host "LumeAI Deploy Script" -ForegroundColor Cyan
Write-Host "====================" -ForegroundColor Cyan
Write-Host ""

# Check Git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Git is not installed!" -ForegroundColor Red
    Write-Host "Install Git: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

# 1. Check changes
Write-Host "[1/6] Checking changes..." -ForegroundColor Yellow
$status = git status --porcelain

if (-not $status) {
    Write-Host "[OK] No changes to commit" -ForegroundColor Green
    
    $update = Read-Host "Update server? (y/n)"
    if ($update -eq "y") {
        Write-Host ""
        Write-Host "[SERVER] Updating server..." -ForegroundColor Yellow
        ssh root@147.45.48.64 "cd ~/rest-api && git pull && ./restart.sh app"
        Write-Host "[OK] Server updated!" -ForegroundColor Green
    }
    exit 0
}

Write-Host "Changed files: $($status.Count)" -ForegroundColor Cyan
Write-Host ""

# 2. Show changes
Write-Host "[2/6] Changed files:" -ForegroundColor Yellow
git status --short
Write-Host ""

# 3. Add files
Write-Host "[3/6] Adding files to Git..." -ForegroundColor Yellow
git add .

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to add files" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Files added" -ForegroundColor Green
Write-Host ""

# 4. Create commit
Write-Host "[4/6] Creating commit: '$Message'" -ForegroundColor Yellow
git commit -m $Message

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to create commit" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Commit created" -ForegroundColor Green
Write-Host ""

# 5. Push to GitHub
Write-Host "[5/6] Pushing to GitHub..." -ForegroundColor Yellow
git push

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to push to GitHub" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possible reasons:" -ForegroundColor Yellow
    Write-Host "  1. Remote not configured: git remote add origin <url>" -ForegroundColor White
    Write-Host "  2. No access: check token or SSH key" -ForegroundColor White
    Write-Host "  3. No internet connection" -ForegroundColor White
    exit 1
}

Write-Host "[OK] Pushed to GitHub" -ForegroundColor Green
Write-Host ""

# 6. Update server
$deployToServer = Read-Host "[6/6] Update server? (y/n, default y)"

if ($deployToServer -eq "" -or $deployToServer -eq "y") {
    Write-Host ""
    Write-Host "[SERVER] Connecting to server..." -ForegroundColor Yellow
    
    # Test SSH connection
    $null = ssh -o ConnectTimeout=5 root@147.45.48.64 "echo OK" 2>$null
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Cannot connect to server" -ForegroundColor Red
        Write-Host "Check:" -ForegroundColor Yellow
        Write-Host "  1. Server is online: ping 147.45.48.64" -ForegroundColor White
        Write-Host "  2. SSH works: ssh root@147.45.48.64" -ForegroundColor White
        exit 1
    }
    
    Write-Host "[OK] Connected to server" -ForegroundColor Green
    Write-Host ""
    Write-Host "[SERVER] Updating code on server..." -ForegroundColor Yellow
    
    # Execute commands on server
    ssh root@147.45.48.64 @"
cd ~/rest-api
echo '[1/3] Pulling changes...'
git pull
echo ''
echo '[2/3] Installing dependencies...'
npm install --production
echo ''
echo '[3/3] Restarting application...'
./restart.sh app
"@
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "[SUCCESS] Server updated successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Check: https://lumeai.ru" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "[WARNING] Possible errors during server update" -ForegroundColor Yellow
        Write-Host "Check logs: ssh root@147.45.48.64 'pm2 logs lumeai'" -ForegroundColor White
    }
} else {
    Write-Host ""
    Write-Host "[SKIP] Server update skipped" -ForegroundColor Yellow
    Write-Host "To update manually:" -ForegroundColor White
    Write-Host "  ssh root@147.45.48.64" -ForegroundColor Cyan
    Write-Host "  cd ~/rest-api && git pull && ./restart.sh app" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "[DONE] Deployment complete!" -ForegroundColor Green
Write-Host ""
