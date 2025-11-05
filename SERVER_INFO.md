# 🌐 **LumeAI - Информация о сервере**

## 📍 **IP адрес сервера**

```
lumeai.ru
```

---

## 🌐 **URL адреса**

### **Веб-интерфейс:**
- **Главная:** https://lumeai.ru/
- **Вход:** https://lumeai.ru/login
- **Dashboard:** https://lumeai.ru/dashboard
- **Swagger Docs:** https://lumeai.ru/api-docs

### **API Endpoints:**
- **Основной:** https://lumeai.ru/api/v1/ai/chat/completions
- **OpenAI-совместимый:** https://lumeai.ru/v1/chat/completions
- **Kilo Code:** https://lumeai.ru/v1/responses
- **Модели:** https://lumeai.ru/v1/models

---

## 🔑 **Учетные данные**

### **Супер-админ:**
```
Username: Be1lnash3
Password: Zaza_0203!
```

### **Обычный пользователь:**
```
Username: Be1lnash
Password: Zaza_0203!
```

---

## 🎯 **Настройка клиентов**

### **Kilo Code:**
```
Provider: Custom OpenAI / OpenAI Compatible
Base URL: https://lumeai.ru
API Key: sk-ваш-ключ
Model: gpt-4
```

### **ChatGPT Desktop:**
```
Endpoint: https://lumeai.ru/v1/chat/completions
API Key: sk-ваш-ключ
Model: gpt-4
```

### **Continue (VS Code):**
```json
{
  "models": [{
    "title": "LumeAI",
    "provider": "openai",
    "model": "gpt-4",
    "apiBase": "https://lumeai.ru/v1",
    "apiKey": "sk-ваш-ключ"
  }]
}
```

### **LangChain (Python):**
```python
from langchain.chat_models import ChatOpenAI

llm = ChatOpenAI(
    openai_api_base="https://lumeai.ru/v1",
    openai_api_key="sk-ваш-ключ",
    model_name="gpt-4"
)
```

### **curl:**
```bash
curl https://lumeai.ru/v1/chat/completions \
  -H "Authorization: Bearer sk-ваш-ключ" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "Привет!"}]
  }'
```

---

## 🔒 **Безопасность**

### **Файрвол:**
```bash
# Открыть порт 3000
sudo ufw allow 3000/tcp

# Проверить статус
sudo ufw status
```

### **Nginx (опционально):**
```bash
# Установка Nginx
sudo apt-get install -y nginx

# Конфигурация для LumeAI
sudo nano /etc/nginx/sites-available/lumeai
```

**Конфигурация:**
```nginx
server {
    listen 80;
    server_name lumeai.ru;

    location / {
        proxy_pass https://lumeai.ru;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 📊 **Мониторинг**

### **Проверка статуса:**
```bash
# Проверка что сервер работает
curl https://lumeai.ru/api/v1/models

# Проверка процессов
ps aux | grep node

# Логи
pm2 logs  # если используешь PM2
```

### **PM2 (рекомендуется):**
```bash
# Установка PM2
npm install -g pm2

# Запуск
pm2 start src/server.js --name lumeai

# Автозапуск при перезагрузке
pm2 startup
pm2 save

# Мониторинг
pm2 monit
```

---

## 🔄 **Обновление IP адреса**

Если IP изменится, запусти:

```bash
# На сервере
cd ~/rest-api
chmod +x update-ip.sh
./update-ip.sh
```

Или:

```bash
python3 update-ip.py
```

---

## 📞 **Полезные команды**

### **Перезапуск сервера:**
```bash
pm2 restart lumeai
# или
npm start
```

### **Остановка:**
```bash
pm2 stop lumeai
```

### **Логи:**
```bash
pm2 logs lumeai
```

### **Обновление кода:**
```bash
cd ~/rest-api
git pull
npm install
pm2 restart lumeai
```

---

## ✨ **Готово!**

**Сервер доступен по адресу:**
```
https://lumeai.ru
```

**API документация:**
```
https://lumeai.ru/api-docs
```

**Войти в панель:**
```
https://lumeai.ru/login
Username: Be1lnash3
Password: Zaza_0203!
```

---

**LumeAI работает на твоем VPS!** 🚀
