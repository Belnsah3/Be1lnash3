const express = require('express');
const router = express.Router();
const axios = require('axios');
const { requireApiKey, logRequest } = require('../middleware/auth');
const { injectTools, processToolCalls, createFollowUpMessages, supportsTools } = require('../middleware/function-calling');

// Python G4F API - локальный FastAPI сервис с g4f библиотекой
// Endpoints: POST /v1/chat/completions, GET /v1/models
const PYTHON_G4F_API = process.env.PYTHON_G4F_API || 'http://localhost:5000';
const PYTHON_G4F_ADMIN_KEY = process.env.PYTHON_G4F_ADMIN_KEY || '56ce83efbb8ae2467f567ced95023b0958cda1f8a0704d84b6b7040628e1c632';

// Конфигурация по умолчанию
const DEFAULT_MODEL = 'gpt-4';

/**
 * @swagger
 * /ai/chat/completions:
 *   post:
 *     summary: Создать AI чат completion
 *     description: Отправляет запрос к AI модели через G4F и возвращает ответ
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - messages
 *             properties:
 *               messages:
 *                 type: array
 *                 description: Массив сообщений для отправки в AI
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [system, user, assistant]
 *                       description: Роль отправителя сообщения
 *                       example: user
 *                     content:
 *                       type: string
 *                       description: Содержание сообщения
 *                       example: Привет! Как дела?
 *               model:
 *                 type: string
 *                 description: Модель для использования
 *                 example: gpt-4
 *                 default: gpt-4
 *               provider:
 *                 type: string
 *                 description: Провайдер AI (опционально, автоматический выбор по умолчанию)
 *                 example: gpt4free.pro
 *               stream:
 *                 type: boolean
 *                 description: Включить потоковую передачу ответа
 *                 example: false
 *                 default: false
 *           examples:
 *             simple:
 *               summary: Простой запрос
 *               value:
 *                 messages:
 *                   - role: user
 *                     content: Привет! Расскажи мне интересный факт.
 *             withSystem:
 *               summary: С системным промптом
 *               value:
 *                 messages:
 *                   - role: system
 *                     content: Ты полезный ассистент, который отвечает кратко и по делу.
 *                   - role: user
 *                     content: Что такое машинное обучение?
 *                 model: gpt-4
 *     responses:
 *       200:
 *         description: Успешный ответ от AI
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     content:
 *                       type: string
 *                       description: Ответ от AI
 *                       example: Привет! У меня все отлично, спасибо за вопрос!
 *                     model:
 *                       type: string
 *                       description: Использованная модель
 *                       example: gpt-4
 *                     provider:
 *                       type: string
 *                       description: Использованный провайдер
 *                       example: Bing
 *       400:
 *         description: Неверный запрос
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Массив messages обязателен
 *       500:
 *         description: Ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Ошибка при обращении к AI
 */
router.post('/chat/completions', requireApiKey, async (req, res) => {
  try {
    const { messages, model = DEFAULT_MODEL, stream = false, provider, api = 'interference', tools } = req.body;
    
    console.log('📥 Входящий запрос:', {
      url: req.originalUrl,
      method: req.method,
      model,
      stream: stream,
      messagesCount: messages?.length,
      firstMessage: messages?.[0],
      api,
      toolsCount: tools?.length || 0,
      headers: {
        'content-type': req.headers['content-type'],
        'user-agent': req.headers['user-agent']
      }
    });
    
    // Валидация
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Массив messages обязателен и должен содержать хотя бы одно сообщение' 
      });
    }
    
    // Проверка структуры сообщений
    for (const msg of messages) {
      if (!msg.role || !msg.content) {
        return res.status(400).json({ 
          success: false,
          error: 'Каждое сообщение должно содержать role и content' 
        });
      }
      if (!['system', 'user', 'assistant'].includes(msg.role)) {
        return res.status(400).json({ 
          success: false,
          error: 'role должен быть одним из: system, user, assistant' 
        });
      }
    }
    
    // Отправляем запрос к Python G4F API
    console.log('🐍 Отправка запроса к Python G4F...');
    console.log('📝 Модель:', model);
    console.log('📨 Сообщений:', messages.length);
    
    // Streaming пока не поддерживается в Python версии
    if (stream === true) {
      console.log('⚠️ Streaming режим пока не поддерживается Python G4F, используем обычный режим');
    }
    
    // Для не-streaming запросов
    let requestBody = {
      model: model,
      messages: messages,
      stream: false
    };

    // Обработка Function Calling (tools)
    let hasTools = false;
    if (tools && tools.length > 0) {
      console.log(`🔧 Клиент передал ${tools.length} tools`);
      
      try {
        // Проверяем поддержку модели
        if (!supportsTools(model)) {
          console.warn(`⚠️ Модель ${model} может не поддерживать tools`);
        }
        
        // Добавляем tools в запрос
        requestBody = injectTools(requestBody, tools);
        hasTools = true;
        console.log('✅ Tools добавлены в запрос');
      } catch (error) {
        console.error('❌ Ошибка добавления tools:', error.message);
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }
    }
    
    // Отправляем запрос к Python G4F
    const pythonG4fResponse = await axios.post(`${PYTHON_G4F_API}/v1/chat/completions`, requestBody, {
      timeout: 120000, // 2 минуты для g4f
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': req.apiKeyValue || PYTHON_G4F_ADMIN_KEY // Используем API ключ пользователя или admin ключ
      }
    });
    
    console.log('✅ Ответ получен от Python G4F');
    console.log('📊 Статус:', pythonG4fResponse.status);
    
    // Python G4F возвращает ответ в формате: {success: true, data: {...}}
    const rawData = pythonG4fResponse.data;
    
    // Проверяем успешность
    if (!rawData.success) {
      console.error('❌ Ошибка от Python G4F:', rawData.error);
      return res.status(500).json({
        success: false,
        error: rawData.error || 'Ошибка при обращении к AI'
      });
    }
    
    console.log('📦 Получен ответ от Python G4F');
    
    // Извлекаем данные
    let responseData = rawData.data;

    // Обработка Function Calling - проверяем есть ли tool_calls
    if (hasTools && responseData.choices?.[0]?.message?.tool_calls) {
      console.log('🔧 Обнаружены tool_calls в ответе AI');
      
      try {
        const context = {
          userId: req.user?.id,
          apiKeyId: req.apiKey?.id,
          timeout: 5000
        };

        // Обрабатываем tool_calls
        const { toolResults, needsSecondCall } = await processToolCalls(responseData, context);

        if (needsSecondCall && toolResults) {
          console.log('🔄 Отправляем второй запрос к AI с результатами функций');

          // Создаем новые сообщения с результатами
          const followUpMessages = createFollowUpMessages(messages, responseData, toolResults);

          // Второй запрос к AI
          const secondRequest = {
            model: model,
            messages: followUpMessages,
            stream: false
          };

          const secondResponse = await axios.post(`${PYTHON_G4F_API}/v1/chat/completions`, secondRequest, {
            timeout: 120000,
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': req.apiKeyValue || PYTHON_G4F_ADMIN_KEY
            }
          });

          console.log('✅ Получен финальный ответ после выполнения функций');
          responseData = secondResponse.data.data; // Python G4F возвращает {success, data}
        }
      } catch (error) {
        console.error('❌ Ошибка обработки tool_calls:', error);
        // Продолжаем с исходным ответом
      }
    }
    
    // Отправляем ответ клиенту
    if (!res.headersSent) {
      res.json(responseData);
      console.log('✅ Ответ отправлен клиенту');
    } else {
      console.log('⚠️ Ответ уже был отправлен ранее!');
    }
    
  } catch (error) {
    console.error('Ошибка AI запроса:', error);
    
    // Возвращаем ошибку в OpenAI формате
    res.status(500).json({
      error: {
        message: error.response?.data?.error || error.message || 'Ошибка при обращении к AI',
        type: 'api_error',
        code: error.response?.status || 500
      }
    });
  }
});

/**
 * @swagger
 * /ai/models:
 *   get:
 *     summary: Получить список доступных AI моделей
 *     description: Возвращает информацию о поддерживаемых моделях
 *     tags: [AI]
 *     responses:
 *       200:
 *         description: Список моделей
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     models:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["gpt-4", "gpt-3.5-turbo", "claude-2", "llama-2"]
 *                     providers:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Bing", "ChatBase", "FreeGpt", "Phind"]
 */
router.get('/models', async (req, res) => {
  try {
    const response = await axios.get(`${PYTHON_G4F_API}/v1/models`, {
      headers: {
        'X-API-Key': PYTHON_G4F_ADMIN_KEY
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Ошибка получения моделей:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка при получении списка моделей: ' + (error.response?.data?.error || error.message)
    });
  }
});

/**
 * @swagger
 * /ai/providers:
 *   get:
 *     summary: Получить список AI провайдеров
 *     description: Возвращает информацию о доступных провайдерах
 *     tags: [AI]
 *     responses:
 *       200:
 *         description: Список провайдеров
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: Bing
 *                       status:
 *                         type: string
 *                         example: active
 *                       models:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["gpt-4"]
 */
router.get('/providers', async (req, res) => {
  try {
    const response = await axios.get(`${PYTHON_G4F_API}/v1/providers`, {
      headers: {
        'X-API-Key': PYTHON_G4F_ADMIN_KEY
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Ошибка получения провайдеров:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка при получении списка провайдеров: ' + (error.response?.data?.error || error.message)
    });
  }
});

/**
 * @swagger
 * /ai/test:
 *   get:
 *     summary: Тестовый endpoint для проверки AI
 *     description: Отправляет простой тестовый запрос к AI
 *     tags: [AI]
 *     responses:
 *       200:
 *         description: Тестовый ответ от AI
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: This is a test response
 *                     timestamp:
 *                       type: string
 *                       example: 2024-01-01T00:00:00.000Z
 */
router.get('/test', async (req, res) => {
  try {
    const response = await axios.get(`${PYTHON_G4F_API}/v1/test`, {
      headers: {
        'X-API-Key': PYTHON_G4F_ADMIN_KEY
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Ошибка тестового запроса:', error);
    res.status(500).json({
      success: false,
      error: 'Ошибка при тестировании AI: ' + (error.response?.data?.error || error.message),
      hint: 'Убедитесь, что Python G4F API запущен на ' + G4F_API_URL
    });
  }
});

module.exports = router;
