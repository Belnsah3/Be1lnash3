# 🚀 Полная доработка проекта LumeAI - Пошаговая инструкция

## 📦 Шаг 1: Установка недостающих пакетов

```bash
npm install express-rate-limit helmet compression morgan winston crypto
```

## 🔧 Шаг 2: Обновление файлов (по порядку)

### 1. `src/middleware/auth.js` - Генерация ключей с префиксом

Найди функцию `createApiKey` и замени на:

```javascript
function createApiKey(userId, name, limit = 1000) {
    const randomPart = crypto.randomBytes(32).toString('hex');
    const apiKey = `sk-lumeai-${randomPart}`;
    
    const keyId = Date.now().toString();
    const hashedKey = bcrypt.hashSync(apiKey, 10);
    
    const stmt = db.prepare(`
        INSERT INTO api_keys (id, user_id, key_hash, name, request_limit, used_requests, active, created_at, last_used_at)
        VALUES (?, ?, ?, ?, ?, 0, 1, ?, NULL)
    `);
    
    stmt.run(keyId, userId, hashedKey, name, limit, Date.now());
    
    return {
        key: apiKey,
        id: keyId,
        name: name,
        limit: limit
    };
}
```

### 2. `src/middleware/auth.js` - Валидация ключей

Замени функцию `validateApiKey`:

```javascript
function validateApiKey(key) {
    if (!key || !key.startsWith('sk-lumeai-')) {
        return null;
    }
    
    const stmt = db.prepare(`
        SELECT ak.*, u.id as user_id, u.name as user_name
        FROM api_keys ak
        JOIN users u ON ak.user_id = u.id
        WHERE ak.active = 1
    `);
    
    const keys = stmt.all();
    
    for (const dbKey of keys) {
        if (bcrypt.compareSync(key, dbKey.key_hash)) {
            // Обновляем статистику
            const updateStmt = db.prepare(`
                UPDATE api_keys 
                SET used_requests = used_requests + 1,
                    last_used_at = ?
                WHERE id = ?
            `);
            updateStmt.run(Date.now(), dbKey.id);
            
            // Проверяем лимит
            if (dbKey.used_requests + 1 >= dbKey.request_limit) {
                console.log(`⚠️ API Key ${dbKey.name} reached limit`);
            }
            
            return {
                userId: dbKey.user_id,
                userName: dbKey.user_name,
                keyId: dbKey.id,
                keyName: dbKey.name
            };
        }
    }
    
    return null;
}
```

### 3. `src/database/schema.sql` - Обновление схемы БД

Добавь миграцию:

```sql
-- Добавляем новые колонки если их нет
ALTER TABLE api_keys ADD COLUMN key_hash TEXT;
ALTER TABLE api_keys ADD COLUMN created_at INTEGER;
ALTER TABLE api_keys ADD COLUMN last_used_at INTEGER;
ALTER TABLE api_keys ADD COLUMN used_requests INTEGER DEFAULT 0;

-- Создаем индексы для производительности
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(active);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
```

### 4. `src/server.js` - Добавление Rate Limiting

Добавь после импортов:

```javascript
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');

// Helmet для безопасности
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

// Compression для производительности
app.use(compression());

// Rate Limiting
const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 минута
    max: 60, // 60 запросов в минуту
    message: {
        error: 'Слишком много запросов, попробуйте позже',
        success: false
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Применяем к API endpoints
app.use('/api/v1/', apiLimiter);
app.use('/v1/', apiLimiter);
```

### 5. `src/routes/twofa.js` - Исправление 2FA

Полностью замени содержимое файла:

```javascript
const express = require('express');
const router = express.Router();
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { requireAuth } = require('../middleware/session');
const db = require('../database/db');

/**
 * POST /2fa/setup - Настройка 2FA
 */
router.post('/setup', requireAuth, async (req, res) => {
    try {
        const userId = req.session.userId;
        
        // Генерируем секрет
        const secret = speakeasy.generateSecret({
            name: `LumeAI (${req.session.userEmail})`,
            issuer: 'LumeAI',
            length: 32
        });
        
        // Сохраняем временный секрет
        const stmt = db.prepare('UPDATE users SET twofa_secret = ?, twofa_enabled = 0 WHERE id = ?');
        stmt.run(secret.base32, userId);
        
        // Генерируем QR код
        const qrCode = await QRCode.toDataURL(secret.otpauth_url);
        
        res.json({
            success: true,
            secret: secret.base32,
            qr_code: qrCode,
            manual_entry: secret.otpauth_url
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
 * POST /2fa/verify - Подтверждение и активация 2FA
 */
router.post('/verify', requireAuth, (req, res) => {
    try {
        const { code } = req.body;
        const userId = req.session.userId;
        
        if (!code || code.length !== 6) {
            return res.status(400).json({
                success: false,
                error: 'Введите 6-значный код'
            });
        }
        
        // Получаем секрет пользователя
        const user = db.prepare('SELECT twofa_secret FROM users WHERE id = ?').get(userId);
        
        if (!user || !user.twofa_secret) {
            return res.status(400).json({
                success: false,
                error: '2FA не настроен'
            });
        }
        
        // Валидируем код
        const verified = speakeasy.totp.verify({
            secret: user.twofa_secret,
            encoding: 'base32',
            token: code,
            window: 2 // Разрешаем ±2 временных окна (60 секунд)
        });
        
        if (!verified) {
            return res.status(400).json({
                success: false,
                error: 'Неверный код'
            });
        }
        
        // Активируем 2FA
        const stmt = db.prepare('UPDATE users SET twofa_enabled = 1 WHERE id = ?');
        stmt.run(userId);
        
        res.json({
            success: true,
            message: '2FA успешно активирован'
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
 * POST /2fa/validate - Проверка кода при входе
 */
router.post('/validate', (req, res) => {
    try {
        const { email, code } = req.body;
        
        if (!email || !code) {
            return res.status(400).json({
                success: false,
                error: 'Email и код обязательны'
            });
        }
        
        // Получаем пользователя
        const user = db.prepare('SELECT * FROM users WHERE email = ? AND twofa_enabled = 1').get(email);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Пользователь не найден'
            });
        }
        
        // Валидируем код
        const verified = speakeasy.totp.verify({
            secret: user.twofa_secret,
            encoding: 'base32',
            token: code,
            window: 2
        });
        
        if (!verified) {
            return res.status(400).json({
                success: false,
                error: 'Неверный код'
            });
        }
        
        // Создаем сессию
        req.session.userId = user.id;
        req.session.userEmail = user.email;
        req.session.userName = user.name;
        
        res.json({
            success: true,
            message: '2FA проверка пройдена',
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
        
    } catch (error) {
        console.error('2FA validate error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /2fa/disable - Отключение 2FA
 */
router.post('/disable', requireAuth, (req, res) => {
    try {
        const { code } = req.body;
        const userId = req.session.userId;
        
        // Получаем секрет пользователя
        const user = db.prepare('SELECT twofa_secret FROM users WHERE id = ?').get(userId);
        
        if (!user || !user.twofa_secret) {
            return res.status(400).json({
                success: false,
                error: '2FA не активирован'
            });
        }
        
        // Валидируем код
        const verified = speakeasy.totp.verify({
            secret: user.twofa_secret,
            encoding: 'base32',
            token: code,
            window: 2
        });
        
        if (!verified) {
            return res.status(400).json({
                success: false,
                error: 'Неверный код'
            });
        }
        
        // Отключаем 2FA
        const stmt = db.prepare('UPDATE users SET twofa_enabled = 0, twofa_secret = NULL WHERE id = ?');
        stmt.run(userId);
        
        res.json({
            success: true,
            message: '2FA отключен'
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
 * GET /2fa/status - Проверка статуса 2FA
 */
router.get('/status', requireAuth, (req, res) => {
    try {
        const userId = req.session.userId;
        const user = db.prepare('SELECT twofa_enabled FROM users WHERE id = ?').get(userId);
        
        res.json({
            success: true,
            enabled: user.twofa_enabled === 1
        });
        
    } catch (error) {
        console.error('2FA status error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
```

### 6. Обновление Swagger документации

В `src/config/swagger.js` обнови description:

```javascript
description: `
# 🚀 LumeAI - AI API Management Platform

**API Base URL**: \`https://lumeai.ru/api/v1/\`

## 🔑 Аутентификация

Используйте API ключ в заголовке:

\`\`\`
Authorization: Bearer sk-lumeai-xxxxxxxxxx
\`\`\`

### Получение API ключа:
1. Зарегистрируйтесь на https://lumeai.ru
2. Перейдите в Dashboard
3. Создайте новый API ключ
4. Скопируйте ключ (формат: \`sk-lumeai-...\`)

## ✨ Возможности

- 🤖 **69 AI моделей**: GPT, Claude, Gemini, DeepSeek и др.
- 🔧 **Function Calling**: Вызов функций на сервере
- 📊 **Статистика**: Отслеживание использования
- 🔐 **2FA**: Двухфакторная аутентификация
- ⚡ **Rate Limiting**: 60 запросов/минуту

## 📚 Документация

- [Все Endpoints](/api-endpoints)
- [Function Calling](/function-calling)
- [GitHub](https://github.com/Belnsah3/Be1lnash3)

## 💡 Быстрый старт

### 1. Получить список моделей
\`\`\`bash
curl https://lumeai.ru/api/v1/ai/models \\
  -H "Authorization: Bearer sk-lumeai-xxx"
\`\`\`

### 2. Отправить chat запрос
\`\`\`bash
curl https://lumeai.ru/api/v1/ai/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk-lumeai-xxx" \\
  -d '{
    "model": "gpt-5-chat",
    "messages": [{"role": "user", "content": "Привет!"}]
  }'
\`\`\`

## 🎯 Совместимость

Полностью совместим с OpenAI API - используйте вместо:
\`\`\`
https://api.openai.com/v1/
\`\`\`

Наш:
\`\`\`
https://lumeai.ru/v1/
\`\`\`
`
```

## 🔄 Шаг 3: Миграция базы данных

Создай и запусти миграцию:

```bash
node -e "
const db = require('./src/database/db');

// Проверяем и добавляем колонки если нужно
try {
    db.prepare('ALTER TABLE api_keys ADD COLUMN key_hash TEXT').run();
    console.log('✅ Added key_hash column');
} catch (e) { console.log('ℹ️ key_hash already exists'); }

try {
    db.prepare('ALTER TABLE api_keys ADD COLUMN created_at INTEGER').run();
    console.log('✅ Added created_at column');
} catch (e) { console.log('ℹ️ created_at already exists'); }

try {
    db.prepare('ALTER TABLE api_keys ADD COLUMN last_used_at INTEGER').run();
    console.log('✅ Added last_used_at column');
} catch (e) { console.log('ℹ️ last_used_at already exists'); }

try {
    db.prepare('CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id)').run();
    console.log('✅ Created index on user_id');
} catch (e) {}

console.log('✅ Migration completed!');
"
```

## 📝 Шаг 4: Тестирование

### Тест API Keys:
```bash
# 1. Создай ключ через Dashboard
# 2. Проверь что он начинается с sk-lumeai-
# 3. Используй в запросе:

curl https://lumeai.ru/api/v1/ai/models \
  -H "Authorization: Bearer sk-lumeai-xxxxxxxxxx"
```

### Тест 2FA:
```bash
# 1. POST /api/v1/2fa/setup - Получи QR код
# 2. Отсканируй в Google Authenticator
# 3. POST /api/v1/2fa/verify с кодом - Активируй
# 4. Проверь вход с кодом
```

## 🚀 Шаг 5: Деплой

```bash
# На сервере:
cd ~/rest-api/rest-api
git pull
npm install
pm2 restart lumeai
```

## ✅ Финальная проверка

### Чек-лист:
- [ ] API ключи создаются с `sk-lumeai-` префиксом
- [ ] Ключи работают в Authorization заголовке
- [ ] 2FA QR код сканируется Google Authenticator
- [ ] 2FA код валидируется корректно
- [ ] Rate limiting работает (60 req/min)
- [ ] Swagger docs обновлен
- [ ] Dashboard показывает статистику
- [ ] Нет ошибок в логах

## 🎉 Готово!

Теперь у тебя:
- ✅ OpenAI-совместимые API ключи
- ✅ Работающая 2FA
- ✅ Rate Limiting
- ✅ Безопасность
- ✅ Актуальная документация

## 📞 Поддержка

Если что-то не работает:
1. Проверь логи: `pm2 logs lumeai`
2. Проверь БД: `sqlite3 database.db ".schema api_keys"`
3. Проверь консоль браузера (F12)

Удачи! 🚀
