# 📤 **Загрузка обновленных файлов на VPS**

## 🎯 **Цель**

Загрузить обновленные файлы с IP адресом `lumeai.ru` на VPS сервер.

---

## 📋 **Способ 1: Git (рекомендуется)**

### **На локальном компьютере:**

```bash
cd d:/bukkit/rest-api

# Добавить все изменения
git add .

# Закоммитить
git commit -m "Update IP to lumeai.ru"

# Отправить на GitHub
git push
```

### **На VPS сервере:**

```bash
cd ~/rest-api

# Получить обновления
git pull

# Перезапустить сервер
pm2 restart lumeai
# или
npm start
```

---

## 📋 **Способ 2: SCP (прямая загрузка)**

### **Загрузка отдельных файлов:**

```bash
# С Windows (PowerShell)
scp README.md root@lumeai.ru:~/rest-api/
scp API_ENDPOINTS.md root@lumeai.ru:~/rest-api/
scp KILO_CODE_SETUP.md root@lumeai.ru:~/rest-api/
scp SERVER_INFO.md root@lumeai.ru:~/rest-api/

# Загрузка всех .md файлов
scp *.md root@lumeai.ru:~/rest-api/

# Загрузка src/config/swagger.js
scp src/config/swagger.js root@lumeai.ru:~/rest-api/src/config/

# Загрузка src/routes/endpoints.js
scp src/routes/endpoints.js root@lumeai.ru:~/rest-api/src/routes/
```

---

## 📋 **Способ 3: SFTP**

### **Используя FileZilla или WinSCP:**

1. **Подключись к серверу:**
   - Host: `lumeai.ru`
   - Port: `22`
   - Protocol: `SFTP`
   - Username: `root`
   - Password: твой пароль

2. **Перейди в директорию:**
   ```
   /root/rest-api
   ```

3. **Загрузи файлы:**
   - Перетащи обновленные файлы
   - Или используй "Upload"

---

## 📋 **Способ 4: Запустить update-ip.py на сервере**

### **Самый простой способ:**

```bash
# Подключись к серверу
ssh root@lumeai.ru

# Перейди в директорию
cd ~/rest-api

# Загрузи update-ip.py (если его нет)
# Можно скопировать содержимое вручную

# Запусти скрипт
python3 update-ip.py

# Перезапусти сервер
pm2 restart lumeai
```

---

## 📝 **Список обновленных файлов**

Эти файлы были обновлены с `lumeai.ru`:

```
✅ README.md
✅ API_ENDPOINTS.md
✅ KILO_CODE_SETUP.md
✅ QUICK_START.md
✅ UBUNTU_INSTALL.md
✅ SWAGGER_DOCS.md
✅ FIX_SQLITE_ERROR.md
✅ SERVER_INFO.md (новый)
✅ install.sh
✅ setup_ubuntu.py
✅ test-mock.js
✅ src/config/swagger.js
✅ src/routes/endpoints.js
✅ update-ip.py (новый)
✅ update-ip.sh (новый)
```

---

## 🔄 **После загрузки**

### **Перезапусти сервер:**

```bash
# Если используешь PM2
pm2 restart lumeai

# Если запущен через npm
# Останови (Ctrl+C) и запусти снова
npm start
```

### **Проверь что работает:**

```bash
# Проверка API
curl https://lumeai.ru/v1/models

# Проверка веб-интерфейса
curl https://lumeai.ru
```

---

## 🌐 **Открой в браузере**

После обновления открой:

- **Dashboard:** https://lumeai.ru/dashboard
- **Swagger Docs:** https://lumeai.ru/api-docs

---

## ✨ **Готово!**

Теперь все файлы используют правильный IP адрес `lumeai.ru`!

**Клиенты могут подключаться:**
```
Base URL: https://lumeai.ru
```
