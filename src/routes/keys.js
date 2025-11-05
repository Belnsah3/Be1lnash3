const express = require('express');
const router = express.Router();
const { createApiKey, getUserApiKeys, revokeApiKey, activateApiKey, deleteApiKey } = require('../middleware/auth');
const { requireAuth } = require('../middleware/session');

/**
 * POST /keys - Создать новый API ключ
 */
router.post('/', requireAuth, (req, res) => {
    try {
        const { name, limit = 1000 } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                error: 'Name is required'
            });
        }

        const apiKey = createApiKey(req.session.userId, name, limit);

        res.json({
            success: true,
            api_key: apiKey,
            name: name,
            limit: limit
        });

    } catch (error) {
        console.error('Error creating API key:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /keys - Получить все API ключи текущего пользователя
 */
router.get('/', requireAuth, (req, res) => {
    try {
        const keys = getUserApiKeys(req.session.userId);

        res.json({
            success: true,
            keys: keys
        });

    } catch (error) {
        console.error('Error fetching API keys:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * PATCH /keys/:apiKey/toggle - Активировать/деактивировать API ключ
 */
router.patch('/:apiKey/toggle', requireAuth, (req, res) => {
    try {
        const { apiKey } = req.params;
        const { active } = req.body;

        let success;
        if (active) {
            success = activateApiKey(apiKey, req.session.userId);
        } else {
            success = revokeApiKey(apiKey, req.session.userId);
        }

        if (success) {
            res.json({
                success: true,
                message: active ? 'API key activated' : 'API key deactivated'
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'API key not found'
            });
        }

    } catch (error) {
        console.error('Error toggling API key:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * DELETE /keys/:apiKey - Полностью удалить API ключ
 */
router.delete('/:apiKey', requireAuth, (req, res) => {
    try {
        const { apiKey } = req.params;

        const success = deleteApiKey(apiKey, req.session.userId);

        if (success) {
            res.json({
                success: true,
                message: 'API key deleted successfully'
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'API key not found'
            });
        }

    } catch (error) {
        console.error('Error deleting API key:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
