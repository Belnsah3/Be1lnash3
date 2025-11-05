# 🚀 LumeAI - Скрипт автоматического деплоя

param(
    [string]$Message = "Update project"
)

Write-Host "🚀 LumeAI Deploy Script" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan
Write-Host ""

# Проверка Git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git не установлен!" -ForegroundColor Red
    Write-Host "Установи Git: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

# 1. Проверка изменений
Write-Host "📝 Проверка изменений..." -ForegroundColor Yellow
$status = git status --porcelain

if (-not $status) {
    Write-Host "✅ Нет изменений для коммита" -ForegroundColor Green
    
    # Спросить, обновить ли сервер
    $update = Read-Host "Обновить сервер? (y/n)"
    if ($update -eq "y") {
        Write-Host ""
        Write-Host "📡 Обновление сервера..." -ForegroundColor Yellow
        ssh root@147.45.48.64 "cd ~/rest-api && git pull && ./restart.sh app"
        Write-Host "✅ Сервер обновлен!" -ForegroundColor Green
    }
    exit 0
}

Write-Host "Изменено файлов: $($status.Count)" -ForegroundColor Cyan
Write-Host ""

# 2. Показать изменения
Write-Host "📋 Измененные файлы:" -ForegroundColor Yellow
git status --short
Write-Host ""

# 3. Добавить все файлы
Write-Host "➕ Добавление файлов в Git..." -ForegroundColor Yellow
git add .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ошибка при добавлении файлов" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Файлы добавлены" -ForegroundColor Green
Write-Host ""

# 4. Создать коммит
Write-Host "💾 Создание коммита: '$Message'" -ForegroundColor Yellow
git commit -m $Message

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ошибка при создании коммита" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Коммит создан" -ForegroundColor Green
Write-Host ""

# 5. Загрузить на GitHub
Write-Host "⬆️  Загрузка на GitHub..." -ForegroundColor Yellow
git push

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ошибка при загрузке на GitHub" -ForegroundColor Red
    Write-Host ""
    Write-Host "Возможные причины:" -ForegroundColor Yellow
    Write-Host "  1. Не настроен remote: git remote add origin <url>" -ForegroundColor White
    Write-Host "  2. Нет прав доступа: проверь токен или SSH ключ" -ForegroundColor White
    Write-Host "  3. Нет интернета" -ForegroundColor White
    exit 1
}

Write-Host "✅ Загружено на GitHub" -ForegroundColor Green
Write-Host ""

# 6. Обновить сервер
$deployToServer = Read-Host "Обновить сервер? (y/n, по умолчанию y)"

if ($deployToServer -eq "" -or $deployToServer -eq "y") {
    Write-Host ""
    Write-Host "📡 Подключение к серверу..." -ForegroundColor Yellow
    
    # Проверка SSH
    $sshTest = ssh -o ConnectTimeout=5 root@147.45.48.64 "echo OK" 2>$null
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Не удалось подключиться к серверу" -ForegroundColor Red
        Write-Host "Проверь:" -ForegroundColor Yellow
        Write-Host "  1. Сервер доступен: ping 147.45.48.64" -ForegroundColor White
        Write-Host "  2. SSH работает: ssh root@147.45.48.64" -ForegroundColor White
        exit 1
    }
    
    Write-Host "✅ Подключено к серверу" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔄 Обновление кода на сервере..." -ForegroundColor Yellow
    
    # Выполнить команды на сервере
    ssh root@147.45.48.64 @"
cd ~/rest-api
echo '📥 Скачивание изменений...'
git pull
echo ''
echo '📦 Установка зависимостей...'
npm install --production
echo ''
echo '🔄 Перезапуск приложения...'
./restart.sh app
"@
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Сервер успешно обновлен!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🌐 Проверь: https://lumeai.ru" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "⚠️  Возможны ошибки при обновлении сервера" -ForegroundColor Yellow
        Write-Host "Проверь логи: ssh root@147.45.48.64 'pm2 logs lumeai'" -ForegroundColor White
    }
} else {
    Write-Host ""
    Write-Host "⏭️  Пропущено обновление сервера" -ForegroundColor Yellow
    Write-Host "Для обновления вручную:" -ForegroundColor White
    Write-Host "  ssh root@147.45.48.64" -ForegroundColor Cyan
    Write-Host "  cd ~/rest-api && git pull && ./restart.sh app" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "🎉 Готово!" -ForegroundColor Green
Write-Host ""
