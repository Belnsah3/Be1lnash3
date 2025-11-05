const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { requireAuth } = require('../middleware/session');

/**
 * Middleware для проверки супер-админа
 */
function requireSuperAdmin(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({
            success: false,
            error: 'Unauthorized'
        });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.userId);
    
    if (!user || !user.is_super_admin) {
        return res.status(403).json({
            success: false,
            error: 'Access denied. Super admin only.'
        });
    }

    next();
}

/**
 * GET /admin/users - Получить список всех пользователей
 */
router.get('/users', requireAuth, requireSuperAdmin, (req, res) => {
    try {
        const users = db.prepare(`
            SELECT 
                id, username, email, name, role, 
                is_super_admin, weekly_limit, weekly_used, 
                last_limit_reset, two_fa_enabled, created_at, last_login
            FROM users
            ORDER BY created_at DESC
        `).all();

        res.json({
            success: true,
            users: users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /admin/users/:userId/role - Изменить роль пользователя
 */
router.post('/users/:userId/role', requireAuth, requireSuperAdmin, (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!role || !['user', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid role. Must be "user" or "admin"'
            });
        }

        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Нельзя изменить роль супер-админа
        if (user.is_super_admin) {
            return res.status(403).json({
                success: false,
                error: 'Cannot change super admin role'
            });
        }

        db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, userId);

        res.json({
            success: true,
            message: `User role updated to ${role}`
        });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /admin/users/:userId/limit - Изменить недельный лимит пользователя
 */
router.post('/users/:userId/limit', requireAuth, requireSuperAdmin, (req, res) => {
    try {
        const { userId } = req.params;
        const { limit } = req.body;

        if (!limit || limit < 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid limit'
            });
        }

        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        db.prepare('UPDATE users SET weekly_limit = ? WHERE id = ?').run(limit, userId);

        res.json({
            success: true,
            message: `Weekly limit updated to ${limit}`
        });
    } catch (error) {
        console.error('Error updating user limit:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /admin/users/:userId/reset-limit - Сбросить использованный лимит
 */
router.post('/users/:userId/reset-limit', requireAuth, requireSuperAdmin, (req, res) => {
    try {
        const { userId } = req.params;

        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        db.prepare(`
            UPDATE users 
            SET weekly_used = 0, last_limit_reset = CURRENT_TIMESTAMP 
            WHERE id = ?
        `).run(userId);

        res.json({
            success: true,
            message: 'User limit reset successfully'
        });
    } catch (error) {
        console.error('Error resetting user limit:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /admin/stats - Получить общую статистику
 */
router.get('/stats', requireAuth, requireSuperAdmin, (req, res) => {
    try {
        const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
        const totalAdmins = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('admin').count;
        const totalKeys = db.prepare('SELECT COUNT(*) as count FROM api_keys').get().count;
        const totalRequests = db.prepare('SELECT COUNT(*) as count FROM request_logs').get().count;

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalAdmins,
                totalKeys,
                totalRequests
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
