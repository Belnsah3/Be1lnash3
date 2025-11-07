# 🚀 Скрипт для запуска обоих сервисов

Write-Host "🚀 Запуск LumeAI REST API с Python G4F" -ForegroundColor Cyan
Write-Host ""

# Проверка Python
Write-Host "🐍 Проверка Python..." -ForegroundColor Yellow
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Python найден: $pythonVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Python не найден! Установи Python 3.8+" -ForegroundColor Red
    exit 1
}

# Проверка Node.js
Write-Host "📦 Проверка Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Node.js найден: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js не найден! Установи Node.js 16+" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

# Запуск Python G4F в фоне
Write-Host "🐍 Запуск Python G4F API (порт 5000)..." -ForegroundColor Yellow
$pythonJob = Start-Job -ScriptBlock {
    Set-Location "d:\bukkit\rest-api\python-g4f"
    
    # Активация venv
    if (Test-Path "venv\Scripts\Activate.ps1") {
        & "venv\Scripts\Activate.ps1"
    } else {
        Write-Host "⚠️ Виртуальное окружение не найдено, создаю..." -ForegroundColor Yellow
        python -m venv venv
        & "venv\Scripts\Activate.ps1"
        pip install -r requirements.txt
    }
    
    # Запуск
    uvicorn main:app --host 0.0.0.0 --port 5000 --reload
}

Write-Host "✅ Python G4F запущен в фоне (Job ID: $($pythonJob.Id))" -ForegroundColor Green

# Ждем 5 секунд чтобы Python запустился
Write-Host "⏳ Ожидание запуска Python G4F (5 сек)..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Проверка Python G4F
Write-Host "🔍 Проверка Python G4F..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method Get -TimeoutSec 5
    if ($response.status -eq "ok") {
        Write-Host "✅ Python G4F работает!" -ForegroundColor Green
        Write-Host "   Статус: $($response.status)" -ForegroundColor Gray
        Write-Host "   Сервис: $($response.service)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Python G4F не отвечает!" -ForegroundColor Red
    Write-Host "   Проверь логи Job ID: $($pythonJob.Id)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

# Запуск Node.js
Write-Host "📦 Запуск Node.js REST API (порт 3000)..." -ForegroundColor Yellow
Set-Location "d:\bukkit\rest-api"

# Проверка node_modules
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠️ node_modules не найдены, устанавливаю..." -ForegroundColor Yellow
    npm install
}

# Запуск в фоне
$nodeJob = Start-Job -ScriptBlock {
    Set-Location "d:\bukkit\rest-api"
    npm run dev
}

Write-Host "✅ Node.js запущен в фоне (Job ID: $($nodeJob.Id))" -ForegroundColor Green

# Ждем 3 секунды
Write-Host "⏳ Ожидание запуска Node.js (3 сек)..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Проверка Node.js
Write-Host "🔍 Проверка Node.js API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/" -Method Get -TimeoutSec 5
    Write-Host "✅ Node.js API работает!" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js API не отвечает!" -ForegroundColor Red
    Write-Host "   Проверь логи Job ID: $($nodeJob.Id)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 Оба сервиса запущены!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Информация:" -ForegroundColor Cyan
Write-Host "   🐍 Python G4F:  http://localhost:5000" -ForegroundColor Gray
Write-Host "      - Health:    http://localhost:5000/health" -ForegroundColor Gray
Write-Host "      - Docs:      http://localhost:5000/docs" -ForegroundColor Gray
Write-Host "      - Job ID:    $($pythonJob.Id)" -ForegroundColor Gray
Write-Host ""
Write-Host "   📦 Node.js API: http://localhost:3000" -ForegroundColor Gray
Write-Host "      - Dashboard: http://localhost:3000/dashboard" -ForegroundColor Gray
Write-Host "      - API Docs:  http://localhost:3000/api-docs" -ForegroundColor Gray
Write-Host "      - Job ID:    $($nodeJob.Id)" -ForegroundColor Gray
Write-Host ""
Write-Host "💡 Команды:" -ForegroundColor Cyan
Write-Host "   Просмотр логов Python: Receive-Job -Id $($pythonJob.Id) -Keep" -ForegroundColor Gray
Write-Host "   Просмотр логов Node:   Receive-Job -Id $($nodeJob.Id) -Keep" -ForegroundColor Gray
Write-Host "   Остановить Python:     Stop-Job -Id $($pythonJob.Id)" -ForegroundColor Gray
Write-Host "   Остановить Node:       Stop-Job -Id $($nodeJob.Id)" -ForegroundColor Gray
Write-Host "   Остановить все:        Get-Job | Stop-Job" -ForegroundColor Gray
Write-Host ""
Write-Host "🧪 Тест запрос:" -ForegroundColor Cyan
Write-Host '   curl http://localhost:3000/api/v1/ai/models -H "Authorization: Bearer твой-ключ"' -ForegroundColor Gray
Write-Host ""
Write-Host "✨ Нажми Ctrl+C для выхода (сервисы продолжат работать в фоне)" -ForegroundColor Yellow
Write-Host ""

# Держим скрипт открытым
Write-Host "⏳ Мониторинг сервисов... (Ctrl+C для выхода)" -ForegroundColor Cyan
try {
    while ($true) {
        Start-Sleep -Seconds 10
        
        # Проверка статуса
        $pythonStatus = (Get-Job -Id $pythonJob.Id).State
        $nodeStatus = (Get-Job -Id $nodeJob.Id).State
        
        Write-Host "$(Get-Date -Format 'HH:mm:ss') | Python: $pythonStatus | Node: $nodeStatus" -ForegroundColor Gray
        
        # Если какой-то упал - сообщаем
        if ($pythonStatus -eq "Failed") {
            Write-Host "❌ Python G4F упал! Проверь логи: Receive-Job -Id $($pythonJob.Id)" -ForegroundColor Red
        }
        if ($nodeStatus -eq "Failed") {
            Write-Host "❌ Node.js упал! Проверь логи: Receive-Job -Id $($nodeJob.Id)" -ForegroundColor Red
        }
    }
} finally {
    Write-Host ""
    Write-Host "👋 Выход... Сервисы продолжают работать в фоне" -ForegroundColor Yellow
    Write-Host "   Для остановки: Get-Job | Stop-Job" -ForegroundColor Gray
}
