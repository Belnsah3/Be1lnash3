const express = require('express');
const router = express.Router();
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const db = require('../database/db');
const { requireAuth } = require('../middleware/session');

/**
 * GET /2fa/setup - Генерация секрета для 2FA
 */
router.get('/setup', requireAuth, async (req, res) => {
    try {
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Генерируем секрет
        const secret = speakeasy.generateSecret({
            name: `LumeAI (${user.email})`,
            issuer: 'LumeAI'
        });

        // Сохраняем временный секрет в сессии
        req.session.tempTwoFASecret = secret.base32;

        // Генерируем QR код
        const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

        res.json({
            success: true,
            secret: secret.base32,
            qrCode: qrCodeUrl,
            manualEntry: secret.otpauth_url
        });

    } catch (error) {
        console.error('2FA setup error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /2fa/verify - Проверка и активация 2FA
 */
router.post('/verify', requireAuth, async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                error: 'Token is required'
            });
        }

        const secret = req.session.tempTwoFASecret;

        if (!secret) {
            return res.status(400).json({
                success: false,
                error: 'Please setup 2FA first'
            });
        }

        // Проверяем токен
        const verified = speakeasy.totp.verify({
            secret: secret,
            encoding: 'base32',
            token: token,
            window: 2
        });

        if (!verified) {
            return res.status(400).json({
                success: false,
                error: 'Invalid token'
            });
        }

        // Сохраняем секрет в базу
        db.prepare(`
            UPDATE users 
            SET two_fa_secret = ?, two_fa_enabled = 1 
            WHERE id = ?
        `).run(secret, req.session.userId);

        // Удаляем временный секрет
        delete req.session.tempTwoFASecret;

        res.json({
            success: true,
            message: '2FA enabled successfully'
        });

    } catch (error) {
        console.error('2FA verify error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /2fa/disable - Отключение 2FA
 */
router.post('/disable', requireAuth, async (req, res) => {
    try {
        const { token } = req.body;

        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.userId);

        if (!user.two_fa_enabled) {
            return res.status(400).json({
                success: false,
                error: '2FA is not enabled'
            });
        }

        // Проверяем токен перед отключением
        const verified = speakeasy.totp.verify({
            secret: user.two_fa_secret,
            encoding: 'base32',
            token: token,
            window: 2
        });

        if (!verified) {
            return res.status(400).json({
                success: false,
                error: 'Invalid token'
            });
        }

        // Отключаем 2FA
        db.prepare(`
            UPDATE users 
            SET two_fa_secret = NULL, two_fa_enabled = 0 
            WHERE id = ?
        `).run(req.session.userId);

        res.json({
            success: true,
            message: '2FA disabled successfully'
        });

    } catch (error) {
        console.error('2FA disable error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /2fa/status - Статус 2FA
 */
router.get('/status', requireAuth, async (req, res) => {
    try {
        const user = db.prepare('SELECT two_fa_enabled FROM users WHERE id = ?').get(req.session.userId);

        res.json({
            success: true,
            enabled: !!user.two_fa_enabled
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
