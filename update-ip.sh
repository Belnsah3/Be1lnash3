#!/bin/bash

# Скрипт для замены localhost на IP сервера
# Использование: ./update-ip.sh

SERVER_IP="lumeai.ru"

echo "🔄 Обновление IP адреса на $SERVER_IP..."
echo ""

# Список файлов для обновления
FILES=(
    "README.md"
    "API_ENDPOINTS.md"
    "KILO_CODE_SETUP.md"
    "QUICK_START.md"
    "UBUNTU_INSTALL.md"
    "SWAGGER_DOCS.md"
    "FIX_SQLITE_ERROR.md"
    "install.sh"
    "setup_ubuntu.py"
    "test-mock.js"
    "src/config/swagger.js"
    "src/routes/endpoints.js"
)

# Замена localhost на IP
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "📝 Обновление $file..."
        sed -i "s/localhost/$SERVER_IP/g" "$file"
        sed -i "s/127.0.0.1/$SERVER_IP/g" "$file"
    fi
done

echo ""
echo "✅ Готово! Все файлы обновлены с IP: $SERVER_IP"
echo ""
echo "🌐 Теперь используй:"
echo "   http://$SERVER_IP:3000"
