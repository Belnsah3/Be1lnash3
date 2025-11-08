const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const path = require('path');
const { sessionMiddleware } = require('./middleware/session');
const db = require('./database/db');
const { startLimitResetScheduler } = require('./utils/limitReset');
const { initializeFunctions } = require('./functions/init');

// Загрузка переменных окружения
dotenv.config();

// Инициализация Function Calling
initializeFunctions();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(sessionMiddleware);

// Логирование запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  
  // Перехватываем res.json для логирования ответов
  const originalJson = res.json.bind(res);
  res.json = function(data) {
    console.log('🔍 res.json вызван с данными размером:', JSON.stringify(data).length, 'байт');
    return originalJson(data);
  };
  
  next();
});

// Swagger документация с кастомным дизайном
const customCss = `
  /* LumeAI Custom Theme */
  body { 
    background: #1a1a1a !important; 
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
  }
  
  .swagger-ui { 
    max-width: 1400px;
    margin: 0 auto;
    padding: 30px;
  }
  
  /* Скрываем топбар */
  .swagger-ui .topbar { display: none !important; }
  
  /* Кастомный заголовок */
  .swagger-ui .information-container {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    padding: 40px !important;
    border-radius: 20px !important;
    margin-bottom: 30px !important;
    border: 1px solid #3a3a3a !important;
  }
  
  .swagger-ui .info .title {
    color: #fff !important;
    font-size: 36px !important;
    font-weight: 700 !important;
    text-shadow: 0 2px 10px rgba(0,0,0,0.3);
  }
  
  .swagger-ui .info .description {
    color: rgba(255,255,255,0.9) !important;
    font-size: 16px !important;
  }
  
  /* Блоки операций */
  .swagger-ui .opblock {
    background: #2a2a2a !important;
    border: 1px solid #3a3a3a !important;
    border-radius: 15px !important;
    margin-bottom: 20px !important;
    box-shadow: 0 5px 15px rgba(0,0,0,0.2) !important;
  }
  
  .swagger-ui .opblock:hover {
    border-color: #667eea !important;
    box-shadow: 0 10px 30px rgba(102,126,234,0.3) !important;
  }
  
  .swagger-ui .opblock-summary {
    background: transparent !important;
    border: none !important;
    padding: 20px !important;
  }
  
  .swagger-ui .opblock-summary-method {
    border-radius: 8px !important;
    font-weight: 600 !important;
    min-width: 80px !important;
    text-align: center !important;
  }
  
  /* Цвета для методов */
  .swagger-ui .opblock.opblock-post { border-left: 4px solid #4ade80 !important; }
  .swagger-ui .opblock.opblock-get { border-left: 4px solid #667eea !important; }
  .swagger-ui .opblock.opblock-put { border-left: 4px solid #fbbf24 !important; }
  .swagger-ui .opblock.opblock-delete { border-left: 4px solid #ef4444 !important; }
  
  /* Описания */
  .swagger-ui .opblock-description-wrapper,
  .swagger-ui .opblock-section {
    background: #1a1a1a !important;
    color: #fff !important;
    padding: 20px !important;
    border-radius: 10px !important;
  }
  
  /* Таблицы параметров */
  .swagger-ui table thead tr td,
  .swagger-ui table thead tr th {
    background: #3a3a3a !important;
    color: #999 !important;
    border: none !important;
    padding: 15px !important;
    font-weight: 600 !important;
  }
  
  .swagger-ui .parameters-col_description {
    color: #ccc !important;
  }
  
  /* Кнопки */
  .swagger-ui .btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    color: #fff !important;
    border: none !important;
    border-radius: 10px !important;
    padding: 12px 24px !important;
    font-weight: 600 !important;
    box-shadow: 0 5px 15px rgba(102,126,234,0.3) !important;
    transition: all 0.3s !important;
  }
  
  .swagger-ui .btn:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 10px 25px rgba(102,126,234,0.4) !important;
  }
  
  /* Responses */
  .swagger-ui .responses-inner {
    background: #2a2a2a !important;
    border-radius: 10px !important;
    padding: 20px !important;
  }
  
  .swagger-ui .response-col_status {
    color: #4ade80 !important;
    font-weight: 600 !important;
  }
  
  /* Models */
  .swagger-ui .model-box {
    background: #2a2a2a !important;
    border: 1px solid #3a3a3a !important;
    border-radius: 10px !important;
    padding: 20px !important;
  }
  
  .swagger-ui .model-title {
    color: #667eea !important;
    font-weight: 600 !important;
  }
  
  /* Code блоки */
  .swagger-ui .highlight-code {
    background: #1a1a1a !important;
    border: 1px solid #3a3a3a !important;
    border-radius: 10px !important;
  }
  
  .swagger-ui pre {
    background: #1a1a1a !important;
    color: #667eea !important;
  }
  
  /* Скроллбар */
  .swagger-ui ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  
  .swagger-ui ::-webkit-scrollbar-track {
    background: #1a1a1a;
  }
  
  .swagger-ui ::-webkit-scrollbar-thumb {
    background: #667eea;
    border-radius: 5px;
  }
  
  .swagger-ui ::-webkit-scrollbar-thumb:hover {
    background: #764ba2;
  }
  
  /* Inputs */
  .swagger-ui input[type=text],
  .swagger-ui textarea,
  .swagger-ui select {
    background: #1a1a1a !important;
    border: 1px solid #3a3a3a !important;
    border-radius: 8px !important;
    color: #fff !important;
    padding: 10px !important;
  }
  
  .swagger-ui input[type=text]:focus,
  .swagger-ui textarea:focus {
    border-color: #667eea !important;
    box-shadow: 0 0 0 3px rgba(102,126,234,0.1) !important;
  }
  
  /* Схемы */
  .swagger-ui .scheme-container {
    background: #2a2a2a !important;
    border-radius: 10px !important;
    padding: 15px !important;
    box-shadow: none !important;
  }
  
  /* Тексты */
  .swagger-ui .opblock-summary-description,
  .swagger-ui .parameter__name,
  .swagger-ui .parameter__type,
  .swagger-ui .response-col_description {
    color: #ccc !important;
  }
  
  /* Ссылки */
  .swagger-ui a {
    color: #667eea !important;
  }
  
  .swagger-ui a:hover {
    color: #764ba2 !important;
  }
  
  /* Authorize button */
  .swagger-ui .btn.authorize {
    background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%) !important;
  }
  
  /* Общие улучшения */
  .swagger-ui .wrapper {
    padding: 0 !important;
  }
  
  .swagger-ui h4,
  .swagger-ui h5 {
    color: #fff !important;
  }
  
  .swagger-ui label {
    color: #999 !important;
  }
`;

const customSiteTitle = '🌟 LumeAI API Documentation';
const customfavIcon = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🌟</text></svg>';

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss,
  customSiteTitle,
  customfavIcon
}));

// Роутер для Function Calling документации
app.get('/function-calling', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/function-calling.html'));
});

// Роутер для API Endpoints страницы
app.get('/api-endpoints', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/api-endpoints.html'));
});

// Обслуживание markdown файла для документации
app.get('/FUNCTION_CALLING_GUIDE.md', (req, res) => {
  res.sendFile(path.join(__dirname, '../FUNCTION_CALLING_GUIDE.md'), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8'
    }
  });
});

// Статические файлы для веб-интерфейса
app.use(express.static(path.join(__dirname, '../public')));

// Подключение маршрутов
const usersRoutes = require('./routes/users');
const productsRoutes = require('./routes/products');
const aiRoutes = require('./routes/ai');
const keysRoutes = require('./routes/keys');
const authRoutes = require('./routes/auth');
const twoFARoutes = require('./routes/twofa');
const adminRoutes = require('./routes/admin');
const modelsRoutes = require('./routes/models');

app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/products', productsRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/keys', keysRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/2fa', twoFARoutes);
app.use('/api/v1/chats', require('./routes/chats'));
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/models', modelsRoutes);
app.use('/api/v1/settings', require('./routes/settings'));
app.use('/api/v1/stats', require('./routes/stats'));

// Алиасы без /v1/ для совместимости с фронтендом
app.use('/api/auth', authRoutes);
app.use('/api/keys', keysRoutes);
app.use('/api/models', modelsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/v1/files', require('./routes/files'));

// Дополнительные роуты для совместимости с разными клиентами
app.use('/v1', aiRoutes);  // Для клиентов которые добавляют /v1
// app.use('/api', aiRoutes);  // ОТКЛЮЧЕНО - конфликтует с /api/auth

// Корневые роуты - используем те же aiRoutes
// app.use('/', aiRoutes);  // ОТКЛЮЧЕНО - перехватывает ВСЕ запросы включая /api/auth

// GET роуты для списка моделей (без авторизации для совместимости)
const modelsController = (req, res) => {
  const models = require('./data/models');
  res.json({
    object: 'list',
    data: models.map(model => ({
      id: model.id,
      object: 'model',
      created: 1686935002,
      owned_by: 'lumeai',
      permission: [],
      root: model.id,
      parent: null
    }))
  });
};

app.get('/v1/models', modelsController);
app.get('/models', modelsController);
app.get('/v1/engines', modelsController);
app.get('/engines', modelsController);

// Корневой маршрут - главная страница
app.get('/', (req, res) => {
  if (req.session && req.session.userId) {
    res.redirect('/dashboard');
  } else {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  }
});

// Login page
app.get('/login', (req, res) => {
  if (req.session && req.session.userId) {
    res.redirect('/dashboard');
  } else {
    res.sendFile(path.join(__dirname, '../public/login.html'));
  }
});

// Registration page
app.get('/register', (req, res) => {
  if (req.session && req.session.userId) {
    res.redirect('/dashboard');
  } else {
    res.sendFile(path.join(__dirname, '../public/register.html'));
  }
});

// Dashboard page
app.get('/dashboard', (req, res) => {
  if (req.session && req.session.userId) {
    res.sendFile(path.join(__dirname, '../public/dashboard.html'));
  } else {
    res.redirect('/login');
  }
});

// Chat page
app.get('/chat', (req, res) => {
  if (req.session && req.session.userId) {
    res.sendFile(path.join(__dirname, '../public/chat.html'));
  } else {
    res.redirect('/login');
  }
});

// Settings page
app.get('/settings', (req, res) => {
  if (req.session && req.session.userId) {
    res.sendFile(path.join(__dirname, '../public/settings.html'));
  } else {
    res.redirect('/login');
  }
});

// JSON info endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Добро пожаловать в REST API',
    version: '1.0.0',
    documentation: '/api-docs',
    endpoints: {
      users: '/api/v1/users',
      products: '/api/v1/products',
      ai: '/api/v1/ai',
      keys: '/api/v1/keys'
    },
    interfaces: {
      home: '/',
      swagger: '/api-docs'
    },
    authentication: {
      type: 'API Key',
      header: 'Authorization',
      format: 'Bearer YOUR_API_KEY'
    }
  });
});

// Обработка 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Маршрут не найден',
    path: req.path
  });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Внутренняя ошибка сервера',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`\n🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📚 Документация доступна по адресу: http://localhost:${PORT}/api-docs`);
  console.log(`🔗 API endpoint: http://localhost:${PORT}/api/v1`);
  
  // Запускаем планировщик сброса лимитов
  startLimitResetScheduler();
});

module.exports = app;
