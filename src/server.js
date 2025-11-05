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

// Загрузка переменных окружения
dotenv.config();

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

// Swagger документация
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'REST API Documentation'
}));

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
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/models', modelsRoutes);

// Дополнительные роуты для совместимости с разными клиентами
app.use('/v1', aiRoutes);  // Для клиентов которые добавляют /v1
app.use('/api', aiRoutes);  // Для клиентов которые добавляют /api

// Корневые роуты - используем те же aiRoutes
app.use('/', aiRoutes);  // Для корневых путей типа /chat/completions

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
    res.redirect('/login-new');
  }
});

// Login page (old)
app.get('/login', (req, res) => {
  if (req.session && req.session.userId) {
    res.redirect('/dashboard');
  } else {
    res.sendFile(path.join(__dirname, '../public/login.html'));
  }
});

// New login page
app.get('/login-new', (req, res) => {
  if (req.session && req.session.userId) {
    res.redirect('/dashboard');
  } else {
    res.sendFile(path.join(__dirname, '../public/login-new.html'));
  }
});

// New registration page
app.get('/register-new', (req, res) => {
  if (req.session && req.session.userId) {
    res.redirect('/dashboard');
  } else {
    res.sendFile(path.join(__dirname, '../public/register-new.html'));
  }
});

// Dashboard page
app.get('/dashboard', (req, res) => {
  if (req.session && req.session.userId) {
    res.sendFile(path.join(__dirname, '../public/dashboard.html'));
  } else {
    res.redirect('/login-new');
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
