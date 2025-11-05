const express = require('express');
const router = express.Router();

// Временное хранилище данных
let products = [
  { id: 1, name: 'Ноутбук', description: 'Мощный ноутбук для работы', price: 999.99, category: 'Электроника', inStock: true },
  { id: 2, name: 'Смартфон', description: 'Современный смартфон', price: 599.99, category: 'Электроника', inStock: true },
  { id: 3, name: 'Наушники', description: 'Беспроводные наушники', price: 149.99, category: 'Аксессуары', inStock: false }
];

let nextId = 4;

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Получить список всех товаров
 *     description: Возвращает массив всех товаров с возможностью фильтрации и сортировки
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Фильтр по категории
 *       - in: query
 *         name: inStock
 *         schema:
 *           type: boolean
 *         description: Фильтр по наличию на складе
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Минимальная цена
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Максимальная цена
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [price, name]
 *         description: Поле для сортировки
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Порядок сортировки
 *     responses:
 *       200:
 *         description: Список товаров
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
 *                   example: 3
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 */
router.get('/', (req, res) => {
  let filteredProducts = [...products];
  
  // Фильтрация по категории
  if (req.query.category) {
    filteredProducts = filteredProducts.filter(p => 
      p.category.toLowerCase() === req.query.category.toLowerCase()
    );
  }
  
  // Фильтрация по наличию
  if (req.query.inStock !== undefined) {
    const inStock = req.query.inStock === 'true';
    filteredProducts = filteredProducts.filter(p => p.inStock === inStock);
  }
  
  // Фильтрация по цене
  if (req.query.minPrice) {
    filteredProducts = filteredProducts.filter(p => p.price >= parseFloat(req.query.minPrice));
  }
  if (req.query.maxPrice) {
    filteredProducts = filteredProducts.filter(p => p.price <= parseFloat(req.query.maxPrice));
  }
  
  // Сортировка
  if (req.query.sortBy) {
    const order = req.query.order === 'desc' ? -1 : 1;
    filteredProducts.sort((a, b) => {
      if (req.query.sortBy === 'price') {
        return (a.price - b.price) * order;
      } else if (req.query.sortBy === 'name') {
        return a.name.localeCompare(b.name) * order;
      }
      return 0;
    });
  }
  
  res.json({
    success: true,
    count: filteredProducts.length,
    data: filteredProducts
  });
});

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Получить товар по ID
 *     description: Возвращает данные конкретного товара
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID товара
 *     responses:
 *       200:
 *         description: Данные товара
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  
  if (!product) {
    return res.status(404).json({ 
      success: false,
      error: 'Товар не найден' 
    });
  }
  
  res.json({
    success: true,
    data: product
  });
});

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Создать новый товар
 *     description: Добавляет новый товар в каталог
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 example: Планшет
 *               description:
 *                 type: string
 *                 example: Планшет для чтения
 *               price:
 *                 type: number
 *                 example: 299.99
 *               category:
 *                 type: string
 *                 example: Электроника
 *               inStock:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Товар успешно создан
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
 *                   example: Товар успешно создан
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.post('/', (req, res) => {
  const { name, description, price, category, inStock } = req.body;
  
  // Валидация
  if (!name || price === undefined) {
    return res.status(400).json({ 
      success: false,
      error: 'Поля name и price обязательны' 
    });
  }
  
  if (price < 0) {
    return res.status(400).json({ 
      success: false,
      error: 'Цена не может быть отрицательной' 
    });
  }
  
  const newProduct = {
    id: nextId++,
    name,
    description: description || '',
    price: parseFloat(price),
    category: category || 'Прочее',
    inStock: inStock !== undefined ? inStock : true
  };
  
  products.push(newProduct);
  
  res.status(201).json({
    success: true,
    message: 'Товар успешно создан',
    data: newProduct
  });
});

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Обновить данные товара
 *     description: Полное обновление данных товара
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID товара
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 example: Ноутбук (обновлено)
 *               description:
 *                 type: string
 *                 example: Обновленное описание
 *               price:
 *                 type: number
 *                 example: 1099.99
 *               category:
 *                 type: string
 *                 example: Электроника
 *               inStock:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Товар успешно обновлен
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
 *                   example: Товар успешно обновлен
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put('/:id', (req, res) => {
  const { name, description, price, category, inStock } = req.body;
  const productId = parseInt(req.params.id);
  
  const productIndex = products.findIndex(p => p.id === productId);
  
  if (productIndex === -1) {
    return res.status(404).json({ 
      success: false,
      error: 'Товар не найден' 
    });
  }
  
  // Валидация
  if (!name || price === undefined) {
    return res.status(400).json({ 
      success: false,
      error: 'Поля name и price обязательны' 
    });
  }
  
  if (price < 0) {
    return res.status(400).json({ 
      success: false,
      error: 'Цена не может быть отрицательной' 
    });
  }
  
  products[productIndex] = {
    id: productId,
    name,
    description: description || '',
    price: parseFloat(price),
    category: category || 'Прочее',
    inStock: inStock !== undefined ? inStock : true
  };
  
  res.json({
    success: true,
    message: 'Товар успешно обновлен',
    data: products[productIndex]
  });
});

/**
 * @swagger
 * /products/{id}:
 *   patch:
 *     summary: Частично обновить данные товара
 *     description: Обновление отдельных полей товара
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID товара
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               inStock:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Товар успешно обновлен
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
 *                   example: Товар успешно обновлен
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch('/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const productIndex = products.findIndex(p => p.id === productId);
  
  if (productIndex === -1) {
    return res.status(404).json({ 
      success: false,
      error: 'Товар не найден' 
    });
  }
  
  // Валидация цены если она предоставлена
  if (req.body.price !== undefined && req.body.price < 0) {
    return res.status(400).json({ 
      success: false,
      error: 'Цена не может быть отрицательной' 
    });
  }
  
  products[productIndex] = {
    ...products[productIndex],
    ...req.body,
    id: productId // ID не должен изменяться
  };
  
  res.json({
    success: true,
    message: 'Товар успешно обновлен',
    data: products[productIndex]
  });
});

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Удалить товар
 *     description: Удаляет товар из каталога
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID товара
 *     responses:
 *       200:
 *         description: Товар успешно удален
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
 *                   example: Товар успешно удален
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const productIndex = products.findIndex(p => p.id === productId);
  
  if (productIndex === -1) {
    return res.status(404).json({ 
      success: false,
      error: 'Товар не найден' 
    });
  }
  
  products.splice(productIndex, 1);
  
  res.json({
    success: true,
    message: 'Товар успешно удален'
  });
});

module.exports = router;
