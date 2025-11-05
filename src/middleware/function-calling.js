const registry = require('../functions/registry');

/**
 * Middleware для обработки Function Calling
 * Обрабатывает tool_calls от AI и автоматически выполняет функции
 */

/**
 * Добавить tools в запрос если они указаны
 */
function injectTools(requestBody, userTools) {
    if (!userTools || userTools.length === 0) {
        return requestBody;
    }

    // Валидация tools
    for (const tool of userTools) {
        if (tool.type !== 'function') {
            throw new Error('Only function tools are supported');
        }
        
        const functionName = tool.function?.name;
        if (!functionName) {
            throw new Error('Tool must have a function name');
        }

        // Проверяем что функция зарегистрирована
        if (!registry.exists(functionName)) {
            throw new Error(`Function ${functionName} is not available`);
        }
    }

    // Добавляем tools в запрос
    return {
        ...requestBody,
        tools: userTools,
        tool_choice: 'auto' // AI сам решает когда вызывать функции
    };
}

/**
 * Обработать tool_calls из ответа AI
 */
async function processToolCalls(aiResponse, context) {
    const message = aiResponse.choices?.[0]?.message;
    
    if (!message || !message.tool_calls || message.tool_calls.length === 0) {
        // Нет tool_calls - возвращаем ответ как есть
        return { response: aiResponse, toolResults: null };
    }

    console.log(`🔧 AI запросил выполнение ${message.tool_calls.length} функций`);

    const toolResults = [];

    // Выполняем каждый tool_call
    for (const toolCall of message.tool_calls) {
        const functionName = toolCall.function.name;
        let functionArgs;

        try {
            // Парсим аргументы (они приходят как строка JSON)
            functionArgs = typeof toolCall.function.arguments === 'string'
                ? JSON.parse(toolCall.function.arguments)
                : toolCall.function.arguments;
        } catch (error) {
            console.error(`❌ Ошибка парсинга аргументов для ${functionName}:`, error);
            toolResults.push({
                tool_call_id: toolCall.id,
                role: 'tool',
                name: functionName,
                content: JSON.stringify({
                    success: false,
                    error: 'Invalid function arguments'
                })
            });
            continue;
        }

        console.log(`🔧 Выполнение: ${functionName}(${JSON.stringify(functionArgs).substring(0, 100)}...)`);

        // Выполняем функцию
        const result = await registry.execute(functionName, functionArgs, context);

        console.log(`✅ Результат ${functionName}:`, result.success ? 'успех' : 'ошибка');

        // Формируем результат в формате OpenAI
        toolResults.push({
            tool_call_id: toolCall.id,
            role: 'tool',
            name: functionName,
            content: JSON.stringify(result)
        });
    }

    return {
        response: aiResponse,
        toolResults,
        needsSecondCall: true // Нужен второй запрос к AI с результатами
    };
}

/**
 * Создать сообщения для второго запроса с результатами функций
 */
function createFollowUpMessages(originalMessages, aiResponse, toolResults) {
    const messages = [...originalMessages];

    // Добавляем ответ AI с tool_calls
    messages.push(aiResponse.choices[0].message);

    // Добавляем результаты выполнения функций
    for (const result of toolResults) {
        messages.push(result);
    }

    return messages;
}

/**
 * Проверка поддерживает ли модель tools
 */
function supportsTools(model) {
    // Список моделей поддерживающих function calling
    const supportedModels = [
        'gpt-4',
        'gpt-4-turbo',
        'gpt-4o',
        'gpt-3.5-turbo',
        'claude-3',
        'gemini-pro'
    ];

    return supportedModels.some(supported => 
        model.toLowerCase().includes(supported.toLowerCase())
    );
}

module.exports = {
    injectTools,
    processToolCalls,
    createFollowUpMessages,
    supportsTools
};
