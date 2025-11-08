const crypto = require('crypto');
const db = require('../database/db');

/**
 * Генерация нового API ключа
 */
function generateApiKey() {
    const randomBytes = crypto.randomBytes(32).toString('hex');
    return `sk-${randomBytes}`;
}

/**
 * Создание API ключа для пользователя
 */
function createApiKey(userId, name, limit = 1000) {
    const apiKey = generateApiKey();
    
    const stmt = db.prepare(`
        INSERT INTO api_keys (user_id, key, name, limit_requests)
        VALUES (?, ?, ?, ?)
    `);
    
    stmt.run(userId, apiKey, name, limit);
    
    return apiKey;
}

/**
 * Получение информации об API ключе
 */
function getApiKeyInfo(apiKey) {
    const stmt = db.prepare(`
        SELECT ak.*, u.role, u.is_super_admin
        FROM api_keys ak
        JOIN users u ON ak.user_id = u.id
        WHERE ak.key = ? AND ak.is_active = 1
    `);
    
    return stmt.get(apiKey);
}

/**
 * Получение всех ключей пользователя
 */
function getUserApiKeys(userId) {
    const stmt = db.prepare(`
        SELECT id, key, name, limit_requests, used_requests, is_active as active, created_at
        FROM api_keys
        WHERE user_id = ?
        ORDER BY created_at DESC
    `);
    
    return stmt.all(userId);
}

/**
 * Деактивация API ключа
 */
function revokeApiKey(apiKey, userId) {
    const stmt = db.prepare(`
        UPDATE api_keys
        SET is_active = 0
        WHERE key = ? AND user_id = ?
    `);
    
    const result = stmt.run(apiKey, userId);
    return result.changes > 0;
}

/**
 * Активация API ключа
 */
function activateApiKey(apiKey, userId) {
    const stmt = db.prepare(`
        UPDATE api_keys
        SET is_active = 1
        WHERE key = ? AND user_id = ?
    `);
    
    const result = stmt.run(apiKey, userId);
    return result.changes > 0;
}

/**
 * Полное удаление API ключа
 */
function deleteApiKey(apiKey, userId) {
    const stmt = db.prepare(`
        DELETE FROM api_keys
        WHERE key = ? AND user_id = ?
    `);
    
    const result = stmt.run(apiKey, userId);
    return result.changes > 0;
}

/**
 * Middleware для проверки API ключа
 */
function requireApiKey(req, res, next) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({
            error: {
                message: 'No API key provided',
                type: 'invalid_request_error',
                code: 'missing_api_key'
            }
        });
    }

    let apiKey;
    if (authHeader.startsWith('Bearer ')) {
        apiKey = authHeader.substring(7);
    } else {
        apiKey = authHeader;
    }

    const keyInfo = getApiKeyInfo(apiKey);
    
    if (!keyInfo) {
        return res.status(401).json({
            error: {
                message: 'Invalid API key',
                type: 'invalid_request_error',
                code: 'invalid_api_key'
            }
        });
    }

    // Проверяем лимит (не для админов)
    if (keyInfo.role !== 'admin' && !keyInfo.is_super_admin) {
        if (keyInfo.used_requests >= keyInfo.limit_requests) {
            return res.status(429).json({
                error: {
                    message: 'API key limit exceeded',
                    type: 'rate_limit_error',
                    code: 'limit_exceeded'
                }
            });
        }
    }

    // Увеличиваем счетчик использования для всех (включая админов для статистики)
    db.prepare('UPDATE api_keys SET used_requests = used_requests + 1 WHERE key = ?').run(apiKey);

    // Сохраняем информацию о ключе в request
    req.apiKey = apiKey;
    req.apiKeyInfo = keyInfo;
    req.userId = keyInfo.user_id;

    next();
}

/**
 * Логирование запроса с токенами
 */
function logRequest(apiKeyId, userId, model, usage, success = true, errorMessage = null, responseTime = 0) {
    const stmt = db.prepare(`
        INSERT INTO request_logs (
            api_key_id, user_id, model, 
            prompt_tokens, completion_tokens, total_tokens,
            success, error_message, response_time
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
        apiKeyId,
        userId,
        model,
        usage?.prompt_tokens || 0,
        usage?.completion_tokens || 0,
        usage?.total_tokens || 0,
        success ? 1 : 0,
        errorMessage,
        responseTime
    );
}

/**
 * Получение статистики пользователя
 */
function getUserStats(userId) {
    // Общая статистика
    const totalStats = db.prepare(`
        SELECT 
            COUNT(*) as total_requests,
            SUM(prompt_tokens) as total_prompt_tokens,
            SUM(completion_tokens) as total_completion_tokens,
            SUM(total_tokens) as total_tokens,
            AVG(response_time) as avg_response_time
        FROM request_logs
        WHERE user_id = ?
    `).get(userId);
    
    // Статистика по моделям
    const modelStats = db.prepare(`
        SELECT 
            model,
            COUNT(*) as requests,
            SUM(prompt_tokens) as prompt_tokens,
            SUM(completion_tokens) as completion_tokens,
            SUM(total_tokens) as total_tokens,
            AVG(response_time) as avg_response_time
        FROM request_logs
        WHERE user_id = ?
        GROUP BY model
        ORDER BY requests DESC
    `).all(userId);
    
    // Статистика за последние 7 дней
    const dailyStats = db.prepare(`
        SELECT 
            DATE(created_at) as date,
            COUNT(*) as requests,
            SUM(total_tokens) as tokens
        FROM request_logs
        WHERE user_id = ? AND created_at >= datetime('now', '-7 days')
        GROUP BY DATE(created_at)
        ORDER BY date DESC
    `).all(userId);
    
    return {
        total: totalStats,
        byModel: modelStats,
        daily: dailyStats
    };
}

module.exports = {
    generateApiKey,
    createApiKey,
    getApiKeyInfo,
    getUserApiKeys,
    revokeApiKey,
    activateApiKey,
    deleteApiKey,
    requireApiKey,
    logRequest,
    getUserStats
};
