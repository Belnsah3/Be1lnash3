#!/bin/bash

# Быстрое исправление ошибки SQLite3 на Ubuntu
# Запусти: chmod +x QUICK_FIX.sh && ./QUICK_FIX.sh

echo "🔧 Исправление ошибки SQLite3..."
echo ""

# Цвета
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Проверка что мы в правильной директории
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json не найден. Перейди в директорию rest-api${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Установка build-essential...${NC}"
sudo apt-get update -qq
sudo apt-get install -y build-essential python3 python3-pip make g++

echo ""
echo -e "${BLUE}🔧 Пересборка native модулей...${NC}"
npm rebuild

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Исправление завершено!${NC}"
    echo ""
    echo -e "${BLUE}🚀 Запуск сервера...${NC}"
    npm start
else
    echo ""
    echo -e "${RED}❌ Ошибка при пересборке. Попробуем полную переустановку...${NC}"
    echo ""
    
    echo -e "${BLUE}🗑️  Удаление node_modules...${NC}"
    rm -rf node_modules package-lock.json
    
    echo -e "${BLUE}📦 Переустановка зависимостей...${NC}"
    npm install
    
    echo -e "${BLUE}🔧 Пересборка native модулей...${NC}"
    npm rebuild
    
    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✅ Исправление завершено!${NC}"
        echo ""
        echo -e "${BLUE}🚀 Запуск сервера...${NC}"
        npm start
    else
        echo ""
        echo -e "${RED}❌ Не удалось исправить. Смотри FIX_SQLITE_ERROR.md${NC}"
        exit 1
    fi
fi
