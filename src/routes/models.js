const express = require('express');
const router = express.Router();
const MODELS = require('../data/models');

/**
 * GET /models - Получить список всех доступных моделей
 */
router.get('/', (req, res) => {
    try {
        res.json({
            success: true,
            count: MODELS.length,
            models: MODELS
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /models/categories - Получить модели по категориям
 */
router.get('/categories', (req, res) => {
    try {
        const categories = {};
        
        MODELS.forEach(model => {
            if (!categories[model.category]) {
                categories[model.category] = [];
            }
            categories[model.category].push(model);
        });

        res.json({
            success: true,
            categories: categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
