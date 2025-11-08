const express = require('express');
const router = express.Router();
const registry = require('../functions/registry');
const { requireApiKey } = require('../middleware/auth');

/**
 * GET /functions - Получить список всех доступных функций
 */
router.get('/', requireApiKey, (req, res) => {
    try {
        const functions = registry.getAllDefinitions();
        
        res.json({
            success: true,
            count: functions.length,
            functions: functions
        });
    } catch (error) {
        console.error('Error getting functions:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /functions/stats - Получить статистику по функциям
 */
router.get('/stats', requireApiKey, (req, res) => {
    try {
        const stats = registry.getStats();
        
        res.json({
            success: true,
            stats: stats
        });
    } catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /functions/:name - Получить определение конкретной функции
 */
router.get('/:name', requireApiKey, (req, res) => {
    try {
        const { name } = req.params;
        
        if (!registry.exists(name)) {
            return res.status(404).json({
                success: false,
                error: `Function ${name} not found`
            });
        }
        
        const definition = registry.getDefinition(name);
        
        res.json({
            success: true,
            function: {
                type: 'function',
                function: definition
            }
        });
    } catch (error) {
        console.error('Error getting function:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /functions/executions/recent - Получить последние выполнения
 */
router.get('/executions/recent', requireApiKey, (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const executions = registry.getRecentExecutions(limit);
        
        res.json({
            success: true,
            count: executions.length,
            executions: executions
        });
    } catch (error) {
        console.error('Error getting executions:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
