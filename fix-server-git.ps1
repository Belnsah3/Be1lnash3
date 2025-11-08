# Fix Git tracking on server
Write-Host "Fixing Git configuration on server..." -ForegroundColor Cyan
Write-Host ""

ssh root@147.45.48.64 @"
cd ~/rest-api || cd ~/rest-api/rest-api
echo 'Setting up Git tracking...'
git branch --set-upstream-to=origin/main master
git pull origin main
echo ''
echo '[SUCCESS] Git configured!'
"@

Write-Host ""
Write-Host "[DONE] Git configuration fixed!" -ForegroundColor Green
Write-Host ""
