# 🔧 Function Calling - Руководство

## 📖 Что такое Function Calling?

Function Calling позволяет AI вызывать функции на вашем сервере для получения дополнительной информации.

**Примеры использования:**
- 📁 Чтение файлов из папки с плагинами
- 🔍 Поиск по коду
- 📊 Получение информации о файлах
- 🗂️ Просмотр структуры проекта

---

## 🚀 Быстрый старт

### **1. Настройка базовых путей**

Отредактируй `src/config/functions.js`:

```javascript
allowedBasePaths: [
    '/path/to/your/plugins',  // Замени на свой путь!
    '/path/to/your/docs'
],
```

### **2. Перезапусти сервер**

```bash
pm2 restart lumeai
```

### **3. Готово!**

Теперь можешь использовать Function Calling через API!

---

## 📝 Доступные функции

### **1. read_file** - Чтение файла

Читает содержимое файла из разрешенных директорий.

**Параметры:**
- `path` (string, required) - Относительный путь к файлу
- `encoding` (string, optional) - Кодировка (по умолчанию utf-8)

**Пример:**
```json
{
  "name": "read_file",
  "arguments": {
    "path": "MyPlugin/src/Main.java"
  }
}
```

---

### **2. list_directory** - Список файлов

Получить список файлов в директории.

**Параметры:**
- `path` (string, required) - Путь к директории
- `recursive` (boolean, optional) - Рекурсивный обход
- `filter` (string, optional) - Фильтр файлов (*.java)
- `max_depth` (number, optional) - Макс. глубина (default: 5)

**Пример:**
```json
{
  "name": "list_directory",
  "arguments": {
    "path": "MyPlugin",
    "recursive": true,
    "filter": "*.java"
  }
}
```

---

### **3. search_in_files** - Поиск в файлах

Поиск текста в файлах директории.

**Параметры:**
- `path` (string, required) - Путь для поиска
- `query` (string, required) - Поисковый запрос
- `case_sensitive` (boolean, optional) - Учитывать регистр
- `file_pattern` (string, optional) - Паттерн файлов
- `max_results` (number, optional) - Макс. результатов

**Пример:**
```json
{
  "name": "search_in_files",
  "arguments": {
    "path": "MyPlugin",
    "query": "onPlayerJoin",
    "file_pattern": "*.java"
  }
}
```

---

### **4. get_file_info** - Информация о файле

Получить метаданные файла.

**Параметры:**
- `path` (string, required) - Путь к файлу

**Пример:**
```json
{
  "name": "get_file_info",
  "arguments": {
    "path": "MyPlugin/plugin.yml"
  }
}
```

---

## 💻 Примеры использования

### **Пример 1: Простой запрос с tools**

```bash
curl -X POST https://lumeai.ru/api/v1/ai/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [
      {
        "role": "user",
        "content": "Прочитай файл MyPlugin/src/Main.java"
      }
    ],
    "tools": [
      {
        "type": "function",
        "function": {
          "name": "read_file",
          "description": "Читает содержимое файла",
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
      }
    ]
  }'
```

---

### **Пример 2: JavaScript/Node.js**

```javascript
const axios = require('axios');

async function askAI() {
  const response = await axios.post('https://lumeai.ru/api/v1/ai/chat/completions', {
    model: 'gpt-4',
    messages: [
      {
        role: 'user',
        content: 'Найди все файлы с расширением .java в папке MyPlugin'
      }
    ],
    tools: [
      {
        type: 'function',
        function: {
          name: 'list_directory',
          description: 'Список файлов в директории',
          parameters: {
            type: 'object',
            properties: {
              path: { type: 'string' },
              recursive: { type: 'boolean' },
              filter: { type: 'string' }
            },
            required: ['path']
          }
        }
      }
    ]
  }, {
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    }
  });

  console.log(response.data.choices[0].message.content);
}

askAI();
```

---

### **Пример 3: Python**

```python
import requests

def ask_ai():
    response = requests.post(
        'https://lumeai.ru/api/v1/ai/chat/completions',
        headers={
            'Authorization': 'Bearer YOUR_API_KEY',
            'Content-Type': 'application/json'
        },
        json={
            'model': 'gpt-4',
            'messages': [
                {
                    'role': 'user',
                    'content': 'Найди все упоминания "onPlayerJoin" в плагине'
                }
            ],
            'tools': [
                {
                    'type': 'function',
                    'function': {
                        'name': 'search_in_files',
                        'description': 'Поиск в файлах',
                        'parameters': {
                            'type': 'object',
                            'properties': {
                                'path': {'type': 'string'},
                                'query': {'type': 'string'},
                                'file_pattern': {'type': 'string'}
                            },
                            'required': ['path', 'query']
                        }
                    }
                }
            ]
        }
    )
    
    print(response.json()['choices'][0]['message']['content'])

ask_ai()
```

---

## 🔄 Как это работает

### **Шаг 1: Клиент отправляет запрос с tools**
```json
{
  "model": "gpt-4",
  "messages": [...],
  "tools": [...]
}
```

### **Шаг 2: AI решает вызвать функцию**
AI анализирует запрос и решает что нужно вызвать функцию:
```json
{
  "tool_calls": [{
    "function": "read_file",
    "arguments": {"path": "MyPlugin/Main.java"}
  }]
}
```

### **Шаг 3: Сервер автоматически выполняет функцию**
Функция выполняется на сервере и возвращает результат.

### **Шаг 4: AI получает результат и отвечает пользователю**
AI использует результат функции для формирования финального ответа.

---

## 🔒 Безопасность

### **Ограничения:**
- ✅ Только чтение файлов (не запись/удаление)
- ✅ Белый список папок (только allowedBasePaths)
- ✅ Макс. размер файла: 1MB
- ✅ Защита от path traversal
- ✅ Только разрешенные расширения

### **Валидация:**
```javascript
// Проверяется автоматически:
- API ключ
- Путь к файлу
- Размер файла
- Расширение файла
- Существование функции
```

---

## ⚙️ Конфигурация

### **Изменить разрешенные папки:**

Редактируй `src/config/functions.js`:

```javascript
allowedBasePaths: [
    '/home/user/plugins',
    '/var/www/docs'
],
```

### **Изменить макс. размер файла:**

```javascript
maxFileSize: 2 * 1024 * 1024, // 2MB
```

### **Добавить разрешенные расширения:**

```javascript
allowedExtensions: [
    '.java', '.js', '.py',
    '.txt', '.md', '.json',
    '.cpp', '.h'  // Добавь свои!
],
```

---

## 📊 Мониторинг

### **Просмотр статистики функций:**

```javascript
const registry = require('./src/functions/registry');

console.log(registry.getStats());
// Выведет:
// {
//   totalFunctions: 4,
//   totalExecutions: 15,
//   functions: {
//     read_file: { callCount: 10, lastCalled: Date },
//     list_directory: { callCount: 3, lastCalled: Date },
//     ...
//   }
// }
```

### **Последние выполнения:**

```javascript
console.log(registry.getRecentExecutions(5));
```

---

## 🐛 Устранение проблем

### **Проблема: "Function not found"**
**Решение:** Проверь что функция зарегистрирована в `src/functions/init.js`

### **Проблема: "Access to this path is not allowed"**
**Решение:** Добавь путь в `allowedBasePaths` в конфигурации

### **Проблема: "File too large"**
**Решение:** Увеличь `maxFileSize` или используй фильтры

### **Проблема: "File type not allowed"**
**Решение:** Добавь расширение в `allowedExtensions`

---

## 🎯 Лучшие практики

### **1. Используй конкретные пути**
❌ Плохо: `"path": "/"`  
✅ Хорошо: `"path": "MyPlugin/src"`

### **2. Используй фильтры**
```json
{
  "filter": "*.java",
  "max_depth": 3
}
```

### **3. Проверяй размер файлов**
Не пытайся читать очень большие файлы (>1MB)

### **4. Используй поиск вместо чтения всех файлов**
Если ищешь конкретный текст - используй `search_in_files`

---

## 📚 Дополнительные примеры

### **Пример: Анализ структуры проекта**

```javascript
{
  "messages": [{
    "role": "user",
    "content": "Покажи структуру папки MyPlugin"
  }],
  "tools": [{
    "type": "function",
    "function": {
      "name": "list_directory",
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

### **Пример: Поиск по нескольким паттернам**

```javascript
{
  "messages": [{
    "role": "user",
    "content": "Найди все обработчики событий в плагине"
  }],
  "tools": [{
    "type": "function",
    "function": {
      "name": "search_in_files",
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

## 🎉 Готово!

Теперь твой API поддерживает Function Calling!

**Полезные ссылки:**
- API Документация: https://lumeai.ru/api-docs
- Примеры: `SESSION_4_PLAN.md`
- Конфигурация: `src/config/functions.js`

**Нужна помощь?** Проверь логи:
```bash
pm2 logs lumeai
```
