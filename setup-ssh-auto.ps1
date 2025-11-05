# Автоматическая настройка SSH ключа (ОДИН РАЗ!)
# После выполнения пароль больше НЕ нужен

$ErrorActionPreference = "Stop"

Write-Host "=== Автоматическая настройка SSH ===" -ForegroundColor Cyan
Write-Host ""

# Параметры
$server = "147.45.48.64"
$user = "root"
$password = "24162006gorA!"
$sshDir = "$env:USERPROFILE\.ssh"
$keyPath = "$sshDir\lumeai_key"

# Создаем директорию
if (-not (Test-Path $sshDir)) {
    New-Item -ItemType Directory -Path $sshDir -Force | Out-Null
}

# Генерируем SSH ключ
if (-not (Test-Path $keyPath)) {
    Write-Host "[1/4] Создание SSH ключа..." -ForegroundColor Yellow
    ssh-keygen -t rsa -b 4096 -f $keyPath -N '""' -C "lumeai-auto" | Out-Null
    Write-Host "✓ SSH ключ создан!" -ForegroundColor Green
} else {
    Write-Host "[1/4] SSH ключ уже существует" -ForegroundColor Green
}

# Читаем публичный ключ
$publicKey = (Get-Content "$keyPath.pub" -Raw).Trim()

Write-Host ""
Write-Host "[2/4] Копирование ключа на сервер..." -ForegroundColor Yellow

# Используем plink (из PuTTY) если доступен, иначе показываем инструкцию
if (Get-Command plink -ErrorAction SilentlyContinue) {
    # Автоматически передаем пароль через plink
    $commands = @(
        "mkdir -p ~/.ssh",
        "chmod 700 ~/.ssh",
        "echo '$publicKey' >> ~/.ssh/authorized_keys",
        "chmod 600 ~/.ssh/authorized_keys"
    )
    
    foreach ($cmd in $commands) {
        echo "y" | plink -batch -pw $password $user@$server $cmd 2>$null
    }
    
    Write-Host "✓ SSH ключ установлен на сервер!" -ForegroundColor Green
} else {
    # Показываем команду для ручного выполнения
    Write-Host ""
    Write-Host "Выполни эту команду (пароль будет запрошен ОДИН раз):" -ForegroundColor Yellow
    Write-Host ""
    $manualCmd = "ssh $user@$server `"mkdir -p ~/.ssh && chmod 700 ~/.ssh && echo '$publicKey' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys`""
    Write-Host $manualCmd -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Пароль: $password" -ForegroundColor Gray
    Write-Host ""
    
    # Копируем в буфер
    Set-Clipboard -Value $manualCmd
    Write-Host "✓ Команда скопирована в буфер обмена!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Нажми Enter после выполнения команды..."
    Read-Host
}

Write-Host ""
Write-Host "[3/4] Настройка SSH config..." -ForegroundColor Yellow

# Создаем SSH config
$configPath = "$sshDir\config"
$configEntry = @"

# LumeAI Production Server
Host lumeai
    HostName $server
    User $user
    IdentityFile $keyPath
    IdentitiesOnly yes
    StrictHostKeyChecking no

Host $server
    User $user
    IdentityFile $keyPath
    IdentitiesOnly yes
    StrictHostKeyChecking no
"@

if (Test-Path $configPath) {
    $content = Get-Content $configPath -Raw
    if (-not $content.Contains("Host lumeai")) {
        Add-Content $configPath $configEntry
    }
} else {
    Set-Content $configPath $configEntry
}

Write-Host "✓ SSH config создан!" -ForegroundColor Green

Write-Host ""
Write-Host "[4/4] Проверка подключения..." -ForegroundColor Yellow

# Тестируем подключение
$testResult = ssh -o ConnectTimeout=5 -i $keyPath $user@$server "echo 'OK'" 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ SSH работает БЕЗ пароля!" -ForegroundColor Green
    Write-Host ""
    Write-Host "=== ГОТОВО! ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Теперь используй:" -ForegroundColor Cyan
    Write-Host "  • ssh lumeai           - подключение к серверу" -ForegroundColor White
    Write-Host "  • .\deploy.ps1         - автодеплой БЕЗ пароля" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "⚠ Требуется ручная настройка" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Выполни:" -ForegroundColor Cyan
    Write-Host "ssh-copy-id -i $keyPath $user@$server" -ForegroundColor White
    Write-Host "Пароль: $password" -ForegroundColor Gray
}

Write-Host ""
