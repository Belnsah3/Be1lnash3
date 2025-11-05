const express = require('express');
const router = express.Router();
const db = require('../database/db');

/**
 * @swagger
 * /api/v1/stats:
 *   get:
 *     summary: Получить статистику пользователя
 *     tags: [Stats]
 *     responses:
 *       200:
 *         description: Статистика получена
 */
router.get('/', (req, res) => {
    try {
        if (!req.session || !req.session.userId) {
            return res.status(401).json({ success: false, message: 'Не авторизован' });
        }

        const userId = req.session.userId;

        // Количество чатов
        const chatsCount = db.prepare(`
            SELECT COUNT(*) as count FROM chats WHERE user_id = ?
        `).get(userId).count;

        // Количество сообщений
        const messagesCount = db.prepare(`
            SELECT COUNT(*) as count 
            FROM messages m
            JOIN chats c ON m.chat_id = c.id
            WHERE c.user_id = ?
        `).get(userId).count;

        // Количество файлов
        const filesCount = db.prepare(`
            SELECT COUNT(*) as count
            FROM files f
            JOIN messages m ON f.message_id = m.id
            JOIN chats c ON m.chat_id = c.id
            WHERE c.user_id = ?
        `).get(userId).count;

        // Используемые модели
        const models = db.prepare(`
            SELECT model, COUNT(*) as count
            FROM chats
            WHERE user_id = ?
            GROUP BY model
            ORDER BY count DESC
            LIMIT 10
        `).all(userId);

        // Активность по дням (последние 7 дней)
        const activity = db.prepare(`
            SELECT 
                DATE(c.created_at) as date,
                COUNT(DISTINCT c.id) as chats_count,
                COUNT(m.id) as messages_count
            FROM chats c
            LEFT JOIN messages m ON c.id = m.chat_id
            WHERE c.user_id = ?
            AND c.created_at >= date('now', '-7 days')
            GROUP BY DATE(c.created_at)
            ORDER BY date DESC
        `).all(userId);

        // Последние чаты
        const recentChats = db.prepare(`
            SELECT 
                id,
                title,
                model,
                created_at,
                updated_at,
                (SELECT COUNT(*) FROM messages WHERE chat_id = chats.id) as message_count
            FROM chats
            WHERE user_id = ?
            ORDER BY updated_at DESC
            LIMIT 10
        `).all(userId);

        // Информация о пользователе
        const user = db.prepare(`
            SELECT username, email, name, created_at, bio
            FROM users
            WHERE id = ?
        `).get(userId);

        res.json({
            success: true,
            stats: {
                chatsCount,
                messagesCount,
                filesCount,
                models,
                activity,
                recentChats,
                user
            }
        });
    } catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

/**
 * @swagger
 * /api/v1/stats/summary:
 *   get:
 *     summary: Получить краткую статистику
 *     tags: [Stats]
 *     responses:
 *       200:
 *         description: Краткая статистика
 */
router.get('/summary', (req, res) => {
    try {
        if (!req.session || !req.session.userId) {
            return res.status(401).json({ success: false, message: 'Не авторизован' });
        }

        const userId = req.session.userId;

        // Краткая статистика
        const summary = db.prepare(`
            SELECT
                (SELECT COUNT(*) FROM chats WHERE user_id = ?) as total_chats,
                (SELECT COUNT(*) FROM messages m JOIN chats c ON m.chat_id = c.id WHERE c.user_id = ?) as total_messages,
                (SELECT COUNT(DISTINCT model) FROM chats WHERE user_id = ?) as unique_models
        `).get(userId, userId, userId);

        res.json({
            success: true,
            summary
        });
    } catch (error) {
        console.error('Error getting summary:', error);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

module.exports = router;
