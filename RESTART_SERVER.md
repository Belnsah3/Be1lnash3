# 🔄 **Перезапуск сервера на VPS**

## ⚠️ **Важно!**

После обновления файлов нужно перезапустить сервер чтобы применить изменения.

---

## 🚀 **Способ 1: PM2 (рекомендуется)**

### **Если используешь PM2:**

```bash
# Подключись к серверу
ssh root@lumeai.ru

# Перезапусти приложение
pm2 restart lumeai

# Проверь статус
pm2 status

# Посмотри логи
pm2 logs lumeai --lines 50
```

---

## 🚀 **Способ 2: Остановить и запустить заново**

### **Если запущен через npm start:**

```bash
# Подключись к серверу
ssh root@lumeai.ru

# Найди процесс Node.js
ps aux | grep node

# Останови процесс (замени PID на реальный)
kill -9 PID

# Или останови все Node.js процессы
pkill -9 node

# Перейди в директорию
cd ~/rest-api

# Запусти снова
npm start
```

---

## 🚀 **Способ 3: Использовать screen/tmux**

### **С screen:**

```bash
# Подключись к серверу
ssh root@lumeai.ru

# Останови текущий процесс (Ctrl+C в screen сессии)
screen -r lumeai
# Нажми Ctrl+C

# Запусти снова
cd ~/rest-api
npm start

# Отключись от screen (Ctrl+A, затем D)
```

### **С tmux:**

```bash
# Подключись к серверу
ssh root@lumeai.ru

# Подключись к сессии
tmux attach -t lumeai

# Останови (Ctrl+C) и запусти
cd ~/rest-api
npm start

# Отключись (Ctrl+B, затем D)
```

---

## 🔧 **Быстрая команда (одна строка)**

### **Для PM2:**

```bash
ssh root@lumeai.ru "pm2 restart lumeai"
```

### **Для npm:**

```bash
ssh root@lumeai.ru "cd ~/rest-api && pkill -9 node && nohup npm start > server.log 2>&1 &"
```

---

## ✅ **Проверка после перезапуска**

### **1. Проверь что сервер работает:**

```bash
curl https://lumeai.ru/v1/models
```

### **2. Проверь логи:**

```bash
# PM2
pm2 logs lumeai --lines 50

# npm
tail -f ~/rest-api/server.log
```

### **3. Проверь процессы:**

```bash
ps aux | grep node
```

### **4. Проверь порт:**

```bash
sudo netstat -tulpn | grep 3000
```

---

## 🆘 **Если не запускается**

### **Проблема: Порт занят**

```bash
# Найди процесс
sudo lsof -i :3000

# Останови
sudo kill -9 PID
```

### **Проблема: Ошибка SQLite3**

```bash
cd ~/rest-api
npm rebuild
npm start
```

### **Проблема: Нет прав**

```bash
sudo chown -R $USER:$USER ~/rest-api
```

---

## 📋 **Автоматический перезапуск**

### **Настрой PM2 для автозапуска:**

```bash
# Установи PM2
npm install -g pm2

# Запусти приложение
pm2 start ~/rest-api/src/server.js --name lumeai

# Настрой автозапуск при перезагрузке
pm2 startup
pm2 save

# Теперь сервер будет автоматически запускаться после перезагрузки
```

---

## 🔄 **После обновления кода**

### **Полная последовательность:**

```bash
# 1. Подключись к серверу
ssh root@lumeai.ru

# 2. Перейди в директорию
cd ~/rest-api

# 3. Получи обновления (если используешь Git)
git pull

# 4. Установи зависимости (если нужно)
npm install

# 5. Пересобери native модули (если нужно)
npm rebuild

# 6. Перезапусти сервер
pm2 restart lumeai
# или
pkill -9 node && npm start

# 7. Проверь что работает
curl https://lumeai.ru/v1/models
```

---

## 📊 **Мониторинг**

### **PM2 Dashboard:**

```bash
pm2 monit
```

### **Логи в реальном времени:**

```bash
pm2 logs lumeai --lines 100
```

### **Статус:**

```bash
pm2 status
```

---

## ✨ **Готово!**

**Сервер перезапущен и работает!**

**Проверь:**
```
https://lumeai.ru
```

**API:**
```bash
curl https://lumeai.ru/v1/chat/completions \
  -H "Authorization: Bearer sk-твой-ключ" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-4","messages":[{"role":"user","content":"Привет!"}]}'
```

---

**Теперь исправления применены!** 🚀
