const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

// Создаем базу данных
const dbPath = path.join(__dirname, '../../data/api.db');
const db = new Database(dbPath);

// Включаем внешние ключи
db.pragma('foreign_keys = ON');

/**
 * Инициализация базы данных
 */
function initDatabase() {
    // Таблица пользователей
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            is_super_admin BOOLEAN DEFAULT 0,
            weekly_limit INTEGER DEFAULT 10000,
            weekly_used INTEGER DEFAULT 0,
            last_limit_reset DATETIME DEFAULT CURRENT_TIMESTAMP,
            two_fa_secret TEXT,
            two_fa_enabled BOOLEAN DEFAULT 0,
            avatar_color TEXT DEFAULT 'avatar-color-1',
            bio TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME
        )
    `);
    
    // Добавить новые поля если их нет (миграция)
    try {
        db.exec(`ALTER TABLE users ADD COLUMN avatar_color TEXT DEFAULT 'avatar-color-1'`);
    } catch (e) {
        // Поле уже существует
    }
    
    try {
        db.exec(`ALTER TABLE users ADD COLUMN bio TEXT`);
    } catch (e) {
        // Поле уже существует
    }

    // Таблица API ключей
    db.exec(`
        CREATE TABLE IF NOT EXISTS api_keys (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            key TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            limit_requests INTEGER DEFAULT 1000,
            used_requests INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_used DATETIME,
            is_active BOOLEAN DEFAULT 1,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // Таблица логов запросов
    db.exec(`
        CREATE TABLE IF NOT EXISTS request_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            api_key_id INTEGER,
            endpoint TEXT NOT NULL,
            method TEXT NOT NULL,
            status_code INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE CASCADE
        )
    `);
    
    // Добавляем новые колонки если их нет (для существующих баз)
    try {
        db.exec(`ALTER TABLE request_logs ADD COLUMN user_id INTEGER`);
    } catch (e) {}
    try {
        db.exec(`ALTER TABLE request_logs ADD COLUMN prompt_tokens INTEGER DEFAULT 0`);
    } catch (e) {}
    try {
        db.exec(`ALTER TABLE request_logs ADD COLUMN completion_tokens INTEGER DEFAULT 0`);
    } catch (e) {}
    try {
        db.exec(`ALTER TABLE request_logs ADD COLUMN total_tokens INTEGER DEFAULT 0`);
    } catch (e) {}
    try {
        db.exec(`ALTER TABLE request_logs ADD COLUMN response_time INTEGER DEFAULT 0`);
    } catch (e) {}

    // Таблица чатов
    db.exec(`
        CREATE TABLE IF NOT EXISTS chats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT DEFAULT 'Новый чат',
            model TEXT DEFAULT 'gpt-3.5-turbo',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);
    
    // Таблица сообщений
    db.exec(`
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            chat_id INTEGER NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE
        )
    `);
    
    // Таблица файлов
    db.exec(`
        CREATE TABLE IF NOT EXISTS files (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            message_id INTEGER NOT NULL,
            filename TEXT NOT NULL,
            file_type TEXT NOT NULL,
            file_size INTEGER,
            file_data TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
        )
    `);

    // Индексы для быстрого поиска
    db.exec(`
        CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);
        CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(key);
        CREATE INDEX IF NOT EXISTS idx_request_logs_key ON request_logs(api_key_id);
        CREATE INDEX IF NOT EXISTS idx_request_logs_date ON request_logs(created_at);
        CREATE INDEX IF NOT EXISTS idx_chats_user ON chats(user_id);
        CREATE INDEX IF NOT EXISTS idx_messages_chat ON messages(chat_id);
        CREATE INDEX IF NOT EXISTS idx_files_message ON files(message_id);
    `);

    console.log('✅ База данных инициализирована');
}

/**
 * Создание админа
 */
function createDefaultUsers() {
    // Проверяем существование админа
    const adminCheck = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('admin');
    
    if (adminCheck.count === 0) {
        const hashedPassword = bcrypt.hashSync('Zaza_0203!', 10);
        const insert = db.prepare(`
            INSERT INTO users (username, email, password, name, role, is_super_admin)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        
        insert.run('Be1lnash3', 'sahsaxboxvanx@gmail.com', hashedPassword, 'Admin', 'admin', 1);
        console.log('✅ Создан главный администратор: Be1lnash3 / Zaza_0203!');
    }
}

// Инициализация при импорте
initDatabase();
createDefaultUsers();

module.exports = db;
