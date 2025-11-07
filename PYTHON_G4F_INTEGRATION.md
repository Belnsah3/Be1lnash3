# 🐍 Интеграция Python G4F с Node.js REST API

## ✅ Что сделано:

### 1. Python G4F сервис настроен ✅
- ✅ FastAPI сервис на порту 5000
- ✅ База данных SQLite для API ключей
- ✅ Поддержка 69+ AI моделей
- ✅ Автоматический выбор провайдеров

### 2. Node.js интеграция ✅
- ✅ Обновлен `src/routes/ai.js`
- ✅ Все запросы теперь идут на Python G4F
- ✅ Поддержка Function Calling сохранена
- ✅ Обновлены endpoints: `/models`, `/providers`, `/test`

---

## 🚀 Как запустить:

### Шаг 1: Запусти Python G4F сервис

```powershell
# В папке python-g4f
cd d:\bukkit\rest-api\python-g4f

# Запусти через скрипт
.\start.ps1

# Или вручную:
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 5000 --reload
```

**Проверь что работает:**
```powershell
curl http://localhost:5000/health
# Должно вернуть: {"status":"ok","service":"g4f-api"}
```

### Шаг 2: Обнови .env для Node.js

Создай или обнови файл `d:\bukkit\rest-api\.env`:

```env
PORT=3000
NODE_ENV=development
API_VERSION=v1

# Python G4F API
PYTHON_G4F_API=http://localhost:5000
PYTHON_G4F_ADMIN_KEY=56ce83efbb8ae2467f567ced95023b0958cda1f8a0704d84b6b7040628e1c632
```

### Шаг 3: Запусти Node.js сервер

```powershell
cd d:\bukkit\rest-api
npm run dev
```

---

## 🧪 Тестирование:

### Тест 1: Health Check Python G4F
```powershell
curl http://localhost:5000/health
```

**Ожидаемый ответ:**
```json
{"status":"ok","service":"g4f-api"}
```

### Тест 2: Список моделей через Node.js
```powershell
curl http://localhost:3000/api/v1/ai/models `
  -H "Authorization: Bearer твой-api-ключ"
```

### Тест 3: Chat запрос
```powershell
curl http://localhost:3000/api/v1/ai/chat/completions `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer твой-api-ключ" `
  -d '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "Привет!"}]
  }'
```

**Ожидаемый ответ:**
```json
{
  "id": "chatcmpl-xxx",
  "object": "chat.completion",
  "created": 1234567890,
  "model": "gpt-4",
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "Привет! Чем могу помочь?"
    },
    "finish_reason": "stop"
  }],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 20,
    "total_tokens": 30
  }
}
```

---

## 📊 Архитектура:

```
┌─────────────┐
│   Клиент    │
└──────┬──────┘
       │ HTTP Request
       │ Authorization: Bearer sk-xxx
       ↓
┌─────────────────────┐
│   Node.js Server    │
│   (Port 3000)       │
│                     │
│  - Валидация API    │
│  - Логирование      │
│  - Function Calling │
└──────┬──────────────┘
       │ HTTP Request
       │ X-API-Key: admin-key
       ↓
┌─────────────────────┐
│  Python G4F API     │
│  (Port 5000)        │
│                     │
│  - g4f библиотека   │
│  - Выбор провайдера │
│  - AI запросы       │
└──────┬──────────────┘
       │
       ↓
┌─────────────────────┐
│   AI Провайдеры     │
│  (Airforce, You,    │
│   Puter, etc.)      │
└─────────────────────┘
```

---

## 🔧 Изменения в коде:

### `src/routes/ai.js`:

#### Было:
```javascript
const GPT4FREE_PRO_API = 'https://gpt4free.pro';
```

#### Стало:
```javascript
const PYTHON_G4F_API = process.env.PYTHON_G4F_API || 'http://localhost:5000';
const PYTHON_G4F_ADMIN_KEY = process.env.PYTHON_G4F_ADMIN_KEY || '56ce...';
```

#### Запросы теперь идут на Python:
```javascript
const response = await axios.post(`${PYTHON_G4F_API}/v1/chat/completions`, {
  model: model,
  messages: messages
}, {
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': PYTHON_G4F_ADMIN_KEY
  }
});
```

---

## 🎯 Преимущества Python G4F:

### ✅ Больше моделей:
- Claude Sonnet 4.5
- Claude Haiku 4.5
- GPT-4, GPT-4o
- Gemini 2.5 Flash/Pro
- DeepSeek V3, R1

### ✅ Лучшая стабильность:
- Автоматический выбор провайдера
- Fallback на другие провайдеры
- Retry логика

### ✅ Локальный контроль:
- Полный контроль над запросами
- Логирование
- Кастомизация

### ✅ Бесплатно:
- Все модели без API ключей
- Без лимитов
- Без оплаты

---

## 🐛 Troubleshooting:

### Проблема: Python сервис не запускается

**Решение:**
```powershell
cd python-g4f
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install -r requirements.txt
```

### Проблема: Node.js не может подключиться к Python

**Проверь:**
1. Python сервис запущен: `curl http://localhost:5000/health`
2. Порт 5000 свободен: `netstat -ano | findstr :5000`
3. `.env` файл содержит правильный URL

**Исправь:**
```powershell
# Убей процесс на порту 5000 если нужно
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process

# Перезапусти Python сервис
cd python-g4f
.\start.ps1
```

### Проблема: Ошибка "Invalid API Key"

**Решение:**
Проверь что `PYTHON_G4F_ADMIN_KEY` в Node.js `.env` совпадает с `ADMIN_BASE_KEY` в Python `.env`:

**Node.js `.env`:**
```
PYTHON_G4F_ADMIN_KEY=56ce83efbb8ae2467f567ced95023b0958cda1f8a0704d84b6b7040628e1c632
```

**Python `.env`:**
```
ADMIN_BASE_KEY=56ce83efbb8ae2467f567ced95023b0958cda1f8a0704d84b6b7040628e1c632
```

### Проблема: Медленные ответы

**Причина:** g4f пробует разные провайдеры

**Решение:**
1. Используй конкретные модели (не "auto")
2. Увеличь timeout в Node.js (уже 120 секунд)
3. Проверь интернет соединение

---

## 📝 Логи:

### Python G4F логи:
```powershell
# В терминале где запущен Python сервис
# Логи выводятся в реальном времени
```

### Node.js логи:
```powershell
# В терминале где запущен Node.js
# Ищи строки с 🐍 (Python G4F)
```

**Пример успешного запроса:**
```
🐍 Отправка запроса к Python G4F...
📝 Модель: gpt-4
📨 Сообщений: 1
✅ Ответ получен от Python G4F
📊 Статус: 200
📦 Получен ответ от Python G4F
✅ Ответ отправлен клиенту
```

---

## 🚀 Деплой на сервер:

### 1. Установи Python на сервере:
```bash
ssh root@147.45.48.64
apt update
apt install python3 python3-pip python3-venv -y
```

### 2. Загрузи код:
```bash
cd ~/rest-api/rest-api
git pull
```

### 3. Настрой Python G4F:
```bash
cd python-g4f
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 4. Создай systemd service:
```bash
sudo nano /etc/systemd/system/python-g4f.service
```

```ini
[Unit]
Description=Python G4F API
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/rest-api/rest-api/python-g4f
Environment="PATH=/root/rest-api/rest-api/python-g4f/venv/bin"
ExecStart=/root/rest-api/rest-api/python-g4f/venv/bin/uvicorn main:app --host 0.0.0.0 --port 5000
Restart=always

[Install]
WantedBy=multi-user.target
```

### 5. Запусти сервисы:
```bash
# Python G4F
sudo systemctl daemon-reload
sudo systemctl enable python-g4f
sudo systemctl start python-g4f
sudo systemctl status python-g4f

# Node.js
pm2 restart lumeai
pm2 logs lumeai
```

### 6. Проверь:
```bash
curl http://localhost:5000/health
curl http://localhost:3000/api/v1/ai/models -H "Authorization: Bearer sk-xxx"
```

---

## ✅ Чек-лист готовности:

- [ ] Python G4F запущен на порту 5000
- [ ] Health check возвращает OK
- [ ] Node.js `.env` обновлен
- [ ] Node.js сервер перезапущен
- [ ] `/api/v1/ai/models` возвращает список моделей
- [ ] Chat запрос работает
- [ ] Логи показывают 🐍 Python G4F
- [ ] Нет ошибок в консоли

---

## 🎉 Готово!

Теперь твой REST API использует Python g4f библиотеку вместо JavaScript версии!

**Преимущества:**
- ✅ Больше моделей
- ✅ Лучшая стабильность
- ✅ Автоматический fallback
- ✅ Бесплатно

**Следующие шаги:**
1. Протестируй все модели
2. Настрой мониторинг
3. Задеплой на сервер
4. Обнови документацию

Удачи! 🚀
