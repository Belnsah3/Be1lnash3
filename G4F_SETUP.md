# 🚀 **G4F API - Настройка и Запуск**

## ✅ **G4F запущен успешно!**

```
Starting server... [g4f v-6.5.7]
INFO:     Uvicorn running on http://0.0.0.0:1337
```

---

## ⚠️ **Ошибка: Add a "api_key"**

G4F пытается использовать провайдеры которым нужен API ключ.

---

## 🔧 **Решение 1: Используй бесплатные провайдеры**

Запусти G4F с указанием конкретного бесплатного провайдера:

```bash
python3 -m g4f.cli api --port 1337 --provider Bing
```

**Или другие бесплатные провайдеры:**
```bash
# DDG (DuckDuckGo)
python3 -m g4f.cli api --port 1337 --provider DDG

# You.com
python3 -m g4f.cli api --port 1337 --provider You

# Phind
python3 -m g4f.cli api --port 1337 --provider Phind

# Liaobots
python3 -m g4f.cli api --port 1337 --provider Liaobots
```

---

## 🔧 **Решение 2: Настрой через переменные окружения**

Создай файл `.env` в домашней директории:

```bash
nano ~/.g4f_env
```

Добавь:
```env
G4F_PROVIDER=Bing
G4F_MODEL=gpt-4
```

Затем запусти:
```bash
source ~/.g4f_env
python3 -m g4f.cli api --port 1337
```

---

## 🔧 **Решение 3: Используй Docker (рекомендуется)**

```bash
docker run -p 1337:1337 hlohaus789/g4f:latest
```

---

## 🔧 **Решение 4: Настрой LumeAI на использование конкретного провайдера**

Обнови `src/routes/ai.js`:

```javascript
const g4fResponse = await axios.post(`${G4F_INTERFERENCE_API}/chat/completions`, {
  model: model,
  messages: messages,
  stream: false,
  provider: 'Bing' // Добавь это
}, {
  timeout: 60000
});
```

---

## ✅ **Быстрое решение (прямо сейчас):**

**На сервере:**

```bash
# Останови текущий G4F (Ctrl+C)

# Запусти с Bing провайдером
python3 -m g4f.cli api --port 1337 --provider Bing

# Или в фоне с nohup
nohup python3 -m g4f.cli api --port 1337 --provider Bing > /root/g4f.log 2>&1 &
```

**Или через PM2 (лучше):**

```bash
# Создай скрипт запуска
cat > /root/start-g4f.sh << 'EOF'
#!/bin/bash
cd /root
source venv/bin/activate
python3 -m g4f.cli api --port 1337 --provider Bing
EOF

chmod +x /root/start-g4f.sh

# Запусти через PM2
pm2 start /root/start-g4f.sh --name g4f
pm2 save
```

---

## 📊 **Проверка:**

После запуска G4F с провайдером:

```bash
curl http://127.0.0.1:1337/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "Hello!"}],
    "provider": "Bing"
  }'
```

---

## 🎯 **После успешного запуска:**

1. ✅ G4F работает на порту 1337
2. ✅ Перезапусти LumeAI: `pm2 restart lumeai`
3. ✅ Попробуй Kilo Code снова
4. ✅ Теперь будут работать реальные AI ответы!

---

## 📝 **Список бесплатных провайдеров G4F:**

- **Bing** - Microsoft Bing Chat (рекомендуется)
- **DDG** - DuckDuckGo AI Chat
- **You** - You.com AI
- **Phind** - Phind AI для кода
- **Liaobots** - Liaobots AI
- **FreeGpt** - Free GPT
- **GPTalk** - GPTalk AI

---

## 🚀 **Рекомендация:**

**Используй PM2 для автозапуска:**

```bash
# Останови текущий процесс
pkill -f "g4f.cli"

# Создай скрипт
cat > /root/start-g4f.sh << 'EOF'
#!/bin/bash
cd /root
source venv/bin/activate
python3 -m g4f.cli api --port 1337 --provider Bing
EOF

chmod +x /root/start-g4f.sh

# Запусти через PM2
pm2 start /root/start-g4f.sh --name g4f
pm2 save
pm2 startup

# Проверь статус
pm2 list
```

**Теперь G4F будет автоматически запускаться при перезагрузке сервера!**

---

**ЗАПУСТИ G4F С ПРОВАЙДЕРОМ BING И ПОПРОБУЙ KILO CODE СНОВА!** 🚀
