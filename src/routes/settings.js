const express = require('express');
const router = express.Router();
const db = require('../database/db');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/avatars/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Только изображения (jpeg, jpg, png, gif)'));
        }
    }
});

/**
 * @swagger
 * /api/v1/settings:
 *   get:
 *     summary: Получить настройки пользователя
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: Настройки получены
 */
router.get('/', (req, res) => {
    try {
        if (!req.session || !req.session.userId) {
            return res.status(401).json({ success: false, message: 'Не авторизован' });
        }

        // Получаем настройки
        const settings = db.prepare(`
            SELECT * FROM user_settings WHERE user_id = ?
        `).get(req.session.userId);

        // Получаем информацию о пользователе
        const user = db.prepare(`
            SELECT id, username, email, name, bio, avatar_color, created_at 
            FROM users WHERE id = ?
        `).get(req.session.userId);

        // Если настроек нет, создаем по умолчанию
        if (!settings) {
            const insert = db.prepare(`
                INSERT INTO user_settings (user_id) VALUES (?)
            `);
            insert.run(req.session.userId);
            
            const newSettings = db.prepare(`
                SELECT * FROM user_settings WHERE user_id = ?
            `).get(req.session.userId);
            
            return res.json({
                success: true,
                settings: newSettings,
                user: user
            });
        }

        res.json({
            success: true,
            settings: settings,
            user: user
        });
    } catch (error) {
        console.error('Error getting settings:', error);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

/**
 * @swagger
 * /api/v1/settings:
 *   put:
 *     summary: Обновить настройки пользователя
 *     tags: [Settings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Настройки обновлены
 */
router.put('/', (req, res) => {
    try {
        if (!req.session || !req.session.userId) {
            return res.status(401).json({ success: false, message: 'Не авторизован' });
        }

        const { theme, bio, privacy_settings, notification_settings, language } = req.body;

        // Обновляем настройки
        const updateSettings = db.prepare(`
            UPDATE user_settings 
            SET theme = COALESCE(?, theme),
                privacy_settings = COALESCE(?, privacy_settings),
                notification_settings = COALESCE(?, notification_settings),
                language = COALESCE(?, language),
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
        `);

        updateSettings.run(theme, privacy_settings, notification_settings, language, req.session.userId);

        // Обновляем био в users
        if (bio !== undefined) {
            const updateUser = db.prepare(`
                UPDATE users SET bio = ? WHERE id = ?
            `);
            updateUser.run(bio, req.session.userId);
        }

        res.json({
            success: true,
            message: 'Настройки обновлены'
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

/**
 * @swagger
 * /api/v1/settings/password:
 *   put:
 *     summary: Изменить пароль
 *     tags: [Settings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Пароль изменен
 */
router.put('/password', async (req, res) => {
    try {
        if (!req.session || !req.session.userId) {
            return res.status(401).json({ success: false, message: 'Не авторизован' });
        }

        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Заполните все поля' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'Пароль должен быть минимум 6 символов' });
        }

        // Получаем текущего пользователя
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.userId);

        // Проверяем текущий пароль
        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            return res.status(400).json({ success: false, message: 'Неверный текущий пароль' });
        }

        // Хешируем новый пароль
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Обновляем пароль
        const update = db.prepare(`
            UPDATE users SET password = ? WHERE id = ?
        `);
        update.run(hashedPassword, req.session.userId);

        res.json({
            success: true,
            message: 'Пароль успешно изменен'
        });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

/**
 * @swagger
 * /api/v1/settings/avatar:
 *   post:
 *     summary: Загрузить аватар
 *     tags: [Settings]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Аватар загружен
 */
router.post('/avatar', upload.single('avatar'), (req, res) => {
    try {
        if (!req.session || !req.session.userId) {
            return res.status(401).json({ success: false, message: 'Не авторизован' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Файл не загружен' });
        }

        const avatarUrl = `/uploads/avatars/${req.file.filename}`;

        // Обновляем URL аватара
        const update = db.prepare(`
            UPDATE user_settings 
            SET avatar_url = ?, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
        `);
        update.run(avatarUrl, req.session.userId);

        res.json({
            success: true,
            message: 'Аватар загружен',
            avatarUrl: avatarUrl
        });
    } catch (error) {
        console.error('Error uploading avatar:', error);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

/**
 * @swagger
 * /api/v1/settings/api-key:
 *   post:
 *     summary: Добавить API ключ
 *     tags: [Settings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               apiKey:
 *                 type: string
 *     responses:
 *       200:
 *         description: API ключ добавлен
 */
router.post('/api-key', (req, res) => {
    try {
        if (!req.session || !req.session.userId) {
            return res.status(401).json({ success: false, message: 'Не авторизован' });
        }

        const { apiKey } = req.body;

        if (!apiKey || apiKey.trim() === '') {
            return res.status(400).json({ success: false, message: 'API ключ не может быть пустым' });
        }

        // Обновляем API ключ
        const update = db.prepare(`
            UPDATE user_settings 
            SET api_key = ?, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
        `);
        update.run(apiKey, req.session.userId);

        res.json({
            success: true,
            message: 'API ключ сохранен'
        });
    } catch (error) {
        console.error('Error saving API key:', error);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

/**
 * @swagger
 * /api/v1/settings/api-key:
 *   delete:
 *     summary: Удалить API ключ
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: API ключ удален
 */
router.delete('/api-key', (req, res) => {
    try {
        if (!req.session || !req.session.userId) {
            return res.status(401).json({ success: false, message: 'Не авторизован' });
        }

        // Удаляем API ключ
        const update = db.prepare(`
            UPDATE user_settings 
            SET api_key = NULL, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
        `);
        update.run(req.session.userId);

        res.json({
            success: true,
            message: 'API ключ удален'
        });
    } catch (error) {
        console.error('Error deleting API key:', error);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

module.exports = router;
