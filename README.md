# ✨ **LumeAI - AI API Management Platform**

Современная платформа для управления доступом к 69 AI моделям с веб-интерфейсом, системой лимитов и администрированием.

---

## 🎯 **Возможности**

### **Для пользователей:**
- ✅ Создание и управление API ключами
- ✅ Активация/деактивация ключей
- ✅ Доступ к 69 AI моделям (Claude, GPT, Gemini, DeepSeek и др.)
- ✅ Копирование названий моделей и API endpoint
- ✅ Опциональная двухфакторная аутентификация (2FA)
- ✅ Отслеживание использования лимитов
- ✅ **Mock-ответы для тестирования** (когда внешний AI недоступен)

### **Для администраторов:**
- ✅ Управление пользователями
- ✅ Изменение ролей (User ↔ Admin)
- ✅ Настройка лимитов для каждого пользователя
- ✅ Сброс использованных лимитов
- ✅ Безлимитное использование API

---

## 🚀 **Быстрый старт**

### **Windows:**
```bash
npm install
npm start
```

### **Ubuntu/Linux:**
```bash
# Автоматическая установка
chmod +x install.sh
./install.sh

# Или через Python
chmod +x setup_ubuntu.py
python3 setup_ubuntu.py
```

**Сервер запустится на:** https://lumeai.ru

---

## 🔑 **Учетные данные**


### **Обычный пользователь:**
```
Username: Be1lnash
Email: Sahsaxboxvan@gmail.com
Password: Zaza_0203!

Возможности:
- 10,000 запросов/неделю
- Автосброс лимитов
- Управление своими ключами
```

---

## 📚 **Документация**

- **Swagger UI:** https://lumeai.ru/api-docs - Интерактивная документация всех endpoints
- **Как использовать Swagger:** [SWAGGER_DOCS.md](SWAGGER_DOCS.md)
- **Все API Endpoints:** [API_ENDPOINTS.md](API_ENDPOINTS.md) - 20+ поддерживаемых endpoints
- **Быстрый старт:** [QUICK_START.md](QUICK_START.md)
- **Установка на Ubuntu:** [UBUNTU_INSTALL.md](UBUNTU_INSTALL.md)
- **Настройка Kilo Code:** [KILO_CODE_SETUP.md](KILO_CODE_SETUP.md)
- **Исправление SQLite3 ошибки:** [FIX_SQLITE_ERROR.md](FIX_SQLITE_ERROR.md)

---

## 🌐 **URL адреса**

### **🖥️ VPS Сервер: lumeai.ru**

- **Главная:** https://lumeai.ru/
- **Вход:** https://lumeai.ru/login
- **Dashboard:** https://lumeai.ru/dashboard
- **API Endpoint:** https://lumeai.ru/api/v1/ai/chat/completions
- **Swagger Docs:** https://lumeai.ru/api-docs

**Подробнее:** [SERVER_INFO.md](SERVER_INFO.md)

---

## 🎨 **Возможности платформы**

### **1. Управление API ключами:**
- Создание ключей с названием
- Активация/деактивация ключей
- Полное удаление ключей
- Копирование ключей в буфер обмена

### **2. 69 AI моделей:**
- Claude (8 моделей)
- Gemini (6 моделей)
- GPT (8 моделей)
- DeepSeek (4 модели)
- Grok (4 модели)
- Llama (7 моделей)
- Mistral (5 моделей)
- Qwen (4 модели)
- И другие...

### **3. Система лимитов:**
- Недельные лимиты для пользователей
- Автоматический сброс каждую неделю
- БЕЗ лимитов для администраторов
- Ручной сброс лимитов (супер-админ)

### **4. Безопасность:**
- Хеширование паролей (bcrypt)
- Сессии с SQLite
- Опциональная 2FA (TOTP)
- Проверка API ключей
- Защита от SQL injection

---

## 📊 **Пример использования API**

```javascript
const response = await fetch('https://lumeai.ru/api/v1/ai/chat/completions', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        model: 'claude-sonnet-4.5',
        messages: [
            { role: 'user', content: 'Привет!' }
        ]
    })
});

const data = await response.json();
console.log(data.choices[0].message.content);
```

### **Mock-ответы для тестирования:**

Когда внешний AI сервис недоступен, API возвращает умные mock-ответы:

- **"Привет!"** → **"Привет! Я - LumeAI. Чем могу помочь?"**
- **"Как дела?"** → **"У меня все отлично! Я готов помочь вам с любыми вопросами."**
- **Другие запросы** → **"Я получил ваш запрос: '...'. К сожалению, внешний AI сервис временно недоступен..."**

Это позволяет тестировать интеграцию даже без запущенных внешних сервисов.

---

## 🛠️ **Технологии**

- **Backend:** Node.js, Express.js
- **Database:** SQLite3
- **Authentication:** bcrypt, express-session, speakeasy (2FA)
- **Frontend:** Vanilla JS, HTML5, CSS3
- **Documentation:** Swagger/OpenAI

---

## 📁 **Структура проекта**

```
rest-api/
├── src/
│   ├── database/
│   │   └── db.js              # База данных SQLite
│   ├── middleware/
│   │   ├── auth.js            # API ключи
│   │   └── session.js         # Сессии
│   ├── routes/
│   │   ├── auth.js            # Авторизация
│   │   ├── keys.js            # API ключи
│   │   ├── twofa.js           # 2FA
│   │   ├── admin.js           # Админ-панель
│   │   └── models.js          # Модели
│   ├── utils/
│   │   └── limitReset.js      # Автосброс лимитов
│   ├── data/
│   │   └── models.js          # 69 моделей
│   └── server.js              # Главный файл
├── public/
│   ├── login.html             # Страница входа
│   ├── dashboard.html         # Dashboard
│   └── js/
│       └── dashboard.js       # JavaScript
├── data/
│   ├── api.db                 # База данных
│   └── sessions.db            # Сессии
├── install.sh                 # Bash установка (Ubuntu)
├── setup_ubuntu.py            # Python установка (Ubuntu)
└── package.json               # npm конфигурация
```

---

## 🔧 **Команды npm**

```bash
# Установка зависимостей
npm install

# Запуск сервера
npm start
```

---

## 🐧 **Установка на Ubuntu**

Подробная инструкция: [UBUNTU_INSTALL.md](UBUNTU_INSTALL.md)

**Быстрая установка:**
```bash
chmod +x install.sh
./install.sh
```

**С дополнительными настройками:**
```bash
chmod +x setup_ubuntu.py
python3 setup_ubuntu.py
```

---

## 🆘 **Решение проблем**

### **Не могу войти:**
- Проверь username: `Be1lnash3` (с цифрой 3!)
- Проверь пароль: `Zaza_0203!`
- Email работает в любом регистре

### **Порт 3000 занят:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /F /PID <PID>

# Linux
sudo lsof -i :3000
sudo kill -9 <PID>
```

### **Ключи не удаляются:**
- Используй кнопку "🗑️ Удалить" для полного удаления
- Используй "⏸️ Деактивировать" для временного отключения

---

## 📦 **Зависимости**

```json
{
  "express": "^4.18.2",
  "better-sqlite3": "^9.2.2",
  "bcryptjs": "^2.4.3",
  "express-session": "^1.17.3",
  "connect-sqlite3": "^0.9.13",
  "speakeasy": "^2.0.0",
  "qrcode": "^1.5.3",
  "swagger-ui-express": "^5.0.0",
  "node-cron": "^3.0.3"
}
```

---

## 🎉 **Готово к использованию!**

1. **Установи зависимости:** `npm install`
2. **Запусти сервер:** `npm start`
3. **Открой браузер:** https://lumeai.ru
4. **Войди:** Be1lnash3 / Zaza_0203!
5. **Создай API ключ**
6. **Используй 69 моделей!**

---

## 📞 **Поддержка**

- **Документация:** https://lumeai.ru/api-docs
- **Установка Ubuntu:** [UBUNTU_INSTALL.md](UBUNTU_INSTALL.md)

---

**LumeAI - Полнофункциональная платформа для работы с AI!** ✨🚀
