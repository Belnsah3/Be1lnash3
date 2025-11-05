# 🐧 **LumeAI - Установка на Ubuntu**

## 🚀 **Быстрая установка (рекомендуется)**

### **Метод 1: Bash скрипт**

```bash
# Клонируй репозиторий (или загрузи файлы)
cd /path/to/rest-api

# Дай права на выполнение
chmod +x install.sh

# Запусти установку
./install.sh
```

### **Метод 2: Python скрипт**

```bash
# Установи Python 3 (если нет)
sudo apt-get update
sudo apt-get install -y python3

# Дай права на выполнение
chmod +x setup_ubuntu.py

# Запусти установку
python3 setup_ubuntu.py
```

---

## 📋 **Ручная установка**

### **Шаг 1: Обновление системы**

```bash
sudo apt-get update
sudo apt-get upgrade -y
```

### **Шаг 2: Установка Node.js 20.x**

```bash
# Добавление репозитория NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Установка Node.js
sudo apt-get install -y nodejs

# Проверка установки
node --version  # должно быть v20.x.x
npm --version
```

### **Шаг 3: Установка зависимостей проекта**

```bash
# Перейди в директорию проекта
cd /path/to/rest-api

# Установи npm зависимости
npm install
```

### **Шаг 4: Создание директории для БД**

```bash
mkdir -p data
```

### **Шаг 5: Настройка переменных окружения**

```bash
# Создай файл .env
cat > .env << EOF
PORT=3000
NODE_ENV=production
SESSION_SECRET=$(openssl rand -hex 32)
EOF
```

### **Шаг 6: Запуск сервера**

```bash
npm start
```

---

## 🔧 **Настройка для продакшена**

### **1. Создание systemd сервиса**

```bash
# Создай файл сервиса
sudo nano /etc/systemd/system/lumeai.service
```

Вставь следующее содержимое:

```ini
[Unit]
Description=LumeAI API Service
After=network.target

[Service]
Type=simple
User=YOUR_USERNAME
WorkingDirectory=/path/to/rest-api
ExecStart=/usr/bin/node /path/to/rest-api/src/server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Замени:
- `YOUR_USERNAME` на твое имя пользователя
- `/path/to/rest-api` на реальный путь

```bash
# Перезагрузи systemd
sudo systemctl daemon-reload

# Включи автозапуск
sudo systemctl enable lumeai

# Запусти сервис
sudo systemctl start lumeai

# Проверь статус
sudo systemctl status lumeai
```

### **2. Настройка Nginx (опционально)**

```bash
# Установи Nginx
sudo apt-get install -y nginx

# Создай конфигурацию
sudo nano /etc/nginx/sites-available/lumeai
```

Вставь:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass https://lumeai.ru;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Активируй конфигурацию
sudo ln -s /etc/nginx/sites-available/lumeai /etc/nginx/sites-enabled/

# Проверь конфигурацию
sudo nginx -t

# Перезагрузи Nginx
sudo systemctl reload nginx
```

### **3. Настройка SSL с Let's Encrypt**

```bash
# Установи Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Получи сертификат
sudo certbot --nginx -d your-domain.com

# Автообновление сертификата
sudo certbot renew --dry-run
```

---

## 🔥 **Настройка файрвола**

```bash
# Разрешить SSH
sudo ufw allow ssh

# Разрешить HTTP и HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Разрешить порт приложения (если нет Nginx)
sudo ufw allow 3000/tcp

# Включить файрвол
sudo ufw enable

# Проверить статус
sudo ufw status
```

---

## 📊 **Мониторинг и логи**

### **Просмотр логов systemd:**

```bash
# Все логи
sudo journalctl -u lumeai

# Последние 100 строк
sudo journalctl -u lumeai -n 100

# Следить за логами в реальном времени
sudo journalctl -u lumeai -f
```

### **Управление сервисом:**

```bash
# Запуск
sudo systemctl start lumeai

# Остановка
sudo systemctl stop lumeai

# Перезапуск
sudo systemctl restart lumeai

# Статус
sudo systemctl status lumeai
```

---

## 🔑 **Учетные данные**

### **Супер-администратор:**
```
Username: Be1lnash3
Email: sahsaxboxvanx@gmail.com
Password: Zaza_0203!
```

### **Обычный пользователь:**
```
Username: Be1lnash
Email: Sahsaxboxvan@gmail.com
Password: Zaza_0203!
```

---

## 🧪 **Проверка установки**

```bash
# Проверка Node.js
node --version

# Проверка npm
npm --version

# Проверка сервера
curl https://lumeai.ru/api

# Проверка с другого компьютера
curl http://your-server-ip:3000/api
```

---

## 🆘 **Решение проблем**

### **⚠️ Проблема: SQLite3 ошибка "invalid ELF header"**

**Ошибка:**
```
Error: /root/rest-api/node_modules/sqlite3/build/Release/node_sqlite3.node: invalid ELF header
```

**Причина:** Native модули скомпилированы для другой архитектуры.

**Решение:**
```bash
cd ~/rest-api
npm rebuild
npm start
```

**Если не помогло:**
```bash
rm -rf node_modules package-lock.json
sudo apt-get install -y build-essential python3 make g++
npm install
npm rebuild
npm start
```

**Подробнее:** [FIX_SQLITE_ERROR.md](FIX_SQLITE_ERROR.md)

---

### **Проблема: Порт 3000 занят**

```bash
# Найти процесс
sudo lsof -i :3000

# Убить процесс
sudo kill -9 PID
```

### **Проблема: Нет прав на директорию**

```bash
# Дать права
sudo chown -R $USER:$USER /path/to/rest-api
```

### **Проблема: База данных не создается**

```bash
# Проверить права
ls -la data/

# Создать директорию заново
rm -rf data/
mkdir data
```

### **Проблема: npm install падает**

```bash
# Очистить кэш
npm cache clean --force

# Удалить node_modules
rm -rf node_modules package-lock.json

# Установить заново
npm install
```

---

## 📦 **Резервное копирование**

### **Бэкап базы данных:**

```bash
# Создать бэкап
cp data/api.db data/api.db.backup

# Или с датой
cp data/api.db data/api.db.$(date +%Y%m%d_%H%M%S)
```

### **Автоматический бэкап (cron):**

```bash
# Открыть crontab
crontab -e

# Добавить строку (бэкап каждый день в 3:00)
0 3 * * * cp /path/to/rest-api/data/api.db /path/to/backups/api.db.$(date +\%Y\%m\%d)
```

---

## 🚀 **Готово!**

**Сервер запущен на:**
- Локально: https://lumeai.ru
- В сети: http://your-server-ip:3000

**Документация:**
- Swagger: https://lumeai.ru/api-docs

**Панель управления:**
- Login: https://lumeai.ru/login
- Dashboard: https://lumeai.ru/dashboard

---

## 📞 **Полезные команды**

```bash
# Проверка статуса
sudo systemctl status lumeai

# Просмотр логов
sudo journalctl -u lumeai -f

# Перезапуск
sudo systemctl restart lumeai

# Обновление кода
git pull
npm install
sudo systemctl restart lumeai

# Проверка портов
sudo netstat -tulpn | grep :3000
```

---

**LumeAI готов к работе на Ubuntu!** 🎉
