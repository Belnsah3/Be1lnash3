# ⚡ **ОБНОВИ СЕРВЕР ПРЯМО СЕЙЧАС**

## 🎯 **Что нужно сделать:**

Загрузить обновленные файлы на сервер и перезапустить.

---

## 🚀 **БЫСТРАЯ КОМАНДА (скопируй и выполни):**

### **Вариант 1: SCP + Перезапуск (самый быстрый)**

```powershell
# Выполни в PowerShell на локальном компьютере
scp src/routes/ai.js root@lumeai.ru:~/rest-api/src/routes/
scp src/server.js root@lumeai.ru:~/rest-api/src/

# Затем перезапусти
ssh root@lumeai.ru "pm2 restart lumeai && pm2 logs lumeai --lines 20"
```

---

### **Вариант 2: Git (если настроен)**

```bash
# Локально
git add src/routes/ai.js src/server.js
git commit -m "Add detailed logging for debugging"
git push

# На сервере
ssh root@lumeai.ru
cd ~/rest-api
git pull
pm2 restart lumeai
pm2 logs lumeai --lines 20
```

---

### **Вариант 3: Одна команда (если Git настроен)**

```bash
git add . && git commit -m "Fix and add logging" && git push && ssh root@lumeai.ru "cd ~/rest-api && git pull && pm2 restart lumeai && pm2 logs lumeai"
```

---

## 📊 **Что смотреть в логах:**

После перезапуска в логах должно появиться:

```
📥 Входящий запрос: { model: 'gpt-4', messagesCount: 1, ... }
G4F API недоступен, возвращаем mock-ответ: connect ECONNREFUSED 127.0.0.1:1337
✅ Mock-ответ отправлен: {
  "id": "chatcmpl-...",
  "object": "chat.completion",
  "choices": [{
    "message": {
      "role": "assistant",
      "content": "Привет! Я - LumeAI. Чем могу помочь?"
    }
  }]
}
```

---

## ✅ **Проверка:**

```bash
curl https://lumeai.ru/v1/chat/completions \
  -H "Authorization: Bearer sk-твой-ключ" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-4","messages":[{"role":"user","content":"Привет!"}]}'
```

---

## 🔍 **Если все еще ошибка:**

Покажи мне логи:
```bash
ssh root@lumeai.ru "pm2 logs lumeai --lines 50"
```

---

**ОБНОВИ ПРЯМО СЕЙЧАС!** ⚡
