# Автоматическая настройка SSH для беспарольного доступа
# Выполнить ОДИН раз!

param(
    [string]$ServerPassword = "24162006gorA!"
)

Write-Host "=== Автоматическая настройка SSH ===" -ForegroundColor Cyan
Write-Host ""

$server = "root@147.45.48.64"
$sshDir = "$env:USERPROFILE\.ssh"
$keyPath = "$sshDir\lumeai_rsa"

# Создаем директорию SSH если нет
if (-not (Test-Path $sshDir)) {
    Write-Host "Создаем директорию .ssh..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $sshDir -Force | Out-Null
}

# Проверяем наличие ключа
if (Test-Path $keyPath) {
    Write-Host "✓ SSH ключ уже существует!" -ForegroundColor Green
} else {
    Write-Host "Создаем новый SSH ключ..." -ForegroundColor Yellow
    ssh-keygen -t rsa -b 4096 -f $keyPath -N '""' -C "lumeai-deploy"
    Write-Host "✓ SSH ключ создан!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Копируем публичный ключ на сервер..." -ForegroundColor Yellow

# Читаем публичный ключ
$publicKey = Get-Content "$keyPath.pub" -Raw

# Создаем временный скрипт для выполнения на сервере
$setupScript = @"
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo '$publicKey' >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
echo 'SSH key added successfully!'
"@

# Используем sshpass для автоматической передачи пароля (если установлен)
# Или используем expect-подобный подход через plink

Write-Host ""
Write-Host "Настройка SSH конфига..." -ForegroundColor Yellow

# Добавляем в SSH config
$sshConfig = "$sshDir\config"
$configContent = @"

# LumeAI Server
Host lumeai
    HostName 147.45.48.64
    User root
    IdentityFile $keyPath
    IdentitiesOnly yes
"@

if (Test-Path $sshConfig) {
    $currentConfig = Get-Content $sshConfig -Raw
    if (-not $currentConfig.Contains("Host lumeai")) {
        Add-Content $sshConfig $configContent
        Write-Host "✓ SSH config обновлен!" -ForegroundColor Green
    }
} else {
    Set-Content $sshConfig $configContent
    Write-Host "✓ SSH config создан!" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== ВАЖНО! Выполни эти команды ВРУЧНУЮ (один раз): ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Скопируй команды ниже (они уже в буфере обмена):" -ForegroundColor Yellow
Write-Host ""

$command = @"
ssh root@147.45.48.64 "mkdir -p ~/.ssh && chmod 700 ~/.ssh && echo '$publicKey' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && echo 'SSH настроен!'"
"@

Write-Host $command -ForegroundColor White
Set-Clipboard -Value $command

Write-Host ""
Write-Host "2. Вставь в PowerShell и введи пароль В ПОСЛЕДНИЙ РАЗ: $ServerPassword" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. После этого используй команду:" -ForegroundColor Green
Write-Host "   ssh lumeai" -ForegroundColor Cyan
Write-Host "   (без пароля!)" -ForegroundColor Gray
Write-Host ""
Write-Host "✓ Команда скопирована в буфер обмена!" -ForegroundColor Green
Write-Host ""
Write-Host "Нажми Enter для завершения..."
$null = Read-Host
