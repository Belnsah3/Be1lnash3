const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const path = require('path');

const sessionMiddleware = session({
    store: new SQLiteStore({
        db: 'sessions.db',
        dir: path.join(__dirname, '../../data')
    }),
    secret: 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
        httpOnly: true,
        secure: false // В продакшене должно быть true с HTTPS
    }
});

/**
 * Middleware для проверки авторизации
 */
function requireAuth(req, res, next) {
    if (req.session && req.session.userId) {
        next();
    } else {
        res.status(401).json({
            error: 'Unauthorized',
            message: 'Please login first'
        });
    }
}

/**
 * Middleware для проверки авторизации (для HTML страниц)
 */
function requireAuthPage(req, res, next) {
    if (req.session && req.session.userId) {
        next();
    } else {
        res.redirect('/login');
    }
}

module.exports = {
    sessionMiddleware,
    requireAuth,
    requireAuthPage
};
