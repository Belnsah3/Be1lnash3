# ⚡ **LumeAI - Быстрый старт**

## 🚀 **За 3 минуты**

### **Шаг 1: Запусти сервер**

```bash
npm start
```

### **Шаг 2: Получи API ключ**

1. Открой https://lumeai.ru/login
2. Войди: `Be1lnash3` / `Zaza_0203!`
3. Создай ключ в разделе "API Ключи"

### **Шаг 3: Используй в любом приложении**

```bash
curl https://lumeai.ru/v1/chat/completions \
  -H "Authorization: Bearer sk-ваш-ключ" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-4","messages":[{"role":"user","content":"Привет!"}]}'
```

---

## 🎯 **Популярные приложения**

### **Kilo Code**
```
Base URL: https://lumeai.ru
API Key: sk-ваш-ключ
Model: gpt-4
```

### **ChatGPT Desktop**
```
Endpoint: https://lumeai.ru/v1/chat/completions
API Key: sk-ваш-ключ
```

### **Continue (VS Code)**
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

### **LangChain**
```python
from langchain.chat_models import ChatOpenAI

llm = ChatOpenAI(
    openai_api_base="https://lumeai.ru/v1",
    openai_api_key="sk-ваш-ключ"
)
```

---

## 📋 **Все endpoints**

Полный список: [API_ENDPOINTS.md](API_ENDPOINTS.md)

**Основные:**
- `/v1/chat/completions` - OpenAI стандарт
- `/v1/responses` - Kilo Code
- `/v1/messages` - Claude
- `/v1/models` - Список моделей

---

## ✨ **Готово!**

**Теперь используй LumeAI в любом приложении!** 🎉
