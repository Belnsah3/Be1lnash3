# 📁 File Upload для Function Calling - Руководство

## 🎯 Как это работает

Каждый API ключ получает **свою изолированную папку** для хранения файлов.  
AI может читать только файлы **вашего** API ключа.

---

## 🚀 Быстрый старт

### **Шаг 1: Загрузи файлы**

```bash
curl -X POST https://lumeai.ru/api/v1/files/upload \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "files=@MyPlugin.zip" \
  -F "extractZip=true"
```

### **Шаг 2: Используй Function Calling**

```bash
curl -X POST https://lumeai.ru/api/v1/ai/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [{
      "role": "user",
      "content": "Прочитай файл MyPlugin/src/Main.java"
    }],
    "tools": [{
      "type": "function",
      "function": {
        "name": "read_file",
        "description": "Читает файл",
        "parameters": {
          "type": "object",
          "properties": {
            "path": {"type": "string"}
          },
          "required": ["path"]
        }
      }
    }]
  }'
```

### **Шаг 3: AI читает файл и отвечает!**

---

## 📤 API для управления файлами

### **1. Загрузка файлов**

**Endpoint:** `POST /api/v1/files/upload`

**Параметры:**
- `files` - Файлы для загрузки (до 10 файлов)
- `extractZip` - Автоматически распаковать ZIP (опционально)

**Пример:**
```bash
# Загрузить один файл
curl -X POST https://lumeai.ru/api/v1/files/upload \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "files=@Main.java"

# Загрузить ZIP и распаковать
curl -X POST https://lumeai.ru/api/v1/files/upload \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "files=@MyPlugin.zip" \
  -F "extractZip=true"

# Загрузить несколько файлов
curl -X POST https://lumeai.ru/api/v1/files/upload \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "files=@File1.java" \
  -F "files=@File2.java" \
  -F "files=@plugin.yml"
```

**Ответ:**
```json
{
  "success": true,
  "message": "3 file(s) uploaded",
  "files": [
    {
      "originalName": "MyPlugin.zip",
      "size": 1024000,
      "path": "MyPlugin.zip",
      "extracted": true,
      "extractedTo": "MyPlugin"
    }
  ]
}
```

---

### **2. Список файлов**

**Endpoint:** `GET /api/v1/files?path=...`

**Параметры:**
- `path` - Путь к директории (опционально)

**Примеры:**
```bash
# Список всех файлов
curl https://lumeai.ru/api/v1/files \
  -H "Authorization: Bearer YOUR_API_KEY"

# Список файлов в папке
curl "https://lumeai.ru/api/v1/files?path=MyPlugin/src" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Ответ:**
```json
{
  "success": true,
  "files": [
    {
      "name": "Main.java",
      "type": "file",
      "size": 5432,
      "modified": "2025-11-05T17:00:00Z",
      "path": "MyPlugin/src/Main.java"
    },
    {
      "name": "config",
      "type": "directory",
      "size": null,
      "modified": "2025-11-05T17:00:00Z",
      "path": "MyPlugin/config"
    }
  ],
  "path": "MyPlugin",
  "total": 2
}
```

---

### **3. Удаление файлов**

**Endpoint:** `DELETE /api/v1/files/{path}`

**Примеры:**
```bash
# Удалить файл
curl -X DELETE https://lumeai.ru/api/v1/files/MyPlugin/old.txt \
  -H "Authorization: Bearer YOUR_API_KEY"

# Удалить директорию
curl -X DELETE https://lumeai.ru/api/v1/files/OldPlugin \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Ответ:**
```json
{
  "success": true,
  "message": "File deleted",
  "path": "MyPlugin/old.txt"
}
```

---

### **4. Статистика**

**Endpoint:** `GET /api/v1/files/stats`

**Пример:**
```bash
curl https://lumeai.ru/api/v1/files/stats \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Ответ:**
```json
{
  "success": true,
  "stats": {
    "totalFiles": 42,
    "totalSize": 10485760,
    "totalSizeMB": "10.00",
    "directories": 8
  }
}
```

---

## 🔧 Function Calling с загруженными файлами

### **Пример 1: Чтение файла**

```javascript
{
  "model": "gpt-4",
  "messages": [{
    "role": "user",
    "content": "Покажи содержимое Main.java"
  }],
  "tools": [{
    "type": "function",
    "function": {
      "name": "read_file",
      "description": "Читает файл",
      "parameters": {
        "type": "object",
        "properties": {
          "path": {
            "type": "string",
            "description": "Путь к файлу"
          }
        },
        "required": ["path"]
      }
    }
  }]
}
```

**AI автоматически:**
1. Поймет что нужно прочитать Main.java
2. Вызовет функцию `read_file`
3. Получит содержимое из **вашей** папки
4. Проанализирует и ответит

---

### **Пример 2: Поиск в файлах**

```javascript
{
  "model": "gpt-4",
  "messages": [{
    "role": "user",
    "content": "Найди все обработчики событий в плагине"
  }],
  "tools": [{
    "type": "function",
    "function": {
      "name": "search_in_files",
      "description": "Поиск в файлах",
      "parameters": {
        "type": "object",
        "properties": {
          "path": {"type": "string"},
          "query": {"type": "string"},
          "file_pattern": {"type": "string"}
        },
        "required": ["path", "query"]
      }
    }
  }]
}
```

---

### **Пример 3: Список файлов**

```javascript
{
  "model": "gpt-4",
  "messages": [{
    "role": "user",
    "content": "Покажи структуру проекта"
  }],
  "tools": [{
    "type": "function",
    "function": {
      "name": "list_directory",
      "description": "Список файлов",
      "parameters": {
        "type": "object",
        "properties": {
          "path": {"type": "string"},
          "recursive": {"type": "boolean"}
        },
        "required": ["path"]
      }
    }
  }]
}
```

---

## 💻 Примеры на разных языках

### **Python**

```python
import requests

API_KEY = "your_api_key_here"
BASE_URL = "https://lumeai.ru/api/v1"

# 1. Загрузить файл
files = {'files': open('MyPlugin.zip', 'rb')}
data = {'extractZip': 'true'}
response = requests.post(
    f"{BASE_URL}/files/upload",
    headers={'Authorization': f'Bearer {API_KEY}'},
    files=files,
    data=data
)
print(response.json())

# 2. Список файлов
response = requests.get(
    f"{BASE_URL}/files",
    headers={'Authorization': f'Bearer {API_KEY}'}
)
print(response.json())

# 3. Function Calling
response = requests.post(
    f"{BASE_URL}/ai/chat/completions",
    headers={
        'Authorization': f'Bearer {API_KEY}',
        'Content-Type': 'application/json'
    },
    json={
        'model': 'gpt-4',
        'messages': [{'role': 'user', 'content': 'Прочитай Main.java'}],
        'tools': [{
            'type': 'function',
            'function': {
                'name': 'read_file',
                'description': 'Читает файл',
                'parameters': {
                    'type': 'object',
                    'properties': {'path': {'type': 'string'}},
                    'required': ['path']
                }
            }
        }]
    }
)
print(response.json())
```

---

### **Node.js**

```javascript
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const API_KEY = 'your_api_key_here';
const BASE_URL = 'https://lumeai.ru/api/v1';

// 1. Загрузить файл
async function uploadFile() {
    const form = new FormData();
    form.append('files', fs.createReadStream('MyPlugin.zip'));
    form.append('extractZip', 'true');

    const response = await axios.post(`${BASE_URL}/files/upload`, form, {
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            ...form.getHeaders()
        }
    });
    
    console.log(response.data);
}

// 2. Список файлов
async function listFiles() {
    const response = await axios.get(`${BASE_URL}/files`, {
        headers: {'Authorization': `Bearer ${API_KEY}`}
    });
    
    console.log(response.data);
}

// 3. Function Calling
async function askAI() {
    const response = await axios.post(`${BASE_URL}/ai/chat/completions`, {
        model: 'gpt-4',
        messages: [{role: 'user', content: 'Прочитай Main.java'}],
        tools: [{
            type: 'function',
            function: {
                name: 'read_file',
                description: 'Читает файл',
                parameters: {
                    type: 'object',
                    properties: {path: {type: 'string'}},
                    required: ['path']
                }
            }
        }]
    }, {
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
        }
    });
    
    console.log(response.data.choices[0].message.content);
}
```

---

## 🔒 Безопасность

### **Изоляция по API ключу:**
- ✅ Каждый API ключ имеет **свою папку**
- ✅ Доступ только к **своим файлам**
- ✅ Нет доступа к файлам других пользователей

### **Ограничения:**
- 📏 Макс. размер файла: **50MB**
- 📦 Макс. файлов за раз: **10**
- 🔒 Только чтение (нет записи/удаления через Function Calling)
- ✅ Защита от path traversal

### **Разрешенные типы файлов:**
```
.zip, .jar, .java, .js, .json, .yml, .yaml,
.txt, .md, .xml, .properties
```

---

## 📊 Workflow

```
1. Клиент загружает файлы
   POST /api/v1/files/upload
   
2. Файлы сохраняются в:
   uploads/api_{KEY_ID}/...
   
3. Клиент отправляет запрос с tools
   POST /api/v1/ai/chat/completions
   
4. AI вызывает функцию
   read_file("MyPlugin/Main.java")
   
5. Функция читает из папки клиента
   uploads/api_{KEY_ID}/MyPlugin/Main.java
   
6. Результат возвращается AI
   
7. AI формирует ответ с учетом содержимого файла
```

---

## 🐛 Troubleshooting

### **Ошибка: "File too large"**
**Решение:** Файл больше 50MB. Сожми или раздели на части.

### **Ошибка: "File type not allowed"**
**Решение:** Используй разрешенные типы файлов или загрузи как ZIP.

### **Ошибка: "File not found" при Function Calling**
**Решение:** 
1. Проверь что файл загружен: `GET /api/v1/files`
2. Проверь путь в запросе
3. Убедись что используешь правильный API ключ

### **Ошибка: "API key context required"**
**Решение:** Передай API ключ в заголовке `Authorization: Bearer YOUR_KEY`

---

## 🎯 Лучшие практики

### **1. Используй ZIP для множества файлов**
```bash
# Упакуй проект
zip -r MyPlugin.zip MyPlugin/

# Загрузи и автоматически распакуй
curl -X POST https://lumeai.ru/api/v1/files/upload \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "files=@MyPlugin.zip" \
  -F "extractZip=true"
```

### **2. Проверяй загрузку**
```bash
# После загрузки проверь структуру
curl https://lumeai.ru/api/v1/files \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### **3. Очищай старые файлы**
```bash
# Удаляй ненужное
curl -X DELETE https://lumeai.ru/api/v1/files/OldPlugin \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### **4. Используй конкретные пути в Function Calling**
❌ Плохо: `"path": ""`  
✅ Хорошо: `"path": "MyPlugin/src"`

---

## 📚 Полный пример

```python
import requests

API_KEY = "sk-..."
BASE_URL = "https://lumeai.ru/api/v1"

# 1. Загружаем плагин
files = {'files': open('MyPlugin.zip', 'rb')}
data = {'extractZip': 'true'}
upload = requests.post(
    f"{BASE_URL}/files/upload",
    headers={'Authorization': f'Bearer {API_KEY}'},
    files=files,
    data=data
)
print("Uploaded:", upload.json())

# 2. Проверяем структуру
files_list = requests.get(
    f"{BASE_URL}/files",
    headers={'Authorization': f'Bearer {API_KEY}'}
)
print("Files:", files_list.json())

# 3. Просим AI проанализировать
analysis = requests.post(
    f"{BASE_URL}/ai/chat/completions",
    headers={
        'Authorization': f'Bearer {API_KEY}',
        'Content-Type': 'application/json'
    },
    json={
        'model': 'gpt-4',
        'messages': [{
            'role': 'user',
            'content': 'Проанализируй плагин MyPlugin и объясни что он делает'
        }],
        'tools': [
            {
                'type': 'function',
                'function': {
                    'name': 'list_directory',
                    'description': 'Список файлов',
                    'parameters': {
                        'type': 'object',
                        'properties': {
                            'path': {'type': 'string'},
                            'recursive': {'type': 'boolean'}
                        },
                        'required': ['path']
                    }
                }
            },
            {
                'type': 'function',
                'function': {
                    'name': 'read_file',
                    'description': 'Читает файл',
                    'parameters': {
                        'type': 'object',
                        'properties': {'path': {'type': 'string'}},
                        'required': ['path']
                    }
                }
            }
        ]
    }
)

print("AI Response:", analysis.json()['choices'][0]['message']['content'])
```

---

## 🎉 Готово!

Теперь ты можешь:
- ✅ Загружать свои файлы
- ✅ Использовать AI для анализа кода
- ✅ Читать и искать в своих проектах
- ✅ Получать помощь AI с твоим кодом

**Полезные ссылки:**
- API Документация: https://lumeai.ru/api-docs
- Function Calling Guide: `FUNCTION_CALLING_GUIDE.md`
- Примеры: `SESSION_4_PLAN.md`
