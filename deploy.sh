#!/bin/bash

# Скрипт для обновления и перезапуска LumeAI на сервере
# Использование: ./deploy.sh

echo "🚀 Обновление и перезапуск LumeAI..."
echo ""

# Цвета
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Проверка что мы в правильной директории
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json не найден. Перейди в директорию rest-api${NC}"
    exit 1
fi

# Получение обновлений из Git (если используется)
if [ -d ".git" ]; then
    echo -e "${BLUE}📥 Получение обновлений из Git...${NC}"
    git pull
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}⚠️  Git pull завершился с ошибкой, продолжаем...${NC}"
    fi
fi

# Установка зависимостей
echo -e "${BLUE}📦 Проверка зависимостей...${NC}"
npm install

# Пересборка native модулей
echo -e "${BLUE}🔧 Пересборка native модулей...${NC}"
npm rebuild

# Перезапуск сервера
echo ""
echo -e "${BLUE}🔄 Перезапуск сервера...${NC}"

# Проверка наличия PM2
if command -v pm2 &> /dev/null; then
    echo -e "${GREEN}✅ Используем PM2${NC}"
    
    # Проверка запущен ли процесс
    if pm2 list | grep -q "lumeai"; then
        pm2 restart lumeai
        echo -e "${GREEN}✅ Сервер перезапущен через PM2${NC}"
    else
        pm2 start src/server.js --name lumeai
        echo -e "${GREEN}✅ Сервер запущен через PM2${NC}"
    fi
    
    # Показать статус
    pm2 status lumeai
    
else
    echo -e "${YELLOW}⚠️  PM2 не установлен, останавливаем Node.js процессы...${NC}"
    
    # Остановка всех Node.js процессов
    pkill -9 node
    sleep 2
    
    # Запуск в фоне
    nohup npm start > server.log 2>&1 &
    echo -e "${GREEN}✅ Сервер запущен в фоне${NC}"
    echo -e "${BLUE}📝 Логи: tail -f server.log${NC}"
fi

echo ""
echo -e "${GREEN}✅ Обновление завершено!${NC}"
echo ""
echo -e "${BLUE}🌐 Сервер доступен по адресу:${NC}"
echo -e "   https://lumeai.ru"
echo ""
echo -e "${BLUE}📊 Проверка:${NC}"
echo -e "   curl https://lumeai.ru/v1/models"
echo ""

# Проверка что сервер работает
sleep 3
if curl -s https://lumeai.ru/v1/models > /dev/null; then
    echo -e "${GREEN}✅ Сервер работает!${NC}"
else
    echo -e "${RED}❌ Сервер не отвечает. Проверь логи:${NC}"
    if command -v pm2 &> /dev/null; then
        echo -e "   pm2 logs lumeai"
    else
        echo -e "   tail -f server.log"
    fi
fi
