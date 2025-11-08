# Auto Update Server Script with password
$password = Get-Content ".server-password" -Raw
$password = $password.Trim()

Write-Host "Updating server..." -ForegroundColor Cyan
Write-Host ""

# Используем sshpass для автоматического ввода пароля
$commands = @"
cd ~/rest-api || cd ~/rest-api/rest-api
echo '[1/4] Pulling latest changes...'
git pull origin main
echo '[2/4] Installing dependencies...'
npm install --production 2>&1 | grep -v 'npm warn' || true
echo '[3/4] Restarting application...'
pm2 restart lumeai 2>&1 | tail -5
echo ''
echo '[SUCCESS] Server updated!'
"@

# Создаем временный файл с командами
$commands | Out-File -FilePath "temp_commands.sh" -Encoding ASCII

# Используем plink (PuTTY) для автоматического ввода пароля
Write-Host "Connecting to server..." -ForegroundColor Yellow
echo y | plink -batch -pw $password root@147.45.48.64 "bash -s" < temp_commands.sh

# Удаляем временный файл
Remove-Item "temp_commands.sh" -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "[DONE] Server update complete!" -ForegroundColor Green
Write-Host "Check: https://lumeai.ru" -ForegroundColor Cyan
Write-Host ""
