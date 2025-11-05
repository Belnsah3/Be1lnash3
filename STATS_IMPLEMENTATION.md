# 📊 **Реализация системы статистики с токенами и графиками**

## ✅ **Что уже сделано:**

1. ✅ Обновлена схема БД - добавлены поля для токенов
2. ✅ Добавлены функции `logRequest()` и `getUserStats()` в auth.js
3. ✅ Импортирован `logRequest` в ai.js

---

## 🔧 **Что нужно доделать:**

### **1. Добавить логирование в ai.js**

В файле `src/routes/ai.js` после успешного ответа добавь:

```javascript
// После строки res.json(responseData); добавь:

const startTime = Date.now();

// ... весь код запроса ...

const responseTime = Date.now() - startTime;

// Логируем запрос
logRequest(
  req.apiKeyInfo.id,
  req.userId,
  model,
  responseData.usage,
  true,
  null,
  responseTime
);
```

**Полный пример для не-streaming режима:**

```javascript
// В начале обработчика
const startTime = Date.now();

try {
  // ... весь код ...
  
  // После получения ответа
  const responseData = {
    id: lastChunk?.id || `chatcmpl-${Date.now()}`,
    // ... rest of response ...
  };
  
  const responseTime = Date.now() - startTime;
  
  // Логируем запрос
  logRequest(
    req.apiKeyInfo.id,
    req.userId,
    model,
    responseData.usage,
    true,
    null,
    responseTime
  );
  
  res.json(responseData);
  
} catch (error) {
  const responseTime = Date.now() - startTime;
  
  // Логируем ошибку
  logRequest(
    req.apiKeyInfo?.id,
    req.userId,
    model,
    null,
    false,
    error.message,
    responseTime
  );
  
  // ... error handling ...
}
```

---

### **2. Создать API endpoint для статистики**

Создай файл `src/routes/stats.js`:

```javascript
const express = require('express');
const router = express.Router();
const { getUserStats } = require('../middleware/auth');
const { requireSession } = require('../middleware/session');

// GET /api/v1/stats - получить статистику текущего пользователя
router.get('/', requireSession, (req, res) => {
  try {
    const stats = getUserStats(req.session.userId);
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
```

**Подключи в `src/server.js`:**

```javascript
const statsRoutes = require('./routes/stats');
app.use('/api/v1/stats', statsRoutes);
```

---

### **3. Создать вкладку "Статистика" в dashboard**

Обнови `public/dashboard.html`, добавь новую вкладку:

```html
<div class="tabs">
  <button class="tab active" data-tab="keys">API Ключи</button>
  <button class="tab" data-tab="models">Модели</button>
  <button class="tab" data-tab="stats">Статистика</button> <!-- НОВАЯ -->
  <button class="tab" data-tab="settings">Настройки</button>
  <button class="tab" data-tab="admin">Управление</button>
</div>

<!-- Контент вкладки Статистика -->
<div id="stats-content" class="tab-content" style="display:none;">
  <h2>📊 Статистика использования</h2>
  
  <!-- Общая статистика -->
  <div class="stats-grid">
    <div class="stat-card">
      <h3>Всего запросов</h3>
      <p id="total-requests">0</p>
    </div>
    <div class="stat-card">
      <h3>Всего токенов</h3>
      <p id="total-tokens">0</p>
    </div>
    <div class="stat-card">
      <h3>Prompt токенов</h3>
      <p id="prompt-tokens">0</p>
    </div>
    <div class="stat-card">
      <h3>Completion токенов</h3>
      <p id="completion-tokens">0</p>
    </div>
  </div>
  
  <!-- График запросов за 7 дней -->
  <div class="chart-container">
    <h3>Запросы за последние 7 дней</h3>
    <canvas id="requests-chart"></canvas>
  </div>
  
  <!-- Статистика по моделям -->
  <div class="models-stats">
    <h3>Использование по моделям</h3>
    <table id="models-stats-table">
      <thead>
        <tr>
          <th>Модель</th>
          <th>Запросов</th>
          <th>Prompt токенов</th>
          <th>Completion токенов</th>
          <th>Всего токенов</th>
          <th>Ср. время ответа</th>
        </tr>
      </thead>
      <tbody id="models-stats-body"></tbody>
    </table>
  </div>
</div>
```

---

### **4. Добавить JavaScript для загрузки статистики**

В `public/js/dashboard.js` добавь:

```javascript
// Загрузка статистики
async function loadStats() {
  try {
    const response = await fetch('/api/v1/stats');
    const data = await response.json();
    
    if (data.success) {
      const stats = data.stats;
      
      // Обновляем общую статистику
      document.getElementById('total-requests').textContent = 
        stats.total.total_requests || 0;
      document.getElementById('total-tokens').textContent = 
        (stats.total.total_tokens || 0).toLocaleString();
      document.getElementById('prompt-tokens').textContent = 
        (stats.total.total_prompt_tokens || 0).toLocaleString();
      document.getElementById('completion-tokens').textContent = 
        (stats.total.total_completion_tokens || 0).toLocaleString();
      
      // Обновляем таблицу моделей
      const tbody = document.getElementById('models-stats-body');
      tbody.innerHTML = '';
      
      stats.byModel.forEach(model => {
        const row = tbody.insertRow();
        row.innerHTML = `
          <td>${model.model}</td>
          <td>${model.requests}</td>
          <td>${(model.prompt_tokens || 0).toLocaleString()}</td>
          <td>${(model.completion_tokens || 0).toLocaleString()}</td>
          <td>${(model.total_tokens || 0).toLocaleString()}</td>
          <td>${Math.round(model.avg_response_time || 0)}ms</td>
        `;
      });
      
      // Рисуем график
      drawRequestsChart(stats.daily);
    }
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// Рисуем график запросов
function drawRequestsChart(dailyData) {
  const canvas = document.getElementById('requests-chart');
  const ctx = canvas.getContext('2d');
  
  // Простой график (или используй Chart.js)
  // TODO: Добавить Chart.js для красивых графиков
}

// Вызываем при переключении на вкладку Статистика
document.querySelector('[data-tab="stats"]').addEventListener('click', () => {
  loadStats();
});
```

---

### **5. Добавить Chart.js для графиков**

В `public/dashboard.html` добавь перед закрывающим `</body>`:

```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
```

Обнови функцию `drawRequestsChart`:

```javascript
let requestsChart = null;

function drawRequestsChart(dailyData) {
  const canvas = document.getElementById('requests-chart');
  const ctx = canvas.getContext('2d');
  
  // Уничтожаем старый график
  if (requestsChart) {
    requestsChart.destroy();
  }
  
  // Подготавливаем данные
  const labels = dailyData.map(d => d.date).reverse();
  const requests = dailyData.map(d => d.requests).reverse();
  const tokens = dailyData.map(d => d.tokens).reverse();
  
  // Создаем график
  requestsChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Запросы',
          data: requests,
          borderColor: 'rgb(102, 126, 234)',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          yAxisID: 'y'
        },
        {
          label: 'Токены',
          data: tokens,
          borderColor: 'rgb(237, 100, 166)',
          backgroundColor: 'rgba(237, 100, 166, 0.1)',
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      interaction: {
        mode: 'index',
        intersect: false
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Запросы'
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Токены'
          },
          grid: {
            drawOnChartArea: false
          }
        }
      }
    }
  });
}
```

---

## 🎨 **Стили для вкладки Статистика**

Добавь в `public/css/dashboard.css`:

```css
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  border-radius: 10px;
  color: white;
  text-align: center;
}

.stat-card h3 {
  font-size: 14px;
  margin-bottom: 10px;
  opacity: 0.9;
}

.stat-card p {
  font-size: 32px;
  font-weight: bold;
  margin: 0;
}

.chart-container {
  background: white;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.chart-container canvas {
  max-height: 300px;
}

.models-stats {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.models-stats table {
  width: 100%;
  border-collapse: collapse;
}

.models-stats th,
.models-stats td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.models-stats th {
  background: #f8f9fa;
  font-weight: 600;
}
```

---

## 🚀 **Порядок внедрения:**

1. ✅ Обнови `src/database/db.js` (уже сделано)
2. ✅ Обнови `src/middleware/auth.js` (уже сделано)
3. ⏳ Добавь логирование в `src/routes/ai.js`
4. ⏳ Создай `src/routes/stats.js`
5. ⏳ Подключи stats routes в `src/server.js`
6. ⏳ Обнови `public/dashboard.html`
7. ⏳ Обнови `public/js/dashboard.js`
8. ⏳ Добавь стили в `public/css/dashboard.css`

---

## 📊 **Результат:**

После внедрения получишь:

- ✅ Подсчет токенов для каждого запроса
- ✅ Статистика по моделям
- ✅ Графики использования за 7 дней
- ✅ Время ответа для каждой модели
- ✅ Работает для админов и обычных пользователей

---

**НАЧНИ С ПУНКТА 3 - ДОБАВЬ ЛОГИРОВАНИЕ В AI.JS!** 🚀
