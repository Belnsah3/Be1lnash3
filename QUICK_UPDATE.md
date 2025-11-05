# ⚡ **БЫСТРОЕ ОБНОВЛЕНИЕ - GPT4Free.pro**

## 🎯 **Что нужно сделать:**

Обновить `src/routes/ai.js` на сервере и перезапустить.

---

## 🚀 **БЫСТРАЯ КОМАНДА (скопируй и выполни):**

### **Вариант 1: Git (если настроен)**

```bash
# Локально
git add . && git commit -m "Add GPT4Free.pro support" && git push

# На сервере
ssh root@lumeai.ru "cd ~/rest-api && git pull && pm2 restart lumeai && pm2 logs lumeai --lines 20"
```

---

### **Вариант 2: SCP (быстрее)**

```bash
# С локального компьютера (PowerShell)
scp src/routes/ai.js root@lumeai.ru:~/rest-api/src/routes/
ssh root@lumeai.ru "pm2 restart lumeai && pm2 logs lumeai --lines 20"
```

---

## ✅ **Проверка:**

После перезапуска в логах должно быть:

```
🌐 Отправка запроса к GPT4Free.pro...
✅ Ответ получен от GPT4Free.pro
✅ Ответ отправлен клиенту
```

---

## 🧪 **Тест:**

```bash
curl https://lumeai.ru/v1/chat/completions \
  -H "Authorization: Bearer sk-твой-ключ" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-4","messages":[{"role":"user","content":"Привет!"}]}'
```

**Должен вернуть реальный AI ответ!** 🎉

---

**ОБНОВИ ПРЯМО СЕЙЧАС!** ⚡
