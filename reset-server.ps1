# Reset server Git state
Write-Host "Resetting server Git state..." -ForegroundColor Yellow
Write-Host ""

ssh root@147.45.48.64 @"
cd ~/rest-api || cd ~/rest-api/rest-api
echo '[1/3] Resetting Git state...'
git reset --hard HEAD
git clean -fd

echo '[2/3] Pulling latest changes...'
git pull origin main

echo '[3/3] Restarting application...'
pm2 restart lumeai

echo ''
echo '[SUCCESS] Server reset and updated!'
"@

Write-Host ""
Write-Host "[DONE] Server reset complete!" -ForegroundColor Green
Write-Host ""
