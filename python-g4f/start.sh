#!/bin/bash

echo "===================================================="
echo "  Запуск G4F Python FastAPI сервиса"
echo "===================================================="
echo ""

# Проверка Python
echo "Проверка Python..."
if ! command -v python3 &> /dev/null; then
    echo "✗ Python не установлен!"
    echo "Установите Python 3.10+: https://www.python.org/downloads/"
    exit 1
fi
echo "✓ $(python3 --version)"
echo ""

# Проверка виртуального окружения
if [ ! -d "venv" ]; then
    echo "Создание виртуального окружения..."
    python3 -m venv venv
    echo "✓ Виртуальное окружение создано"
fi

# Активация виртуального окружения
echo "Активация виртуального окружения..."
source venv/bin/activate
echo "✓ Виртуальное окружение активировано"
echo ""

# Установка зависимостей
echo "Установка зависимостей..."
pip install -r requirements.txt
echo ""

# Запуск сервера
echo "Запуск FastAPI сервера..."
echo ""
echo "Сервис будет доступен на:"
echo "  http://localhost:5000"
echo "  http://localhost:5000/docs (Swagger UI)"
echo ""
echo "Для остановки нажмите Ctrl+C"
echo ""
echo "===================================================="
echo ""

uvicorn main:app --host 0.0.0.0 --port 5000 --reload
