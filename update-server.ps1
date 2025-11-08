# Update Server Script
Write-Host "Updating server..." -ForegroundColor Cyan
Write-Host ""

ssh root@147.45.48.64 @"
echo '[1/4] Navigating to project...'
cd ~/rest-api || cd ~/rest-api/rest-api

echo '[2/4] Pulling latest changes...'
git pull

echo '[3/4] Installing dependencies...'
npm install --production

echo '[4/4] Restarting application...'
pm2 restart lumeai || pm2 restart all

echo ''
echo '[SUCCESS] Server updated!'
echo 'Check: https://lumeai.ru'
"@

Write-Host ""
Write-Host "[DONE] Server update complete!" -ForegroundColor Green
Write-Host "Check: https://lumeai.ru" -ForegroundColor Cyan
Write-Host ""
