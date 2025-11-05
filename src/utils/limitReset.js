const db = require('../database/db');

/**
 * Проверка и сброс недельных лимитов
 */
function checkAndResetWeeklyLimits() {
    try {
        const now = new Date();
        
        // Получаем всех пользователей, у которых прошла неделя с последнего сброса
        const users = db.prepare(`
            SELECT id, email, weekly_used, last_limit_reset
            FROM users
            WHERE role = 'user'
            AND julianday('now') - julianday(last_limit_reset) >= 7
        `).all();

        if (users.length > 0) {
            console.log(`🔄 Сброс лимитов для ${users.length} пользователей...`);

            const resetStmt = db.prepare(`
                UPDATE users 
                SET weekly_used = 0, last_limit_reset = CURRENT_TIMESTAMP 
                WHERE id = ?
            `);

            users.forEach(user => {
                resetStmt.run(user.id);
                console.log(`✅ Лимит сброшен для пользователя ID: ${user.id} (${user.email})`);
            });

            console.log(`✅ Недельные лимиты обновлены для ${users.length} пользователей`);
        }
    } catch (error) {
        console.error('❌ Ошибка при сбросе лимитов:', error);
    }
}

/**
 * Запуск периодической проверки (каждый час)
 */
function startLimitResetScheduler() {
    // Проверяем сразу при запуске
    checkAndResetWeeklyLimits();

    // Затем проверяем каждый час
    setInterval(() => {
        checkAndResetWeeklyLimits();
    }, 60 * 60 * 1000); // 1 час

    console.log('⏰ Планировщик сброса лимитов запущен (проверка каждый час)');
}

/**
 * Проверка лимита пользователя перед запросом
 */
function checkUserLimit(userId) {
    try {
        const user = db.prepare(`
            SELECT role, weekly_limit, weekly_used, is_super_admin
            FROM users
            WHERE id = ?
        `).get(userId);

        if (!user) {
            return { allowed: false, error: 'User not found' };
        }

        // Админы и супер-админы без лимитов
        if (user.role === 'admin' || user.is_super_admin) {
            return { allowed: true, unlimited: true };
        }

        // Проверяем лимит обычного пользователя
        if (user.weekly_used >= user.weekly_limit) {
            return { 
                allowed: false, 
                error: 'Weekly limit exceeded',
                used: user.weekly_used,
                limit: user.weekly_limit
            };
        }

        return { 
            allowed: true, 
            unlimited: false,
            used: user.weekly_used,
            limit: user.weekly_limit,
            remaining: user.weekly_limit - user.weekly_used
        };
    } catch (error) {
        console.error('Error checking user limit:', error);
        return { allowed: false, error: error.message };
    }
}

/**
 * Увеличить счетчик использования
 */
function incrementUserUsage(userId) {
    try {
        const user = db.prepare('SELECT role, is_super_admin FROM users WHERE id = ?').get(userId);
        
        // Не считаем для админов
        if (user && (user.role === 'admin' || user.is_super_admin)) {
            return;
        }

        db.prepare('UPDATE users SET weekly_used = weekly_used + 1 WHERE id = ?').run(userId);
    } catch (error) {
        console.error('Error incrementing user usage:', error);
    }
}

module.exports = {
    checkAndResetWeeklyLimits,
    startLimitResetScheduler,
    checkUserLimit,
    incrementUserUsage
};
