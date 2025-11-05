// Глобальные переменные
let currentUser = null;
let apiKeys = [];
let allModels = [];
let isLoading = false;

// Загрузка данных пользователя
async function loadUserData() {
    if (isLoading) return;
    isLoading = true;
    
    try {
        const response = await fetch('/api/v1/auth/me');
        
        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/login';
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        if (data.success && data.user) {
            currentUser = data.user;
            
            // Обновляем UI
            document.getElementById('user-name').textContent = currentUser.name || 'User';
            document.getElementById('user-role').textContent = currentUser.role || 'user';
            document.getElementById('user-avatar').textContent = (currentUser.name || 'U').charAt(0).toUpperCase();

            // Если супер-админ, загружаем админ-панель
            if (currentUser.is_super_admin) {
                loadAdminPanel();
            }

            // Загружаем данные
            await Promise.all([
                loadAPIKeys(),
                loadModels(),
                loadStats()
            ]);
        } else {
            console.error('Invalid response:', data);
            window.location.href = '/login';
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        alert('Ошибка загрузки данных пользователя');
    } finally {
        isLoading = false;
    }
}

// Загрузка статистики
async function loadStats() {
    try {
        const response = await fetch('/api/v1/stats');
        const data = await response.json();

        if (data.success && data.stats) {
            const stats = data.stats;

            // Обновляем карточки статистики
            document.getElementById('stat-chats').textContent = stats.chatsCount || 0;
            document.getElementById('stat-messages').textContent = stats.messagesCount || 0;
            document.getElementById('stat-models').textContent = stats.models?.length || 0;
            document.getElementById('stat-files').textContent = stats.filesCount || 0;

            // Загружаем последние чаты
            loadRecentChats(stats.recentChats || []);
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Отображение последних чатов
function loadRecentChats(chats) {
    const container = document.getElementById('chats-container');
    
    if (!chats || chats.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">💬</div>
                <div>Нет чатов</div>
                <p style="color:#999;margin-top:10px">Создайте свой первый чат!</p>
                <button class="btn btn-primary" onclick="window.location.href='/chat'" style="margin-top:20px">
                    Создать чат
                </button>
            </div>
        `;
        return;
    }

    const tableHtml = `
        <table class="table">
            <thead>
                <tr>
                    <th>Название</th>
                    <th>Модель</th>
                    <th>Сообщений</th>
                    <th>Дата</th>
                    <th>Действия</th>
                </tr>
            </thead>
            <tbody>
                ${chats.map(chat => `
                    <tr id="chat-${chat.id}">
                        <td data-label="Название">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span style="font-size: 20px;">💬</span>
                                <strong>${escapeHtml(chat.title || 'Новый чат')}</strong>
                            </div>
                        </td>
                        <td data-label="Модель">
                            <span class="badge badge-model">${escapeHtml(chat.model || 'N/A')}</span>
                        </td>
                        <td data-label="Сообщений">
                            <span class="badge badge-count">${chat.message_count || 0}</span>
                        </td>
                        <td data-label="Дата">
                            <span style="color: #888;">${formatChatDate(chat.updated_at)}</span>
                        </td>
                        <td data-label="Действия">
                            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                                <button class="btn btn-primary btn-sm" onclick="openChat(${chat.id})" title="Открыть чат">
                                    📖 Открыть
                                </button>
                                <button class="btn btn-danger btn-sm" onclick="deleteChat(${chat.id})" title="Удалить чат">
                                    🗑️ Удалить
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = tableHtml;
}

// Открыть чат
function openChat(chatId) {
    window.location.href = `/chat?id=${chatId}`;
}

// Удалить чат
async function deleteChat(chatId) {
    if (!confirm('Вы уверены что хотите удалить этот чат? Все сообщения будут удалены.')) {
        return;
    }

    try {
        const response = await fetch(`/api/v1/chats/${chatId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            // Удаляем строку из таблицы с анимацией
            const row = document.getElementById(`chat-${chatId}`);
            if (row) {
                row.style.opacity = '0';
                row.style.transition = 'opacity 0.3s';
                setTimeout(() => {
                    row.remove();
                    
                    // Если чатов не осталось, показываем пустое состояние
                    const tbody = document.querySelector('#chats-container tbody');
                    if (tbody && tbody.children.length === 0) {
                        loadStats(); // Перезагружаем статистику и чаты
                    }
                }, 300);
            }

            showAlert('alert-chats', 'Чат успешно удален', 'success');
        } else {
            showAlert('alert-chats', data.error || 'Ошибка удаления чата', 'error');
        }
    } catch (error) {
        console.error('Error deleting chat:', error);
        showAlert('alert-chats', 'Ошибка удаления чата', 'error');
    }
}

// Экранирование HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Форматирование даты
function formatChatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Только что';
    if (diff < 3600000) return Math.floor(diff / 60000) + ' мин назад';
    if (diff < 86400000) return Math.floor(diff / 3600000) + ' ч назад';
    
    const options = { day: 'numeric', month: 'short' };
    return date.toLocaleDateString('ru-RU', options);
}

// Загрузка API ключей
async function loadAPIKeys() {
    try {
        const response = await fetch('/api/v1/keys');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        if (data.success && data.keys) {
            apiKeys = data.keys;
            renderAPIKeys();
        } else {
            console.error('Invalid keys response:', data);
            renderAPIKeys(); // Показываем пустой список
        }
    } catch (error) {
        console.error('Error loading keys:', error);
        renderAPIKeys(); // Показываем пустой список
    }
}

// Отрисовка API ключей
function renderAPIKeys() {
    const container = document.getElementById('keys-container');
    
    if (!container) {
        console.error('keys-container not found');
        return;
    }

    if (apiKeys.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔑</div>
                <div>У вас пока нет API ключей</div>
                <button class="btn btn-primary" onclick="openCreateKeyModal()" style="margin-top:20px">
                    Создать первый ключ
                </button>
            </div>
        `;
        return;
    }

    let html = `
        <table class="table">
            <thead>
                <tr>
                    <th>Название</th>
                    <th>Ключ</th>
                    <th>Использовано</th>
                    <th>Лимит</th>
                    <th>Статус</th>
                    <th>Действия</th>
                </tr>
            </thead>
            <tbody>
    `;

    apiKeys.forEach(key => {
        const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.is_super_admin);
        const displayLimit = isAdmin ? '∞' : key.limit_requests;

        html += `
            <tr>
                <td data-label="Название"><span class="key-name">${key.name}</span></td>
                <td data-label="Ключ">
                    <span class="key-value">${key.key.substring(0, 20)}...</span>
                    <button onclick="copyKey('${key.key}')" style="background:none;border:none;color:#667eea;cursor:pointer;margin-left:10px">📋</button>
                </td>
                <td data-label="Использовано">${key.used_requests || 0}</td>
                <td data-label="Лимит">${displayLimit}</td>
                <td data-label="Статус">
                    <span class="status ${key.is_active ? 'status-active' : 'status-inactive'}">
                        ${key.is_active ? 'Активен' : 'Неактивен'}
                    </span>
                </td>
                <td data-label="Действия">
                    <button class="btn btn-${key.is_active ? 'secondary' : 'primary'}" 
                            onclick="toggleKey('${key.key}', ${!key.is_active})" 
                            style="padding:8px 16px;font-size:12px;margin-right:5px">
                        ${key.is_active ? '⏸️ Деактивировать' : '▶️ Активировать'}
                    </button>
                    <button class="btn btn-danger" onclick="deleteKey('${key.key}')" style="padding:8px 16px;font-size:12px">
                        🗑️ Удалить
                    </button>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

// Создание API ключа
async function createKey(e) {
    e.preventDefault();

    const btn = document.getElementById('create-key-btn');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="loader"></span> Создание...';

    try {
        const response = await fetch('/api/v1/keys', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: document.getElementById('key-name').value,
                limit: parseInt(document.getElementById('key-limit').value)
            })
        });

        const data = await response.json();

        if (data.success) {
            showAlert('alert-modal', 'Ключ успешно создан!', 'success');
            setTimeout(() => {
                closeModal('create-key-modal');
                loadAPIKeys();
            }, 1500);
        } else {
            showAlert('alert-modal', data.error || 'Ошибка создания ключа', 'error');
        }
    } catch (error) {
        showAlert('alert-modal', 'Ошибка сети', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

// Активация/деактивация API ключа
async function toggleKey(key, activate) {
    const action = activate ? 'активировать' : 'деактивировать';
    if (!confirm(`Вы уверены, что хотите ${action} этот ключ?`)) return;

    try {
        const encodedKey = encodeURIComponent(key);
        const response = await fetch(`/api/v1/keys/${encodedKey}/toggle`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ active: activate })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            showAlert('alert-keys', activate ? 'Ключ активирован' : 'Ключ деактивирован', 'success');
            setTimeout(() => {
                loadAPIKeys();
            }, 500);
        } else {
            showAlert('alert-keys', data.error || 'Ошибка', 'error');
        }
    } catch (error) {
        console.error('Error toggling key:', error);
        showAlert('alert-keys', `Ошибка: ${error.message}`, 'error');
    }
}

// Удаление API ключа
async function deleteKey(key) {
    if (!confirm('Вы уверены, что хотите ПОЛНОСТЬЮ УДАЛИТЬ этот ключ? Это действие необратимо!')) return;

    try {
        const encodedKey = encodeURIComponent(key);
        const response = await fetch(`/api/v1/keys/${encodedKey}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            showAlert('alert-keys', 'Ключ успешно удален', 'success');
            // Небольшая задержка перед обновлением для показа сообщения
            setTimeout(() => {
                loadAPIKeys();
            }, 500);
        } else {
            showAlert('alert-keys', data.error || 'Ошибка удаления', 'error');
        }
    } catch (error) {
        console.error('Error deleting key:', error);
        showAlert('alert-keys', `Ошибка: ${error.message}`, 'error');
    }
}

// Копирование ключа
function copyKey(key) {
    // Попытка использовать современный Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(key)
            .then(() => {
                showAlert('alert-keys', '✅ Ключ скопирован в буфер обмена', 'success');
            })
            .catch(err => {
                console.error('Clipboard API failed:', err);
                // Fallback метод
                copyKeyFallback(key);
            });
    } else {
        // Fallback для старых браузеров
        copyKeyFallback(key);
    }
}

// Fallback метод копирования
function copyKeyFallback(key) {
    const textArea = document.createElement('textarea');
    textArea.value = key;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showAlert('alert-keys', '✅ Ключ скопирован в буфер обмена', 'success');
        } else {
            showAlert('alert-keys', '❌ Не удалось скопировать ключ', 'error');
        }
    } catch (err) {
        console.error('Fallback copy failed:', err);
        showAlert('alert-keys', '❌ Ошибка копирования. Скопируйте вручную: ' + key, 'error');
    }
    
    document.body.removeChild(textArea);
}

// Копирование названия модели
function copyModelName(modelName) {
    copyToClipboard(modelName, 'alert-models', `✅ Скопировано: ${modelName}`);
}

// Копирование API endpoint
function copyEndpoint(endpoint) {
    copyToClipboard(endpoint, 'alert-models', '✅ API Endpoint скопирован!');
}

// Универсальная функция копирования
function copyToClipboard(text, alertId, successMessage) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
            .then(() => {
                showAlert(alertId, successMessage, 'success');
                setTimeout(() => {
                    const alert = document.getElementById(alertId);
                    if (alert) alert.style.display = 'none';
                }, 2000);
            })
            .catch(err => {
                console.error('Clipboard API failed:', err);
                copyToClipboardFallback(text, alertId, successMessage);
            });
    } else {
        copyToClipboardFallback(text, alertId, successMessage);
    }
}

// Fallback для универсального копирования
function copyToClipboardFallback(text, alertId, successMessage) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showAlert(alertId, successMessage, 'success');
            setTimeout(() => {
                const alert = document.getElementById(alertId);
                if (alert) alert.style.display = 'none';
            }, 2000);
        } else {
            showAlert(alertId, '❌ Не удалось скопировать', 'error');
        }
    } catch (err) {
        console.error('Fallback copy failed:', err);
        showAlert(alertId, '❌ Ошибка копирования', 'error');
    }
    
    document.body.removeChild(textArea);
}

// Загрузка статуса 2FA
async function load2FAStatus() {
    try {
        const response = await fetch('/api/v1/2fa/status');
        const data = await response.json();

        const container = document.getElementById('twofa-status');

        if (data.enabled) {
            container.innerHTML = `
                <div style="display:flex;align-items:center;justify-content:space-between;padding:20px;background:#3a3a3a;border-radius:10px">
                    <div>
                        <div style="font-weight:600;margin-bottom:5px">✅ 2FA включена</div>
                        <div style="color:#999;font-size:14px">Ваш аккаунт защищен</div>
                    </div>
                    <button class="btn btn-danger" onclick="disable2FA()">Отключить</button>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div style="display:flex;align-items:center;justify-content:space-between;padding:20px;background:#3a3a3a;border-radius:10px">
                    <div>
                        <div style="font-weight:600;margin-bottom:5px">⚠️ 2FA отключена</div>
                        <div style="color:#999;font-size:14px">Рекомендуем включить для безопасности</div>
                    </div>
                    <button class="btn btn-primary" onclick="setup2FA()">Настроить</button>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading 2FA status:', error);
    }
}

// Настройка 2FA
async function setup2FA() {
    openModal('twofa-setup-modal');

    try {
        const response = await fetch('/api/v1/2fa/setup');
        const data = await response.json();

        if (data.success) {
            document.getElementById('qr-code-container').innerHTML = `<img src="${data.qrCode}" alt="QR Code">`;
            document.getElementById('manual-secret').value = data.secret;
        } else {
            showAlert('alert-2fa', data.error || 'Ошибка генерации QR кода', 'error');
        }
    } catch (error) {
        showAlert('alert-2fa', 'Ошибка сети', 'error');
    }
}

// Проверка 2FA
async function verify2FA() {
    const token = document.getElementById('verify-token').value;

    if (!token || token.length !== 6) {
        showAlert('alert-2fa', 'Введите 6-значный код', 'error');
        return;
    }

    try {
        const response = await fetch('/api/v1/2fa/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        });

        const data = await response.json();

        if (data.success) {
            showAlert('alert-2fa', '2FA активирована!', 'success');
            setTimeout(() => {
                closeModal('twofa-setup-modal');
                load2FAStatus();
            }, 1500);
        } else {
            showAlert('alert-2fa', data.error || 'Неверный код', 'error');
        }
    } catch (error) {
        showAlert('alert-2fa', 'Ошибка сети', 'error');
    }
}

// Отключение 2FA
async function disable2FA() {
    const token = prompt('Введите 6-значный код для отключения:');
    if (!token) return;

    try {
        const response = await fetch('/api/v1/2fa/disable', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        });

        const data = await response.json();

        if (data.success) {
            showAlert('alert-settings', '2FA отключена', 'success');
            load2FAStatus();
        } else {
            showAlert('alert-settings', data.error || 'Ошибка', 'error');
        }
    } catch (error) {
        showAlert('alert-settings', 'Ошибка сети', 'error');
    }
}

// Загрузка моделей с сервера
async function loadModels() {
    try {
        console.log('Loading models...');
        const response = await fetch('/api/v1/models');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Models data:', data);

        if (data.success && data.models) {
            allModels = data.models;
            const statModelsEl = document.getElementById('stat-models');
            if (statModelsEl) {
                statModelsEl.textContent = data.count || allModels.length;
            }
            renderModels();
        } else {
            console.error('Invalid models response:', data);
            // Показываем сообщение об ошибке
            const container = document.getElementById('models-container');
            if (container) {
                container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">⚠️</div><div>Ошибка загрузки моделей</div></div>';
            }
        }
    } catch (error) {
        console.error('Error loading models:', error);
        const container = document.getElementById('models-container');
        if (container) {
            container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">⚠️</div><div>Ошибка: ${error.message}</div></div>`;
        }
    }
}

// Отрисовка моделей
function renderModels() {
    const container = document.getElementById('models-container');
    
    if (!container) {
        console.error('models-container not found');
        return;
    }
    
    // Группируем по категориям
    const categories = {};
    allModels.forEach(model => {
        if (!categories[model.category]) {
            categories[model.category] = [];
        }
        categories[model.category].push(model);
    });

    let html = '<div id="alert-models" class="alert"></div>';
    
    // Добавляем API endpoint
    const apiEndpoint = `${window.location.protocol}//${window.location.host}/api/v1/ai/chat/completions`;
    html += `
        <div style="margin-bottom:30px;padding:20px;background:#3a3a3a;border-radius:10px">
            <h3 style="margin-bottom:10px">🔗 API Endpoint</h3>
            <p style="color:#999;margin-bottom:10px">Используйте этот URL для обращения к AI:</p>
            <div style="display:flex;gap:10px;align-items:center;margin-bottom:15px">
                <code style="flex:1;padding:12px;background:#1a1a1a;border-radius:8px;color:#667eea;font-size:14px">${apiEndpoint}</code>
                <button onclick="copyEndpoint('${apiEndpoint}')" class="btn btn-secondary">📋 Копировать</button>
            </div>
            <p style="color:#999;font-size:13px;margin-bottom:15px">
                💡 Совместимо с OpenAI API - используйте в любом приложении, поддерживающем OpenAI формат
            </p>
        </div>
    `;
    
    // Добавляем ссылку на документацию
    html += `
        <div style="margin-bottom:30px;padding:20px;background:#3a3a3a;border-radius:10px">
            <h3 style="margin-bottom:10px">📚 Документация</h3>
            <p style="color:#999;margin-bottom:15px">Полная документация по использованию API</p>
            <a href="/api-docs" target="_blank" class="btn btn-primary" style="margin-right:10px">Открыть документацию</a>
            <a href="https://github.com/Belnsah3/Be1lnash3/blob/main/FUNCTION_CALLING_GUIDE.md" target="_blank" class="btn btn-secondary">🔧 Function Calling Guide</a>
        </div>
    `;
    
    // Добавляем легенду
    html += `
        <div style="margin-bottom:30px;padding:15px;background:#2a2a2a;border:1px solid #3a3a3a;border-radius:10px">
            <div style="display:flex;gap:20px;align-items:center">
                <span style="color:#999">Легенда:</span>
                <span style="display:flex;align-items:center;gap:5px">
                    <span style="color:#4ade80">🔧</span>
                    <span style="color:#999;font-size:13px">Поддержка Function Calling (Tools)</span>
                </span>
            </div>
        </div>
    `;

    // Отрисовываем модели по категориям
    Object.keys(categories).sort().forEach(category => {
        html += `
            <div style="margin-bottom:30px">
                <h3 style="margin-bottom:15px;color:#667eea">${category}</h3>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Название модели</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        categories[category].forEach(model => {
            const toolsIcon = model.supportsTools ? '<span title="Поддерживает Function Calling" style="color:#4ade80;margin-left:8px">🔧</span>' : '';
            html += `
                <tr>
                    <td>
                        <code class="key-value">${model.name}</code>
                        ${toolsIcon}
                    </td>
                    <td>
                        <button onclick="copyModelName('${model.name}')" class="btn btn-secondary" style="padding:8px 16px;font-size:12px">
                            📋 Копировать
                        </button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table></div>';
    });

    container.innerHTML = html;
}

// Переключение табов
function switchTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');

    document.getElementById('chats-section').style.display = tab === 'chats' ? 'block' : 'none';
    document.getElementById('keys-section').style.display = tab === 'keys' ? 'block' : 'none';
    document.getElementById('models-section').style.display = tab === 'models' ? 'block' : 'none';
    document.getElementById('settings-section').style.display = tab === 'settings' ? 'block' : 'none';
    
    const adminSection = document.getElementById('admin-section');
    if (adminSection) {
        adminSection.style.display = tab === 'admin' ? 'block' : 'none';
    }
}

// Модальные окна
function openModal(id) {
    document.getElementById(id).classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

function openCreateKeyModal() {
    openModal('create-key-modal');
    document.getElementById('key-name').value = '';
    document.getElementById('key-limit').value = '1000';
}

// Алерты
function showAlert(id, msg, type) {
    const alert = document.getElementById(id);
    if (!alert) return;
    alert.textContent = msg;
    alert.className = `alert ${type}`;
    alert.style.display = 'block';
    setTimeout(() => alert.style.display = 'none', 3000);
}

// Выход
function logout() {
    fetch('/api/v1/auth/logout', { method: 'POST' })
        .then(() => window.location.href = '/login');
}

// АДМИН-ПАНЕЛЬ (только для супер-админа)
async function loadAdminPanel() {
    // Добавляем таб
    const tab = document.createElement('button');
    tab.className = 'tab';
    tab.textContent = 'Управление';
    tab.onclick = () => switchTab('admin');
    document.querySelector('.tabs').appendChild(tab);

    // Добавляем секцию
    const section = document.createElement('div');
    section.id = 'admin-section';
    section.className = 'section';
    section.style.display = 'none';
    section.innerHTML = `
        <div class="section-header">
            <h2 class="section-title">Управление пользователями</h2>
        </div>
        <div id="alert-admin" class="alert"></div>
        <div id="users-container">
            <div class="empty-state"><div>Загрузка...</div></div>
        </div>
    `;
    document.querySelector('.container').appendChild(section);

    loadUsers();
}

async function loadUsers() {
    try {
        const response = await fetch('/api/v1/admin/users');
        const data = await response.json();

        if (data.success) {
            renderUsers(data.users);
        } else {
            showAlert('alert-admin', data.error || 'Ошибка загрузки', 'error');
        }
    } catch (error) {
        showAlert('alert-admin', 'Ошибка сети', 'error');
    }
}

function renderUsers(users) {
    const container = document.getElementById('users-container');
    let html = `
        <table class="table">
            <thead>
                <tr>
                    <th>Имя</th>
                    <th>Email</th>
                    <th>Роль</th>
                    <th>Лимит</th>
                    <th>Использовано</th>
                    <th>Действия</th>
                </tr>
            </thead>
            <tbody>
    `;

    users.forEach(u => {
        const isSuperAdmin = u.is_super_admin;
        const canEdit = !isSuperAdmin;
        const isUser = u.role === 'user';

        html += `
            <tr>
                <td>
                    <span class="key-name">${u.name}</span>
                    ${isSuperAdmin ? ' <span class="badge">SUPER</span>' : ''}
                </td>
                <td>${u.email}</td>
                <td><span class="status ${u.role === 'admin' ? 'status-active' : ''}">${u.role}</span></td>
                <td>
                    ${u.role === 'admin' || isSuperAdmin ? '∞' : `
                        <span id="limit-${u.id}">${u.weekly_limit}</span>
                        ${canEdit && isUser ? `<button onclick="editLimit(${u.id}, ${u.weekly_limit})" style="background:none;border:none;color:#667eea;cursor:pointer;margin-left:5px">✏️</button>` : ''}
                    `}
                </td>
                <td>
                    ${u.weekly_used || 0}
                    ${canEdit && isUser && u.weekly_used > 0 ? `<button onclick="resetLimit(${u.id})" style="background:none;border:none;color:#4ade80;cursor:pointer;margin-left:5px" title="Сбросить">🔄</button>` : ''}
                </td>
                <td>
                    ${canEdit ? `
                        <button class="btn btn-${u.role === 'admin' ? 'secondary' : 'primary'}" 
                                onclick="toggleUserRole(${u.id}, '${u.role}')" 
                                style="padding:8px 16px;font-size:12px">
                            ${u.role === 'admin' ? 'Сделать User' : 'Сделать Admin'}
                        </button>
                    ` : '<span style="color:#666">-</span>'}
                </td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

async function toggleUserRole(userId, currentRole) {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    
    if (!confirm(`Изменить роль на ${newRole}?`)) return;

    try {
        const response = await fetch(`/api/v1/admin/users/${userId}/role`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: newRole })
        });

        const data = await response.json();

        if (data.success) {
            showAlert('alert-admin', `Роль изменена на ${newRole}`, 'success');
            loadUsers();
        } else {
            showAlert('alert-admin', data.error || 'Ошибка', 'error');
        }
    } catch (error) {
        showAlert('alert-admin', 'Ошибка сети', 'error');
    }
}

async function editLimit(userId, currentLimit) {
    const newLimit = prompt(`Введите новый недельный лимит для пользователя:`, currentLimit);
    
    if (!newLimit || isNaN(newLimit) || newLimit < 0) return;

    try {
        const response = await fetch(`/api/v1/admin/users/${userId}/limit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ limit: parseInt(newLimit) })
        });

        const data = await response.json();

        if (data.success) {
            showAlert('alert-admin', `Лимит изменен на ${newLimit}`, 'success');
            loadUsers();
        } else {
            showAlert('alert-admin', data.error || 'Ошибка', 'error');
        }
    } catch (error) {
        showAlert('alert-admin', 'Ошибка сети', 'error');
    }
}

async function resetLimit(userId) {
    if (!confirm('Сбросить использованный лимит для этого пользователя?')) return;

    try {
        const response = await fetch(`/api/v1/admin/users/${userId}/reset-limit`, {
            method: 'POST'
        });

        const data = await response.json();

        if (data.success) {
            showAlert('alert-admin', 'Лимит сброшен', 'success');
            loadUsers();
        } else {
            showAlert('alert-admin', data.error || 'Ошибка', 'error');
        }
    } catch (error) {
        showAlert('alert-admin', 'Ошибка сети', 'error');
    }
}

// Запуск при загрузке страницы
loadUserData();
