const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../database/db');

/**
 * POST /auth/register - Регистрация
 */
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, name, bio, avatar_color } = req.body;

        // Валидация
        if (!email || !password || !name) {
            return res.status(400).json({
                success: false,
                error: 'Email, password and name are required'
            });
        }

        // Проверка существующего email
        const existingEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                error: 'User with this email already exists'
            });
        }

        // Проверка существующего username
        if (username) {
            const existingUsername = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
            if (existingUsername) {
                return res.status(400).json({
                    success: false,
                    error: 'Username already taken'
                });
            }
        }

        // Хеширование пароля
        const hashedPassword = await bcrypt.hash(password, 10);

        // Создание пользователя
        const stmt = db.prepare(`
            INSERT INTO users (username, email, password, name, bio, avatar_color)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(
            username || null,
            email,
            hashedPassword,
            name,
            bio || null,
            avatar_color || 'avatar-color-1'
        );

        // Автоматический вход
        req.session.userId = result.lastInsertRowid;
        req.session.email = email;
        req.session.name = name;
        req.session.username = username;

        res.json({
            success: true,
            message: 'User registered successfully',
            user: {
                id: result.lastInsertRowid,
                username: username,
                email: email,
                name: name,
                avatar_color: avatar_color || 'avatar-color-1'
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /auth/login - Вход
 */
router.post('/login', async (req, res) => {
    try {
        const { login, password, twoFAToken } = req.body;

        console.log('Login attempt:', { login, has2FA: !!twoFAToken });

        // Валидация
        if (!login || !password) {
            return res.status(400).json({
                success: false,
                error: 'Login and password are required'
            });
        }

        // Поиск пользователя (по email или username) - регистронезависимый
        const user = db.prepare(`
            SELECT * FROM users 
            WHERE LOWER(email) = LOWER(?) OR (username IS NOT NULL AND LOWER(username) = LOWER(?))
        `).get(login, login);
        
        console.log('User found:', user ? `${user.email} (${user.role})` : 'not found');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Неверный email/username или пароль'
            });
        }

        // Проверка пароля
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Проверка 2FA если включен
        if (user.two_fa_enabled) {
            if (!twoFAToken) {
                return res.json({
                    success: false,
                    requires2FA: true,
                    message: '2FA token required'
                });
            }

            const speakeasy = require('speakeasy');
            const verified = speakeasy.totp.verify({
                secret: user.two_fa_secret,
                encoding: 'base32',
                token: twoFAToken,
                window: 2
            });

            if (!verified) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid 2FA token'
                });
            }
        }

        // Обновление last_login
        db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);

        // Создание сессии
        req.session.userId = user.id;
        req.session.email = user.email;
        req.session.name = user.name;
        req.session.role = user.role;
        req.session.username = user.username;

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                name: user.name,
                role: user.role,
                is_super_admin: !!user.is_super_admin,
                weekly_limit: user.weekly_limit,
                weekly_used: user.weekly_used,
                twoFAEnabled: !!user.two_fa_enabled
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /auth/logout - Выход
 */
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                error: 'Logout failed'
            });
        }

        res.json({
            success: true,
            message: 'Logout successful'
        });
    });
});

/**
 * GET /auth/me - Текущий пользователь
 */
router.get('/me', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            success: false,
            error: 'Not authenticated'
        });
    }

    const user = db.prepare(`
        SELECT id, username, email, name, role, is_super_admin, 
               weekly_limit, weekly_used, two_fa_enabled, 
               created_at, last_login 
        FROM users WHERE id = ?
    `).get(req.session.userId);

    if (!user) {
        return res.status(404).json({
            success: false,
            error: 'User not found'
        });
    }

    res.json({
        success: true,
        user: user
    });
});

module.exports = router;
