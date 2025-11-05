#!/bin/bash

# LumeAI - Быстрая установка на Ubuntu
# Использование: bash install.sh

set -e

# Цвета
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         🚀 LumeAI - Установка на Ubuntu                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Проверка ОС
if [ ! -f /etc/os-release ]; then
    echo -e "${RED}❌ Не удалось определить ОС${NC}"
    exit 1
fi

source /etc/os-release
echo -e "${GREEN}✅ ОС: $PRETTY_NAME${NC}"

# Обновление системы
echo ""
echo -e "${BLUE}📦 Обновление системы...${NC}"
sudo apt-get update -qq

# Установка необходимых пакетов
echo -e "${BLUE}📦 Установка базовых пакетов...${NC}"
sudo apt-get install -y curl git build-essential python3 python3-pip make g++

# Проверка Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js уже установлен: $NODE_VERSION${NC}"
else
    echo -e "${BLUE}📦 Установка Node.js 20.x...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
    echo -e "${GREEN}✅ Node.js установлен: $(node --version)${NC}"
fi

# Установка npm зависимостей
echo ""
echo -e "${BLUE}📦 Установка npm зависимостей...${NC}"
npm install

echo "🔧 Пересборка native модулей для текущей системы..."
npm rebuild

# Создание директории data
if [ ! -d "data" ]; then
    mkdir -p data
    echo -e "${GREEN}✅ Создана директория data/${NC}"
fi

# Создание .env файла
if [ ! -f ".env" ]; then
    echo -e "${BLUE}📝 Создание .env файла...${NC}"
    cat > .env << EOF
PORT=3000
NODE_ENV=production
SESSION_SECRET=$(openssl rand -hex 32)
EOF
    echo -e "${GREEN}✅ Создан .env файл${NC}"
else
    echo -e "${YELLOW}⚠️  .env файл уже существует${NC}"
fi

# Информация об установке
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              ✅ Установка завершена!                       ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}🔑 Учетные данные:${NC}"
echo ""
echo -e "${GREEN}Супер-админ:${NC}"
echo "  Username: Be1lnash3"
echo "  Password: Zaza_0203!"
echo ""
echo -e "${GREEN}Обычный пользователь:${NC}"
echo "  Username: Be1lnash"
echo "  Password: Zaza_0203!"
echo ""
echo -e "${BLUE}🚀 Запуск:${NC}"
echo "  npm start"
echo ""
echo -e "${BLUE}📚 Документация:${NC}"
echo "  https://lumeai.ru/api-docs"
echo ""

# Предложение запустить
read -p "Запустить сервер сейчас? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}🚀 Запуск сервера...${NC}"
    npm start
fi
