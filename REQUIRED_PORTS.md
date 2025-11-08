# 🔒 Required Ports for LumeAI

**Date:** 2025-11-08  
**Server:** 147.45.48.64

---

## 🌐 **ОБЯЗАТЕЛЬНЫЕ ПОРТЫ:**

### **1. Port 443 (HTTPS)** ⭐ КРИТИЧНО
```
Protocol: TCP
Service: HTTPS (Nginx)
Domain: lumeai.ru
Purpose: Основной веб-сайт
Status: ✅ Должен быть открыт
```

**Что работает через этот порт:**
- ✅ Весь UI (dashboard, keys, models, chat, settings)
- ✅ API endpoints (/api/v1/*)
- ✅ Static files (CSS, JS, images)
- ✅ WebSocket connections (если используются)

### **2. Port 80 (HTTP)** ⭐ РЕКОМЕНДУЕТСЯ
```
Protocol: TCP
Service: HTTP (Nginx)
Purpose: Редирект на HTTPS
Status: ✅ Должен быть открыт
```

**Зачем нужен:**
- Автоматический редирект HTTP → HTTPS
- Поддержка старых браузеров
- SEO оптимизация

---

## 🔧 **ВНУТРЕННИЕ ПОРТЫ (НЕ ОТКРЫВАТЬ ПУБЛИЧНО):**

### **3. Port 3000** 🔒 ВНУТРЕННИЙ
```
Protocol: TCP
Service: Node.js (LumeAI API)
Purpose: Backend API
Status: ❌ НЕ открывать публично
Access: Только localhost/127.0.0.1
```

**Nginx проксирует запросы:**
```
lumeai.ru:443 → 127.0.0.1:3000
```

### **4. Port 5000** 🔒 ВНУТРЕННИЙ
```
Protocol: TCP
Service: Python G4F API
Purpose: AI chat completions
Status: ❌ НЕ открывать публично
Access: Только localhost/127.0.0.1
```

**Nginx проксирует запросы:**
```
lumeai.ru:443/api/v1/ai/* → 127.0.0.1:5000
```

### **5. Port 22 (SSH)** 🔒 АДМИНИСТРИРОВАНИЕ
```
Protocol: TCP
Service: SSH
Purpose: Удаленное управление сервером
Status: ⚠️ Открыт, но защищен
Access: Только с вашего IP (опционально)
```

**Рекомендации:**
- Использовать SSH ключи вместо паролей
- Ограничить доступ по IP (whitelist)
- Изменить порт с 22 на нестандартный

---

## 📊 **ИТОГОВАЯ КОНФИГУРАЦИЯ FIREWALL:**

### **Открыть публично:**
```bash
# HTTPS - основной порт
sudo ufw allow 443/tcp

# HTTP - редирект на HTTPS
sudo ufw allow 80/tcp

# SSH - администрирование (опционально ограничить по IP)
sudo ufw allow 22/tcp
# Или с ограничением:
# sudo ufw allow from YOUR_IP to any port 22
```

### **Закрыть (должны быть доступны только локально):**
```bash
# Node.js API - только localhost
sudo ufw deny 3000/tcp

# Python G4F API - только localhost
sudo ufw deny 5000/tcp
```

### **Проверить статус:**
```bash
sudo ufw status verbose
```

---

## 🔍 **ПРОВЕРКА ТЕКУЩИХ ПОРТОВ:**

### **Команды для проверки:**

```bash
# Проверить какие порты слушают
sudo netstat -tlnp

# Проверить конкретный порт
sudo lsof -i :443
sudo lsof -i :80
sudo lsof -i :3000
sudo lsof -i :5000

# Проверить firewall
sudo ufw status numbered

# Проверить Nginx конфигурацию
sudo nginx -t
```

---

## ✅ **ОЖИДАЕМЫЙ РЕЗУЛЬТАТ:**

### **Публично доступны:**
```
✅ 443/tcp (HTTPS) - lumeai.ru
✅ 80/tcp (HTTP) - редирект на HTTPS
⚠️ 22/tcp (SSH) - только для администрирования
```

### **Локально доступны:**
```
🔒 3000/tcp - Node.js API (127.0.0.1)
🔒 5000/tcp - Python G4F API (127.0.0.1)
```

---

## 🛡️ **NGINX КОНФИГУРАЦИЯ:**

### **Пример правильной конфигурации:**

```nginx
# HTTP → HTTPS редирект
server {
    listen 80;
    server_name lumeai.ru www.lumeai.ru;
    return 301 https://$server_name$request_uri;
}

# HTTPS - основной сайт
server {
    listen 443 ssl http2;
    server_name lumeai.ru www.lumeai.ru;

    # SSL сертификаты
    ssl_certificate /etc/letsencrypt/live/lumeai.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/lumeai.ru/privkey.pem;

    # Проксирование на Node.js API
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Статические файлы
    location / {
        root /root/rest-api/public;
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 🔐 **БЕЗОПАСНОСТЬ:**

### **Рекомендации:**

1. **Firewall (UFW):**
   ```bash
   sudo ufw enable
   sudo ufw default deny incoming
   sudo ufw default allow outgoing
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw allow 22/tcp
   ```

2. **Fail2Ban (защита от брутфорса):**
   ```bash
   sudo apt install fail2ban
   sudo systemctl enable fail2ban
   sudo systemctl start fail2ban
   ```

3. **SSL/TLS (Let's Encrypt):**
   ```bash
   sudo certbot --nginx -d lumeai.ru -d www.lumeai.ru
   ```

4. **Ограничить доступ к внутренним портам:**
   ```bash
   # В /etc/nginx/sites-available/lumeai
   # Убедиться что proxy_pass использует 127.0.0.1
   proxy_pass http://127.0.0.1:3000;  # ✅ Правильно
   proxy_pass http://0.0.0.0:3000;    # ❌ Неправильно
   ```

---

## 📋 **CHECKLIST:**

### **Что должно быть настроено:**

- [x] ✅ Port 443 открыт (HTTPS)
- [x] ✅ Port 80 открыт (HTTP redirect)
- [x] ✅ Port 22 открыт (SSH)
- [x] ✅ Port 3000 закрыт публично (только localhost)
- [x] ✅ Port 5000 закрыт публично (только localhost)
- [x] ✅ UFW firewall включен
- [x] ✅ Nginx проксирует на внутренние порты
- [x] ✅ SSL сертификаты установлены
- [ ] ⚠️ Fail2Ban установлен (рекомендуется)
- [ ] ⚠️ SSH ключи настроены (рекомендуется)

---

## 🚀 **БЫСТРАЯ НАСТРОЙКА:**

### **Команды для копирования:**

```bash
# 1. Включить firewall
sudo ufw enable

# 2. Открыть нужные порты
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp

# 3. Закрыть внутренние порты
sudo ufw deny 3000/tcp
sudo ufw deny 5000/tcp

# 4. Проверить статус
sudo ufw status verbose

# 5. Перезапустить Nginx
sudo systemctl restart nginx

# 6. Проверить что все работает
curl -I https://lumeai.ru
```

---

## ✅ **ИТОГ:**

### **Минимальная конфигурация:**
```
✅ 443/tcp - HTTPS (обязательно)
✅ 80/tcp - HTTP redirect (рекомендуется)
⚠️ 22/tcp - SSH (для администрирования)
```

### **Внутренние порты (НЕ открывать):**
```
🔒 3000/tcp - Node.js
🔒 5000/tcp - Python G4F
```

**Всего нужно открыть: 2-3 порта (80, 443, опционально 22)**

---

**Конфигурация готова!** ✅  
**Безопасность обеспечена!** 🔒  
**Сайт работает!** 🚀
