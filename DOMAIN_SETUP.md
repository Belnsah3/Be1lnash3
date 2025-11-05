# 🌐 **Настройка домена lumeai.ru**

## 📋 **Чек-лист:**

### **1. DNS записи (у регистратора домена)**
```
✅ A      @      lumeai.ru
✅ A      www    lumeai.ru
```

**Время распространения:** 5 минут - 24 часа

**Проверка:**
```bash
# Windows
nslookup lumeai.ru

# Linux/Mac
dig lumeai.ru
```

---

### **2. Nginx на сервере**

```bash
ssh root@lumeai.ru

# Установка
apt update && apt install nginx -y

# Создание конфига
nano /etc/nginx/sites-available/lumeai.ru
```

**Конфигурация:**
```nginx
server {
    listen 80;
    server_name lumeai.ru www.lumeai.ru;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    client_max_body_size 50M;
}
```

**Активация:**
```bash
ln -s /etc/nginx/sites-available/lumeai.ru /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
systemctl enable nginx
```

---

### **3. SSL сертификат (HTTPS)**

```bash
# Установка Certbot
apt install certbot python3-certbot-nginx -y

# Получение сертификата
certbot --nginx -d lumeai.ru -d www.lumeai.ru

# Автопродление (проверка)
certbot renew --dry-run
```

**После этого сайт будет доступен:**
- ✅ `https://lumeai.ru`
- ✅ `https://www.lumeai.ru`
- ✅ `http://lumeai.ru` → автоматический редирект на HTTPS

---

### **4. Обновление ссылок в коде**

#### **Автоматически (Linux/Mac):**
```bash
chmod +x update-domain.sh
./update-domain.sh
```

#### **Вручную (Windows):**

**Файлы для обновления:**

1. **README.md**
   ```
   Было: https://lumeai.ru
   Стало: https://lumeai.ru
   ```

2. **src/config/swagger.js**
   ```javascript
   servers: [
     {
       url: 'https://lumeai.ru/api/v1',
       description: 'Production server'
     }
   ]
   ```

3. **Все .md файлы** (документация)
   - Замени `lumeai.ru` на `lumeai.ru`
   - Замени `http://` на `https://`

---

### **5. Проверка работы**

#### **После настройки DNS и Nginx:**

```bash
# Проверь что домен резолвится
ping lumeai.ru

# Проверь HTTP
curl http://lumeai.ru

# Проверь HTTPS (после SSL)
curl https://lumeai.ru

# Проверь API
curl https://lumeai.ru/api/v1/models
```

#### **В браузере:**
1. Открой `https://lumeai.ru`
2. Должна открыться страница логина
3. Проверь что SSL работает (замочек в адресной строке)
4. Проверь Swagger: `https://lumeai.ru/api-docs`

---

### **6. Обновление на сервере**

```bash
# Локально
git add .
git commit -m "Update domain to lumeai.ru"
git push

# На сервере
ssh root@lumeai.ru
cd ~/rest-api
git pull
pm2 restart lumeai
pm2 logs lumeai
```

---

## 🔧 **Настройки для Extragram AI-chat**

После настройки домена, в приложении используй:

**Base URL:**
```
https://lumeai.ru
```

**Endpoints:**
```
/v1/chat/completions
/chat/completions
/v1/models
```

**API Key:**
```
sk-твой-ключ
```

---

## 🎯 **Преимущества домена:**

### **Было:**
- ❌ `https://lumeai.ru` - сложно запомнить
- ❌ Нет HTTPS
- ❌ Нужно указывать порт

### **Стало:**
- ✅ `https://lumeai.ru` - легко запомнить
- ✅ HTTPS (безопасно)
- ✅ Без порта
- ✅ Профессионально

---

## 📊 **Мониторинг**

### **Проверка статуса Nginx:**
```bash
systemctl status nginx
```

### **Логи Nginx:**
```bash
# Access log
tail -f /var/log/nginx/lumeai.access.log

# Error log
tail -f /var/log/nginx/lumeai.error.log
```

### **Проверка SSL:**
```bash
# Информация о сертификате
certbot certificates

# Тест продления
certbot renew --dry-run
```

---

## 🚨 **Troubleshooting**

### **Проблема: Домен не открывается**

**Решение:**
```bash
# 1. Проверь DNS
nslookup lumeai.ru

# 2. Проверь Nginx
systemctl status nginx
nginx -t

# 3. Проверь порты
netstat -tulpn | grep :80
netstat -tulpn | grep :443

# 4. Проверь Node.js
pm2 status
```

### **Проблема: SSL не работает**

**Решение:**
```bash
# Переустанови сертификат
certbot delete --cert-name lumeai.ru
certbot --nginx -d lumeai.ru -d www.lumeai.ru

# Проверь конфиг
nginx -t
systemctl restart nginx
```

### **Проблема: 502 Bad Gateway**

**Решение:**
```bash
# Проверь что Node.js запущен
pm2 status
pm2 restart lumeai

# Проверь логи
pm2 logs lumeai
tail -f /var/log/nginx/lumeai.error.log
```

---

## 📝 **Итоговая структура:**

```
Интернет
    ↓
DNS (lumeai.ru → lumeai.ru)
    ↓
Nginx (порт 80/443)
    ↓
Node.js (порт 3000)
    ↓
LumeAI API
```

---

## ✅ **Чек-лист после настройки:**

- [ ] DNS записи добавлены
- [ ] DNS резолвится (ping lumeai.ru)
- [ ] Nginx установлен и запущен
- [ ] Конфиг Nginx создан
- [ ] SSL сертификат получен
- [ ] HTTPS работает
- [ ] Редирект HTTP → HTTPS работает
- [ ] Сайт открывается на https://lumeai.ru
- [ ] API работает (curl https://lumeai.ru/api/v1/models)
- [ ] Swagger доступен (https://lumeai.ru/api-docs)
- [ ] Ссылки в коде обновлены
- [ ] Extragram AI-chat подключен к новому домену

---

## 🎉 **Готово!**

**Теперь твой API доступен по адресу:**
- 🌐 **https://lumeai.ru**
- 📚 **https://lumeai.ru/api-docs**
- 🔑 **https://lumeai.ru/dashboard**

**Профессионально и безопасно!** ✨
