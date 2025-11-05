const express = require('express');
const router = express.Router();

// Временное хранилище данных (в реальном приложении используйте БД)
let users = [
  { id: 1, name: 'Иван Иванов', email: 'ivan@example.com', age: 30, createdAt: new Date().toISOString() },
  { id: 2, name: 'Мария Петрова', email: 'maria@example.com', age: 25, createdAt: new Date().toISOString() }
];

let nextId = 3;

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Получить список всех пользователей
 *     description: Возвращает массив всех пользователей с возможностью фильтрации
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Фильтр по имени пользователя
 *       - in: query
 *         name: minAge
 *         schema:
 *           type: integer
 *         description: Минимальный возраст
 *       - in: query
 *         name: maxAge
 *         schema:
 *           type: integer
 *         description: Максимальный возраст
 *     responses:
 *       200:
 *         description: Список пользователей
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 2
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 */
router.get('/', (req, res) => {
  let filteredUsers = [...users];
  
  // Фильтрация по имени
  if (req.query.name) {
    filteredUsers = filteredUsers.filter(u => 
      u.name.toLowerCase().includes(req.query.name.toLowerCase())
    );
  }
  
  // Фильтрация по возрасту
  if (req.query.minAge) {
    filteredUsers = filteredUsers.filter(u => u.age >= parseInt(req.query.minAge));
  }
  if (req.query.maxAge) {
    filteredUsers = filteredUsers.filter(u => u.age <= parseInt(req.query.maxAge));
  }
  
  res.json({
    success: true,
    count: filteredUsers.length,
    data: filteredUsers
  });
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Получить пользователя по ID
 *     description: Возвращает данные конкретного пользователя
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID пользователя
 *     responses:
 *       200:
 *         description: Данные пользователя
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  
  if (!user) {
    return res.status(404).json({ 
      success: false,
      error: 'Пользователь не найден' 
    });
  }
  
  res.json({
    success: true,
    data: user
  });
});

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Создать нового пользователя
 *     description: Добавляет нового пользователя в систему
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 example: Петр Сидоров
 *               email:
 *                 type: string
 *                 format: email
 *                 example: petr@example.com
 *               age:
 *                 type: integer
 *                 example: 28
 *     responses:
 *       201:
 *         description: Пользователь успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Пользователь успешно создан
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.post('/', (req, res) => {
  const { name, email, age } = req.body;
  
  // Валидация
  if (!name || !email) {
    return res.status(400).json({ 
      success: false,
      error: 'Поля name и email обязательны' 
    });
  }
  
  // Проверка уникальности email
  if (users.some(u => u.email === email)) {
    return res.status(400).json({ 
      success: false,
      error: 'Пользователь с таким email уже существует' 
    });
  }
  
  const newUser = {
    id: nextId++,
    name,
    email,
    age: age || null,
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  
  res.status(201).json({
    success: true,
    message: 'Пользователь успешно создан',
    data: newUser
  });
});

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Обновить данные пользователя
 *     description: Полное обновление данных пользователя
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 example: Иван Иванов (обновлено)
 *               email:
 *                 type: string
 *                 example: ivan.new@example.com
 *               age:
 *                 type: integer
 *                 example: 31
 *     responses:
 *       200:
 *         description: Пользователь успешно обновлен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Пользователь успешно обновлен
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.put('/:id', (req, res) => {
  const { name, email, age } = req.body;
  const userId = parseInt(req.params.id);
  
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({ 
      success: false,
      error: 'Пользователь не найден' 
    });
  }
  
  // Валидация
  if (!name || !email) {
    return res.status(400).json({ 
      success: false,
      error: 'Поля name и email обязательны' 
    });
  }
  
  // Проверка уникальности email (исключая текущего пользователя)
  if (users.some(u => u.email === email && u.id !== userId)) {
    return res.status(400).json({ 
      success: false,
      error: 'Пользователь с таким email уже существует' 
    });
  }
  
  users[userIndex] = {
    ...users[userIndex],
    name,
    email,
    age: age || null
  };
  
  res.json({
    success: true,
    message: 'Пользователь успешно обновлен',
    data: users[userIndex]
  });
});

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Частично обновить данные пользователя
 *     description: Обновление отдельных полей пользователя
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Новое имя
 *               email:
 *                 type: string
 *                 example: new@example.com
 *               age:
 *                 type: integer
 *                 example: 32
 *     responses:
 *       200:
 *         description: Пользователь успешно обновлен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Пользователь успешно обновлен
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch('/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({ 
      success: false,
      error: 'Пользователь не найден' 
    });
  }
  
  // Проверка уникальности email при его изменении
  if (req.body.email && users.some(u => u.email === req.body.email && u.id !== userId)) {
    return res.status(400).json({ 
      success: false,
      error: 'Пользователь с таким email уже существует' 
    });
  }
  
  users[userIndex] = {
    ...users[userIndex],
    ...req.body,
    id: userId // ID не должен изменяться
  };
  
  res.json({
    success: true,
    message: 'Пользователь успешно обновлен',
    data: users[userIndex]
  });
});

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Удалить пользователя
 *     description: Удаляет пользователя из системы
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID пользователя
 *     responses:
 *       200:
 *         description: Пользователь успешно удален
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Пользователь успешно удален
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({ 
      success: false,
      error: 'Пользователь не найден' 
    });
  }
  
  users.splice(userIndex, 1);
  
  res.json({
    success: true,
    message: 'Пользователь успешно удален'
  });
});

module.exports = router;
