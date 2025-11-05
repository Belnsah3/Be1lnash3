# Quick Commit Script

param(
    [string]$Message = "Quick update"
)

Write-Host "Quick Commit" -ForegroundColor Cyan
Write-Host ""

# Add all files
git add .

# Create commit
git commit -m $Message

# Push to GitHub
git push

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "[SUCCESS] Pushed to GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "To update server:" -ForegroundColor Yellow
    Write-Host "  ssh root@147.45.48.64 'cd ~/rest-api && git pull && ./restart.sh app'" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "[ERROR] Failed to push!" -ForegroundColor Red
}
