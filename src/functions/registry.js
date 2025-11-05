/**
 * Function Registry - система регистрации и выполнения функций
 */

class FunctionRegistry {
    constructor() {
        this.functions = new Map();
        this.executionLog = [];
    }

    /**
     * Регистрация функции
     * @param {string} name - Имя функции
     * @param {object} definition - Определение функции (OpenAI формат)
     * @param {function} handler - Обработчик функции
     */
    register(name, definition, handler) {
        if (this.functions.has(name)) {
            throw new Error(`Function ${name} already registered`);
        }

        this.functions.set(name, {
            name,
            definition,
            handler,
            callCount: 0,
            lastCalled: null
        });

        console.log(`✅ Registered function: ${name}`);
    }

    /**
     * Получить все зарегистрированные функции
     * @returns {Array} Массив определений функций
     */
    getAllDefinitions() {
        return Array.from(this.functions.values()).map(fn => ({
            type: 'function',
            function: fn.definition
        }));
    }

    /**
     * Получить определение функции по имени
     * @param {string} name - Имя функции
     * @returns {object|null} Определение функции
     */
    getDefinition(name) {
        const fn = this.functions.get(name);
        return fn ? fn.definition : null;
    }

    /**
     * Проверка существования функции
     * @param {string} name - Имя функции
     * @returns {boolean}
     */
    exists(name) {
        return this.functions.has(name);
    }

    /**
     * Выполнение функции
     * @param {string} name - Имя функции
     * @param {object} args - Аргументы функции
     * @param {object} context - Контекст выполнения (user, apiKey и т.д.)
     * @returns {Promise<object>} Результат выполнения
     */
    async execute(name, args, context = {}) {
        const fn = this.functions.get(name);
        
        if (!fn) {
            return {
                success: false,
                error: `Function ${name} not found`
            };
        }

        try {
            // Валидация аргументов
            const validationError = this.validateArguments(fn.definition, args);
            if (validationError) {
                return {
                    success: false,
                    error: validationError
                };
            }

            // Логирование
            const executionId = this.logExecution(name, args, context);

            // Выполнение с таймаутом
            const result = await this.executeWithTimeout(
                fn.handler(args, context),
                context.timeout || 5000
            );

            // Обновление статистики
            fn.callCount++;
            fn.lastCalled = new Date();

            // Обновление лога
            this.updateExecutionLog(executionId, { success: true, result });

            return {
                success: true,
                ...result
            };

        } catch (error) {
            console.error(`Error executing function ${name}:`, error);
            
            return {
                success: false,
                error: error.message || 'Function execution failed'
            };
        }
    }

    /**
     * Валидация аргументов функции
     * @param {object} definition - Определение функции
     * @param {object} args - Аргументы
     * @returns {string|null} Сообщение об ошибке или null
     */
    validateArguments(definition, args) {
        const params = definition.parameters;
        
        if (!params || !params.properties) {
            return null;
        }

        // Проверка обязательных параметров
        if (params.required) {
            for (const required of params.required) {
                if (!(required in args)) {
                    return `Missing required parameter: ${required}`;
                }
            }
        }

        // Проверка типов параметров
        for (const [key, value] of Object.entries(args)) {
            const propDef = params.properties[key];
            
            if (!propDef) {
                return `Unknown parameter: ${key}`;
            }

            const expectedType = propDef.type;
            const actualType = typeof value;

            if (expectedType === 'string' && actualType !== 'string') {
                return `Parameter ${key} must be a string`;
            }
            if (expectedType === 'number' && actualType !== 'number') {
                return `Parameter ${key} must be a number`;
            }
            if (expectedType === 'boolean' && actualType !== 'boolean') {
                return `Parameter ${key} must be a boolean`;
            }
        }

        return null;
    }

    /**
     * Выполнение с таймаутом
     * @param {Promise} promise - Промис для выполнения
     * @param {number} timeout - Таймаут в мс
     * @returns {Promise<any>}
     */
    executeWithTimeout(promise, timeout) {
        return Promise.race([
            promise,
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Function execution timeout')), timeout)
            )
        ]);
    }

    /**
     * Логирование выполнения
     * @param {string} name - Имя функции
     * @param {object} args - Аргументы
     * @param {object} context - Контекст
     * @returns {string} ID записи в логе
     */
    logExecution(name, args, context) {
        const id = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        this.executionLog.push({
            id,
            name,
            args,
            context: {
                userId: context.userId,
                apiKeyId: context.apiKeyId,
                timestamp: new Date()
            },
            result: null
        });

        // Ограничиваем размер лога
        if (this.executionLog.length > 1000) {
            this.executionLog = this.executionLog.slice(-1000);
        }

        return id;
    }

    /**
     * Обновление лога выполнения
     * @param {string} id - ID записи
     * @param {object} update - Данные для обновления
     */
    updateExecutionLog(id, update) {
        const entry = this.executionLog.find(e => e.id === id);
        if (entry) {
            Object.assign(entry, update);
        }
    }

    /**
     * Получить статистику по функциям
     * @returns {object} Статистика
     */
    getStats() {
        const stats = {};
        
        for (const [name, fn] of this.functions) {
            stats[name] = {
                callCount: fn.callCount,
                lastCalled: fn.lastCalled
            };
        }

        return {
            totalFunctions: this.functions.size,
            totalExecutions: this.executionLog.length,
            functions: stats
        };
    }

    /**
     * Получить последние выполнения
     * @param {number} limit - Количество записей
     * @returns {Array} Массив выполнений
     */
    getRecentExecutions(limit = 10) {
        return this.executionLog.slice(-limit).reverse();
    }
}

// Singleton instance
const registry = new FunctionRegistry();

module.exports = registry;
