# 🌐 **LumeAI - Все поддерживаемые API Endpoints**

## ✅ **Максимальная совместимость**

LumeAI теперь поддерживает **20+ различных endpoints** для работы с любыми AI клиентами и приложениями!

---

## 📋 **Список всех endpoints**

### **1. OpenAI-совместимые (стандартные)**

```
POST /v1/chat/completions
POST /v1/completions
POST /chat/completions
POST /completions
```

**Используют:**
- ChatGPT клиенты
- OpenAI SDK
- LangChain
- LlamaIndex
- Большинство AI приложений

**Base URL для клиентов:**
```
https://lumeai.ru
```

---

### **2. Kilo Code и похожие IDE**

```
POST /v1/responses
```

**Используют:**
- Kilo Code
- Некоторые VS Code расширения
- Cursor AI (альтернативный endpoint)

**Base URL для Kilo Code:**
```
https://lumeai.ru
```

---

### **3. Anthropic Claude-совместимые**

```
POST /v1/messages
POST /messages
```

**Используют:**
- Claude API клиенты
- Anthropic SDK
- Приложения с поддержкой Claude

**Base URL:**
```
https://lumeai.ru
```

---

### **4. Google Gemini-совместимые**

```
POST /v1/models/gemini-pro:generateContent
POST /v1beta/models/gemini-pro:generateContent
```

**Используют:**
- Google AI Studio клиенты
- Gemini API приложения

**Base URL:**
```
https://lumeai.ru
```

---

### **5. Azure OpenAI-совместимые**

```
POST /openai/deployments/gpt-4/chat/completions
```

**Используют:**
- Azure OpenAI клиенты
- Microsoft приложения

**Base URL:**
```
https://lumeai.ru
```

---

### **6. Дополнительные роуты**

```
POST /api/chat/completions
POST /api/v1/completions
POST /v1/engines/gpt-4/completions
POST /v1/engines/gpt-3.5-turbo/completions
```

**Используют:**
- Различные кастомные клиенты
- Старые версии OpenAI SDK

---

### **7. GET роуты (список моделей)**

```
GET /v1/models
GET /models
GET /v1/engines
GET /engines
```

**Возвращают:**
Список всех 69 доступных моделей в формате OpenAI

**Не требуют авторизации** (для совместимости)

---

## 🎯 **Примеры использования**

### **1. ChatGPT Desktop / Mobile Apps**

```json
{
  "endpoint": "https://lumeai.ru/v1/chat/completions",
  "api_key": "sk-ваш-ключ",
  "model": "gpt-4"
}
```

### **2. Kilo Code**

```json
{
  "baseURL": "https://lumeai.ru",
  "apiKey": "sk-ваш-ключ",
  "model": "gpt-4"
}
```

### **3. Continue (VS Code Extension)**

```json
{
  "models": [{
    "title": "LumeAI GPT-4",
    "provider": "openai",
    "model": "gpt-4",
    "apiBase": "https://lumeai.ru/v1",
    "apiKey": "sk-ваш-ключ"
  }]
}
```

### **4. Open WebUI**

```
API Base URL: https://lumeai.ru/v1
API Key: sk-ваш-ключ
```

### **5. LangChain (Python)**

```python
from langchain.chat_models import ChatOpenAI

llm = ChatOpenAI(
    openai_api_base="https://lumeai.ru/v1",
    openai_api_key="sk-ваш-ключ",
    model_name="gpt-4"
)
```

### **6. LangChain (JavaScript)**

```javascript
import { ChatOpenAI } from "langchain/chat_models/openai";

const model = new ChatOpenAI({
  openAIApiKey: "sk-ваш-ключ",
  configuration: {
    basePath: "https://lumeai.ru/v1"
  }
});
```

### **7. LlamaIndex**

```python
from llama_index.llms import OpenAI

llm = OpenAI(
    api_base="https://lumeai.ru/v1",
    api_key="sk-ваш-ключ",
    model="gpt-4"
)
```

### **8. curl (тестирование)**

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

## 🔧 **Настройка для популярных приложений**

### **ChatGPT Desktop (Windows/Mac)**

1. Открой настройки
2. Custom API Endpoint: `https://lumeai.ru/v1/chat/completions`
3. API Key: `sk-ваш-ключ`
4. Model: `gpt-4`

### **Cursor AI**

```json
// settings.json
{
  "cursor.ai.apiKey": "sk-ваш-ключ",
  "cursor.ai.baseURL": "https://lumeai.ru/v1"
}
```

### **Raycast AI**

```
API Endpoint: https://lumeai.ru/v1/chat/completions
API Key: sk-ваш-ключ
Model: gpt-4
```

### **Siri Shortcuts (iOS)**

```
URL: http://your-server-ip:3000/v1/chat/completions
Headers:
  Authorization: Bearer sk-ваш-ключ
  Content-Type: application/json
Body:
  {"model":"gpt-4","messages":[{"role":"user","content":"{{input}}"}]}
```

### **Telegram Bots**

```python
import requests

def ask_ai(question):
    response = requests.post(
        'https://lumeai.ru/v1/chat/completions',
        headers={'Authorization': 'Bearer sk-ваш-ключ'},
        json={
            'model': 'gpt-4',
            'messages': [{'role': 'user', 'content': question}]
        }
    )
    return response.json()['choices'][0]['message']['content']
```

---

## 📊 **Совместимость**

### **✅ Полностью совместимо:**

- OpenAI SDK (Python, JavaScript, Go, etc.)
- ChatGPT клиенты
- Kilo Code
- Continue (VS Code)
- Cursor AI
- Raycast AI
- Open WebUI
- LangChain
- LlamaIndex
- AutoGPT
- BabyAGI
- Telegram боты
- Discord боты
- Slack боты
- iOS Shortcuts
- Android Tasker
- Home Assistant
- n8n
- Zapier
- Make (Integromat)

### **⚠️ Частично совместимо:**

- Claude Desktop (требует адаптер)
- Gemini Studio (требует адаптер)

---

## 🌍 **Удаленный доступ**

### **Для доступа с других устройств:**

1. **Узнай IP адрес сервера:**
   ```bash
   # Windows
   ipconfig
   
   # Linux/Mac
   ifconfig
   ```

2. **Используй IP вместо lumeai.ru:**
   ```
   http://192.168.1.100:3000/v1/chat/completions
   ```

3. **Настрой файрвол:**
   ```bash
   # Windows
   netsh advfirewall firewall add rule name="LumeAI" dir=in action=allow protocol=TCP localport=3000
   
   # Linux
   sudo ufw allow 3000/tcp
   ```

---

## 🔐 **Безопасность**

### **Для продакшена:**

1. **Используй HTTPS:**
   - Настрой Nginx с SSL
   - Используй Let's Encrypt

2. **Ограничь доступ:**
   - Настрой файрвол
   - Используй VPN
   - Ограничь по IP

3. **Ротация ключей:**
   - Регулярно меняй API ключи
   - Деактивируй старые ключи

---

## ✨ **Готово!**

**LumeAI теперь работает с 20+ различными endpoints!**

**Поддерживаемые приложения:**
- ✅ ChatGPT клиенты
- ✅ IDE расширения (VS Code, Cursor, Kilo Code)
- ✅ AI фреймворки (LangChain, LlamaIndex)
- ✅ Боты (Telegram, Discord, Slack)
- ✅ Автоматизация (n8n, Zapier, Make)
- ✅ Мобильные (iOS Shortcuts, Android Tasker)
- ✅ Умный дом (Home Assistant)

---

**Используй любой endpoint который тебе удобен!** 🚀
