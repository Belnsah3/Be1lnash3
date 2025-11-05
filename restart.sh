#!/bin/bash

# 🔄 Скрипт для перезапуска LumeAI

echo "🔄 Перезапуск LumeAI..."
echo ""

# Проверка аргументов
case "$1" in
    app|node|pm2)
        echo "📦 Перезапуск Node.js приложения..."
        pm2 restart lumeai
        echo ""
        echo "📊 Статус:"
        pm2 status
        echo ""
        echo "📝 Последние логи:"
        pm2 logs lumeai --lines 10 --nostream
        ;;
    
    nginx|web)
        echo "🌐 Перезапуск Nginx..."
        nginx -t && systemctl reload nginx
        echo ""
        echo "✅ Nginx перезапущен"
        systemctl status nginx --no-pager -l
        ;;
    
    all|full)
        echo "🔄 Полный перезапуск всех сервисов..."
        echo ""
        echo "1️⃣ Перезапуск Node.js..."
        pm2 restart lumeai
        echo ""
        echo "2️⃣ Перезапуск Nginx..."
        nginx -t && systemctl reload nginx
        echo ""
        echo "✅ Всё перезапущено!"
        echo ""
        echo "📊 Статус сервисов:"
        pm2 status
        systemctl status nginx --no-pager -l | head -n 10
        ;;
    
    update|pull)
        echo "📥 Обновление кода с GitHub..."
        git pull
        echo ""
        echo "📦 Установка зависимостей..."
        npm install
        echo ""
        echo "🔄 Перезапуск приложения..."
        pm2 restart lumeai
        echo ""
        echo "✅ Обновление завершено!"
        pm2 logs lumeai --lines 10 --nostream
        ;;
    
    logs|log)
        echo "📝 Логи приложения:"
        pm2 logs lumeai --lines 50
        ;;
    
    status|check)
        echo "📊 Статус всех сервисов:"
        echo ""
        echo "=== PM2 ==="
        pm2 status
        echo ""
        echo "=== Nginx ==="
        systemctl status nginx --no-pager -l | head -n 10
        echo ""
        echo "=== Порты ==="
        netstat -tulpn | grep -E ':80|:443|:3000'
        ;;
    
    *)
        echo "🚀 LumeAI - Скрипт управления"
        echo ""
        echo "Использование: ./restart.sh [команда]"
        echo ""
        echo "Команды:"
        echo "  app, node, pm2    - Перезапуск Node.js приложения"
        echo "  nginx, web        - Перезапуск Nginx"
        echo "  all, full         - Перезапуск всего"
        echo "  update, pull      - Обновление с GitHub и перезапуск"
        echo "  logs, log         - Показать логи"
        echo "  status, check     - Проверить статус всех сервисов"
        echo ""
        echo "Примеры:"
        echo "  ./restart.sh app      # Перезапуск приложения"
        echo "  ./restart.sh all      # Перезапуск всего"
        echo "  ./restart.sh update   # Обновление с GitHub"
        echo "  ./restart.sh logs     # Просмотр логов"
        echo ""
        exit 1
        ;;
esac

echo ""
echo "✅ Готово!"
