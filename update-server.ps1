# Update Server Script
Write-Host "Updating server..." -ForegroundColor Cyan
Write-Host ""

ssh root@147.45.48.64 @"
echo '[1/4] Navigating to project...'
cd ~/rest-api || cd ~/rest-api/rest-api

echo '[2/4] Pulling latest changes...'
git pull origin main || git pull origin master

echo '[3/4] Installing dependencies...'
npm install --production 2>&1 | grep -v 'npm warn'

echo '[4/4] Restarting application...'
pm2 restart lumeai 2>&1 | tail -5

echo ''
echo '[SUCCESS] Server updated!'
echo 'Check: https://lumeai.ru'
"@

Write-Host ""
Write-Host "[DONE] Server update complete!" -ForegroundColor Green
Write-Host "Check: https://lumeai.ru" -ForegroundColor Cyan
Write-Host ""
