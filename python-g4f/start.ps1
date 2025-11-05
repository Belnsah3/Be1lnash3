# PowerShell скрипт для запуска G4F Python API

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "  Запуск G4F Python FastAPI сервиса" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

# Проверка Python
Write-Host "Проверка Python..." -ForegroundColor Yellow
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Python не установлен!" -ForegroundColor Red
    Write-Host "Установите Python 3.10+: https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ $pythonVersion" -ForegroundColor Green
Write-Host ""

# Проверка виртуального окружения
if (!(Test-Path "venv")) {
    Write-Host "Создание виртуального окружения..." -ForegroundColor Yellow
    python -m venv venv
    Write-Host "✓ Виртуальное окружение создано" -ForegroundColor Green
}

# Активация виртуального окружения
Write-Host "Активация виртуального окружения..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1
Write-Host "✓ Виртуальное окружение активировано" -ForegroundColor Green
Write-Host ""

# Установка зависимостей
Write-Host "Установка зависимостей..." -ForegroundColor Yellow
pip install -r requirements.txt
Write-Host ""

# Запуск сервера
Write-Host "Запуск FastAPI сервера..." -ForegroundColor Green
Write-Host ""
Write-Host "Сервис будет доступен на:" -ForegroundColor Cyan
Write-Host "  http://localhost:5000" -ForegroundColor White
Write-Host "  http://localhost:5000/docs (Swagger UI)" -ForegroundColor White
Write-Host ""
Write-Host "Для остановки нажмите Ctrl+C" -ForegroundColor Gray
Write-Host ""
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

uvicorn main:app --host 0.0.0.0 --port 5000 --reload
