const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: AI Chat Completions
 *     description: Endpoints для работы с AI моделями (OpenAI-совместимые)
 *   - name: Alternative Endpoints
 *     description: Альтернативные endpoints для разных клиентов
 *   - name: Models
 *     description: Получение списка доступных моделей
 */

/**
 * @swagger
 * /v1/chat/completions:
 *   post:
 *     summary: OpenAI-совместимый endpoint (основной)
 *     description: |
 *       Стандартный OpenAI endpoint для chat completions.
 *       
 *       **Используют:**
 *       - ChatGPT клиенты
 *       - OpenAI SDK
 *       - LangChain
 *       - LlamaIndex
 *       - Большинство AI приложений
 *       
 *       **Base URL:** `https://lumeai.ru`
 *     tags: [AI Chat Completions]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChatCompletionRequest'
 *           examples:
 *             simple:
 *               summary: Простой запрос
 *               value:
 *                 model: gpt-4
 *                 messages:
 *                   - role: user
 *                     content: Привет! Как дела?
 *             withSystem:
 *               summary: С системным промптом
 *               value:
 *                 model: claude-sonnet-4.5
 *                 messages:
 *                   - role: system
 *                     content: Ты полезный ассистент
 *                   - role: user
 *                     content: Расскажи про LumeAI
 *     responses:
 *       200:
 *         description: Успешный ответ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatCompletionResponse'
 *       401:
 *         description: Неверный API ключ
 *       500:
 *         description: Ошибка сервера
 */

/**
 * @swagger
 * /v1/responses:
 *   post:
 *     summary: Kilo Code endpoint
 *     description: |
 *       Специальный endpoint для Kilo Code и похожих IDE.
 *       
 *       **Используют:**
 *       - Kilo Code
 *       - Некоторые VS Code расширения
 *       - Cursor AI (альтернативный)
 *       
 *       **Base URL для Kilo Code:** `https://lumeai.ru`
 *     tags: [Alternative Endpoints]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChatCompletionRequest'
 *     responses:
 *       200:
 *         description: Успешный ответ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatCompletionResponse'
 */

/**
 * @swagger
 * /v1/messages:
 *   post:
 *     summary: Anthropic Claude-совместимый endpoint
 *     description: |
 *       Endpoint совместимый с Anthropic Claude API.
 *       
 *       **Используют:**
 *       - Claude API клиенты
 *       - Anthropic SDK
 *       - Приложения с поддержкой Claude
 *     tags: [Alternative Endpoints]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChatCompletionRequest'
 *     responses:
 *       200:
 *         description: Успешный ответ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatCompletionResponse'
 */

/**
 * @swagger
 * /v1/completions:
 *   post:
 *     summary: OpenAI Completions endpoint
 *     description: |
 *       Альтернативный OpenAI endpoint для completions.
 *       
 *       **Используют:**
 *       - Старые версии OpenAI SDK
 *       - Некоторые кастомные клиенты
 *     tags: [Alternative Endpoints]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChatCompletionRequest'
 *     responses:
 *       200:
 *         description: Успешный ответ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatCompletionResponse'
 */

/**
 * @swagger
 * /openai/deployments/gpt-4/chat/completions:
 *   post:
 *     summary: Azure OpenAI-совместимый endpoint
 *     description: |
 *       Endpoint совместимый с Azure OpenAI Service.
 *       
 *       **Используют:**
 *       - Azure OpenAI клиенты
 *       - Microsoft приложения
 *     tags: [Alternative Endpoints]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChatCompletionRequest'
 *     responses:
 *       200:
 *         description: Успешный ответ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatCompletionResponse'
 */

/**
 * @swagger
 * /v1/models:
 *   get:
 *     summary: Получить список всех моделей
 *     description: |
 *       Возвращает список всех 69 доступных AI моделей в формате OpenAI.
 *       
 *       **Не требует авторизации** (для совместимости с клиентами)
 *       
 *       **Доступные модели:**
 *       - Claude (8 моделей)
 *       - Gemini (6 моделей)
 *       - GPT (8 моделей)
 *       - DeepSeek (4 модели)
 *       - Grok (4 модели)
 *       - Llama (7 моделей)
 *       - Mistral (5 моделей)
 *       - Qwen (4 модели)
 *       - И другие...
 *     tags: [Models]
 *     responses:
 *       200:
 *         description: Список моделей
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 object:
 *                   type: string
 *                   example: list
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Model'
 *             example:
 *               object: list
 *               data:
 *                 - id: gpt-4
 *                   object: model
 *                   created: 1686935002
 *                   owned_by: lumeai
 *                 - id: claude-sonnet-4.5
 *                   object: model
 *                   created: 1686935002
 *                   owned_by: lumeai
 *                 - id: gemini-2.5-pro
 *                   object: model
 *                   created: 1686935002
 *                   owned_by: lumeai
 */

/**
 * @swagger
 * /chat/completions:
 *   post:
 *     summary: Корневой chat completions endpoint
 *     description: Альтернативный endpoint без версии в пути
 *     tags: [Alternative Endpoints]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChatCompletionRequest'
 *     responses:
 *       200:
 *         description: Успешный ответ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatCompletionResponse'
 */

/**
 * @swagger
 * /api/chat/completions:
 *   post:
 *     summary: API chat completions endpoint
 *     description: Endpoint с префиксом /api для некоторых клиентов
 *     tags: [Alternative Endpoints]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChatCompletionRequest'
 *     responses:
 *       200:
 *         description: Успешный ответ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatCompletionResponse'
 */

module.exports = router;
