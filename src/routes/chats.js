const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Middleware для проверки авторизации
function requireAuth(req, res, next) {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ success: false, error: 'Требуется авторизация' });
    }
    next();
}

// Получить все чаты пользователя
router.get('/', requireAuth, (req, res) => {
    try {
        const chats = db.prepare(`
            SELECT id, title, model, created_at, updated_at
            FROM chats
            WHERE user_id = ?
            ORDER BY updated_at DESC
        `).all(req.session.userId);
        
        res.json({ success: true, chats });
    } catch (error) {
        console.error('Error fetching chats:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Создать новый чат
router.post('/', requireAuth, (req, res) => {
    try {
        const { title = 'Новый чат', model = 'gpt-3.5-turbo' } = req.body;
        
        const result = db.prepare(`
            INSERT INTO chats (user_id, title, model)
            VALUES (?, ?, ?)
        `).run(req.session.userId, title, model);
        
        const chat = db.prepare('SELECT * FROM chats WHERE id = ?').get(result.lastInsertRowid);
        
        res.json({ success: true, chat });
    } catch (error) {
        console.error('Error creating chat:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Получить сообщения чата
router.get('/:chatId/messages', requireAuth, (req, res) => {
    try {
        const { chatId } = req.params;
        
        // Проверка что чат принадлежит пользователю
        const chat = db.prepare('SELECT * FROM chats WHERE id = ? AND user_id = ?')
            .get(chatId, req.session.userId);
        
        if (!chat) {
            return res.status(404).json({ success: false, error: 'Чат не найден' });
        }
        
        const messages = db.prepare(`
            SELECT id, role, content, created_at
            FROM messages
            WHERE chat_id = ?
            ORDER BY created_at ASC
        `).all(chatId);
        
        res.json({ success: true, messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Добавить сообщение в чат
router.post('/:chatId/messages', requireAuth, (req, res) => {
    try {
        const { chatId } = req.params;
        const { role, content, file } = req.body;
        
        // Проверка что чат принадлежит пользователю
        const chat = db.prepare('SELECT * FROM chats WHERE id = ? AND user_id = ?')
            .get(chatId, req.session.userId);
        
        if (!chat) {
            return res.status(404).json({ success: false, error: 'Чат не найден' });
        }
        
        // Добавить сообщение
        const result = db.prepare(`
            INSERT INTO messages (chat_id, role, content)
            VALUES (?, ?, ?)
        `).run(chatId, role, content);
        
        const messageId = result.lastInsertRowid;
        
        // Если есть файл - сохранить его
        if (file) {
            db.prepare(`
                INSERT INTO files (message_id, filename, file_type, file_size, file_data)
                VALUES (?, ?, ?, ?, ?)
            `).run(messageId, file.filename, file.type, file.size, file.data);
        }
        
        // Обновить время чата
        db.prepare('UPDATE chats SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(chatId);
        
        const message = db.prepare('SELECT * FROM messages WHERE id = ?').get(messageId);
        
        res.json({ success: true, message });
    } catch (error) {
        console.error('Error adding message:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Обновить чат (переименовать)
router.put('/:chatId', requireAuth, (req, res) => {
    try {
        const { chatId } = req.params;
        const { title, model } = req.body;
        
        // Проверка что чат принадлежит пользователю
        const chat = db.prepare('SELECT * FROM chats WHERE id = ? AND user_id = ?')
            .get(chatId, req.session.userId);
        
        if (!chat) {
            return res.status(404).json({ success: false, error: 'Чат не найден' });
        }
        
        // Обновить чат
        db.prepare(`
            UPDATE chats
            SET title = COALESCE(?, title),
                model = COALESCE(?, model),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(title, model, chatId);
        
        const updatedChat = db.prepare('SELECT * FROM chats WHERE id = ?').get(chatId);
        
        res.json({ success: true, chat: updatedChat });
    } catch (error) {
        console.error('Error updating chat:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Удалить чат
router.delete('/:chatId', requireAuth, (req, res) => {
    try {
        const { chatId } = req.params;
        
        // Проверка что чат принадлежит пользователю
        const chat = db.prepare('SELECT * FROM chats WHERE id = ? AND user_id = ?')
            .get(chatId, req.session.userId);
        
        if (!chat) {
            return res.status(404).json({ success: false, error: 'Чат не найден' });
        }
        
        // Удалить чат (сообщения удалятся автоматически через CASCADE)
        db.prepare('DELETE FROM chats WHERE id = ?').run(chatId);
        
        res.json({ success: true, message: 'Чат удален' });
    } catch (error) {
        console.error('Error deleting chat:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
