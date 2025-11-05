# 📚 **LumeAI - Swagger документация**

## 🌐 **Как открыть документацию**

### **Шаг 1: Запусти сервер**

```bash
npm start
```

### **Шаг 2: Открой в браузере**

```
https://lumeai.ru/api-docs
```

---

## 📋 **Что есть в документации**

### **1. AI Chat Completions**

Все основные endpoints для работы с AI:

- **POST /v1/chat/completions** - OpenAI стандарт
- **POST /v1/responses** - Kilo Code
- **POST /v1/messages** - Claude
- **POST /v1/completions** - OpenAI Completions
- **POST /openai/deployments/gpt-4/chat/completions** - Azure OpenAI

### **2. Alternative Endpoints**

Альтернативные endpoints для разных клиентов:

- **POST /chat/completions** - Корневой
- **POST /api/chat/completions** - С префиксом /api
- И другие...

### **3. Models**

Получение списка моделей:

- **GET /v1/models** - Список всех 69 моделей
- **GET /models** - Альтернативный
- **GET /v1/engines** - Для старых клиентов

---

## 🧪 **Как тестировать в Swagger UI**

### **Шаг 1: Авторизация**

1. Нажми кнопку **"Authorize"** вверху справа
2. Введи API ключ: `Bearer sk-ваш-ключ`
3. Нажми **"Authorize"**

### **Шаг 2: Выбери endpoint**

1. Найди нужный endpoint (например, `/v1/chat/completions`)
2. Нажми **"Try it out"**

### **Шаг 3: Заполни данные**

```json
{
  "model": "gpt-4",
  "messages": [
    {
      "role": "user",
      "content": "Привет!"
    }
  ]
}
```

### **Шаг 4: Выполни запрос**

1. Нажми **"Execute"**
2. Посмотри ответ ниже

---

## 📊 **Примеры запросов**

### **Простой запрос:**

```json
{
  "model": "gpt-4",
  "messages": [
    {"role": "user", "content": "Привет! Как дела?"}
  ]
}
```

### **С системным промптом:**

```json
{
  "model": "claude-sonnet-4.5",
  "messages": [
    {"role": "system", "content": "Ты полезный ассистент"},
    {"role": "user", "content": "Расскажи про LumeAI"}
  ]
}
```

### **С параметрами:**

```json
{
  "model": "gpt-4",
  "messages": [
    {"role": "user", "content": "Напиши короткий стих"}
  ],
  "temperature": 0.7,
  "max_tokens": 100
}
```

---

## 🎯 **Все доступные endpoints**

### **OpenAI-совместимые:**
```
POST /v1/chat/completions
POST /v1/completions
POST /chat/completions
POST /completions
```

### **Kilo Code:**
```
POST /v1/responses
```

### **Claude:**
```
POST /v1/messages
POST /messages
```

### **Gemini:**
```
POST /v1/models/gemini-pro:generateContent
POST /v1beta/models/gemini-pro:generateContent
```

### **Azure OpenAI:**
```
POST /openai/deployments/gpt-4/chat/completions
```

### **Дополнительные:**
```
POST /api/chat/completions
POST /api/v1/completions
POST /v1/engines/gpt-4/completions
POST /v1/engines/gpt-3.5-turbo/completions
```

### **Модели:**
```
GET /v1/models
GET /models
GET /v1/engines
GET /engines
```

---

## 🔐 **Авторизация**

Все POST endpoints требуют API ключ в заголовке:

```
Authorization: Bearer sk-ваш-ключ
```

GET endpoints (модели) **не требуют** авторизации.

---

## ✨ **Готово!**

**Swagger документация доступна по адресу:**
```
https://lumeai.ru/api-docs
```

**Там ты найдешь:**
- ✅ Все 20+ endpoints
- ✅ Интерактивное тестирование
- ✅ Примеры запросов и ответов
- ✅ Схемы данных
- ✅ Описание каждого параметра

---

**Используй Swagger UI для тестирования API!** 🚀
