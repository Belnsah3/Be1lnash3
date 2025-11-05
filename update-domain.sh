#!/bin/bash

# Скрипт для замены IP на домен lumeai.ru

echo "🌐 Обновление ссылок на домен lumeai.ru..."

# Замена в документации
find . -type f \( -name "*.md" -o -name "*.txt" \) -exec sed -i 's|http://147\.45\.48\.64:3000|https://lumeai.ru|g' {} +
find . -type f \( -name "*.md" -o -name "*.txt" \) -exec sed -i 's|147\.45\.48\.64:3000|lumeai.ru|g' {} +

# Замена в HTML файлах
find ./public -type f -name "*.html" -exec sed -i 's|http://147\.45\.48\.64:3000|https://lumeai.ru|g' {} +
find ./public -type f -name "*.html" -exec sed -i 's|147\.45\.48\.64:3000|lumeai.ru|g' {} +

# Замена в JS файлах
find ./public/js -type f -name "*.js" -exec sed -i 's|http://147\.45\.48\.64:3000|https://lumeai.ru|g' {} +
find ./public/js -type f -name "*.js" -exec sed -i 's|147\.45\.48\.64:3000|lumeai.ru|g' {} +

# Замена в конфигурации Swagger
find ./src/config -type f -name "*.js" -exec sed -i 's|http://147\.45\.48\.64:3000|https://lumeai.ru|g' {} +
find ./src/config -type f -name "*.js" -exec sed -i 's|147\.45\.48\.64:3000|lumeai.ru|g' {} +

echo "✅ Ссылки обновлены!"
echo ""
echo "📝 Проверь файлы:"
echo "   - public/dashboard.html"
echo "   - public/login.html"
echo "   - src/config/swagger.js"
echo "   - README.md"
echo ""
echo "🚀 Загрузи на сервер:"
echo "   git add ."
echo "   git commit -m 'Update domain to lumeai.ru'"
echo "   git push"
echo ""
echo "   ssh root@lumeai.ru 'cd ~/rest-api && git pull && pm2 restart lumeai'"
