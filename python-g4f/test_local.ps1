# Тестирование Python G4F локально

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "  Python G4F Local Test" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

# Проверка Python
Write-Host "[1/5] Проверка Python..." -ForegroundColor Yellow
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Python не установлен!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ $pythonVersion" -ForegroundColor Green
Write-Host ""

# Создание venv если нет
if (!(Test-Path "venv")) {
    Write-Host "[2/5] Создание виртуального окружения..." -ForegroundColor Yellow
    python -m venv venv
    Write-Host "✓ Создано" -ForegroundColor Green
} else {
    Write-Host "[2/5] Виртуальное окружение существует" -ForegroundColor Green
}
Write-Host ""

# Активация venv
Write-Host "[3/5] Активация виртуального окружения..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1
Write-Host "✓ Активировано" -ForegroundColor Green
Write-Host ""

# Установка зависимостей
Write-Host "[4/5] Установка зависимостей..." -ForegroundColor Yellow
pip install -q -r requirements.txt
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Зависимости установлены" -ForegroundColor Green
} else {
    Write-Host "⚠ Возможны проблемы с установкой" -ForegroundColor Yellow
}
Write-Host ""

# Тестирование провайдеров
Write-Host "[5/5] Тестирование провайдеров..." -ForegroundColor Yellow
Write-Host ""
python test_providers.py
Write-Host ""

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "✅ Тест завершен!" -ForegroundColor Green
Write-Host ""
Write-Host "Для запуска API сервера используй:" -ForegroundColor Yellow
Write-Host "  .\start.ps1" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
