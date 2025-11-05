const express = require('express');
const router = express.Router();
const axios = require('axios');
const { requireApiKey, logRequest } = require('../middleware/auth');

// GPT4Free.pro API - бесплатный AI провайдер (OpenAI-compatible)
// Endpoints: POST /v1/chat/completions, POST /v1/images/generations, GET /v1/models
const GPT4FREE_PRO_API = process.env.GPT4FREE_PRO_API || 'https://gpt4free.pro';

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
    const { messages, model = DEFAULT_MODEL, stream = false, provider, api = 'interference' } = req.body;
    
    console.log('📥 Входящий запрос:', {
      url: req.originalUrl,
      method: req.method,
      model,
      stream: stream,
      messagesCount: messages?.length,
      firstMessage: messages?.[0],
      api,
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
    
    // Отправляем запрос к GPT4Free.pro (OpenAI-compatible API)
    console.log('🌐 Отправка запроса к GPT4Free.pro...');
    console.log('📝 Модель:', model);
    console.log('📨 Сообщений:', messages.length);
    
    // Если клиент запрашивает streaming - отправляем как есть от GPT4Free.pro
    if (stream === true) {
      console.log('🌊 Клиент запросил streaming режим');
      
      const requestBody = {
        model: model,
        messages: messages,
        stream: true
      };
      
      const gpt4freeResponse = await axios.post(`${GPT4FREE_PRO_API}/v1/chat/completions`, requestBody, {
        timeout: 60000,
        headers: {
          'Content-Type': 'application/json'
        },
        responseType: 'stream'
      });
      
      // Устанавливаем заголовки для SSE
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      console.log('✅ Начинаем streaming от GPT4Free.pro к клиенту');
      
      // Пробрасываем stream напрямую
      gpt4freeResponse.data.pipe(res);
      
      gpt4freeResponse.data.on('end', () => {
        console.log('✅ Streaming завершен');
      });
      
      return;
    }
    
    // Для не-streaming запросов
    const requestBody = {
      model: model,
      messages: messages,
      stream: false
    };
    
    const gpt4freeResponse = await axios.post(`${GPT4FREE_PRO_API}/v1/chat/completions`, requestBody, {
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Ответ получен от GPT4Free.pro');
    console.log('📊 Статус:', gpt4freeResponse.status);
    
    // GPT4Free.pro возвращает streaming ответ в формате SSE (Server-Sent Events)
    // Нужно распарсить его и собрать в полный ответ
    const rawData = gpt4freeResponse.data;
    
    // Если это строка (streaming формат), парсим её
    if (typeof rawData === 'string') {
      console.log('📦 Получен streaming ответ, парсим...');
      
      // Разбиваем на строки и парсим каждый chunk
      const lines = rawData.split('\n').filter(line => line.trim().startsWith('data: '));
      let fullContent = '';
      let lastChunk = null;
      
      for (const line of lines) {
        const data = line.replace('data: ', '').trim();
        if (data === '[DONE]') break;
        
        try {
          const chunk = JSON.parse(data);
          if (chunk.choices && chunk.choices[0] && chunk.choices[0].delta && chunk.choices[0].delta.content) {
            fullContent += chunk.choices[0].delta.content;
          }
          lastChunk = chunk;
        } catch (e) {
          // Игнорируем ошибки парсинга
        }
      }
      
      console.log('✅ Собран полный ответ:', fullContent.substring(0, 100) + '...');
      
      // Формируем ответ в OpenAI формате
      const responseData = {
        id: lastChunk?.id || `chatcmpl-${Date.now()}`,
        object: 'chat.completion',
        created: lastChunk?.created || Math.floor(Date.now() / 1000),
        model: model,
        choices: [{
          index: 0,
          message: {
            role: 'assistant',
            content: fullContent
          },
          finish_reason: 'stop'
        }],
        usage: lastChunk?.usage || {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0
        }
      };
      
      console.log('📤 Отправка ответа клиенту...');
      console.log('📊 Размер ответа:', JSON.stringify(responseData).length, 'байт');
      console.log('📋 Структура ответа:', {
        id: responseData.id,
        model: responseData.model,
        contentLength: responseData.choices[0].message.content.length,
        hasUsage: !!responseData.usage
      });
      
      // Проверяем что ответ еще не отправлен
      if (!res.headersSent) {
        // Устанавливаем заголовки явно
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(responseData);
        console.log('✅ Ответ отправлен клиенту (status 200)');
      } else {
        console.log('⚠️ Ответ уже был отправлен ранее!');
      }
      return;
      
    } else {
      // Если это уже объект, возвращаем как есть
      console.log('📦 Получен обычный ответ');
      
      if (!res.headersSent) {
        res.json(rawData);
        console.log('✅ Ответ отправлен клиенту');
      } else {
        console.log('⚠️ Ответ уже был отправлен ранее!');
      }
      return;
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
    const response = await axios.get(`${G4F_API_URL}/v1/models`);
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
    const response = await axios.get(`${G4F_API_URL}/v1/providers`);
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
    const response = await axios.get(`${G4F_API_URL}/v1/test`);
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
