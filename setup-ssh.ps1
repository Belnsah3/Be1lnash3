# Скрипт для настройки SSH ключа (выполнить ОДИН раз)

Write-Host "=== Настройка SSH ключа для автодеплоя ===" -ForegroundColor Cyan
Write-Host ""

# Проверяем наличие SSH ключа
$sshKeyPath = "$env:USERPROFILE\.ssh\id_rsa"

if (Test-Path $sshKeyPath) {
    Write-Host "✓ SSH ключ уже существует: $sshKeyPath" -ForegroundColor Green
} else {
    Write-Host "Создаем новый SSH ключ..." -ForegroundColor Yellow
    ssh-keygen -t rsa -b 4096 -f $sshKeyPath -N '""'
    Write-Host "✓ SSH ключ создан!" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Инструкция ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Скопируй публичный ключ (выполнится автоматически):"
Write-Host ""

# Показываем публичный ключ
$publicKey = Get-Content "$sshKeyPath.pub"
Write-Host $publicKey -ForegroundColor Yellow

# Копируем в буфер обмена
$publicKey | Set-Clipboard
Write-Host ""
Write-Host "✓ Публичный ключ скопирован в буфер обмена!" -ForegroundColor Green

Write-Host ""
Write-Host "2. Подключись к серверу и добавь ключ:" -ForegroundColor Cyan
Write-Host ""
Write-Host "ssh root@147.45.48.64" -ForegroundColor Yellow
Write-Host "# Введи пароль в последний раз: 24162006gorA!" -ForegroundColor Gray
Write-Host ""
Write-Host "# Выполни на сервере:" -ForegroundColor Cyan
Write-Host 'mkdir -p ~/.ssh' -ForegroundColor Yellow
Write-Host 'chmod 700 ~/.ssh' -ForegroundColor Yellow
Write-Host 'echo "ВСТАВЬ_СКОПИРОВАННЫЙ_КЛЮЧ" >> ~/.ssh/authorized_keys' -ForegroundColor Yellow
Write-Host 'chmod 600 ~/.ssh/authorized_keys' -ForegroundColor Yellow
Write-Host 'exit' -ForegroundColor Yellow
Write-Host ""
Write-Host "3. После этого deploy.ps1 будет работать БЕЗ пароля!" -ForegroundColor Green
Write-Host ""

# Создаем команду для сервера
$serverCommand = @"
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo '$publicKey' >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
exit
"@

Write-Host "=== Или выполни всё одной командой ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "ssh root@147.45.48.64 '$serverCommand'" -ForegroundColor Yellow
Write-Host ""
Write-Host "Нажми Enter для продолжения..."
$null = Read-Host
