// 🎨 LumeAI - Многошаговая регистрация

const steps = ['account', 'email', 'profile', 'password', 'avatar'];
let currentStep = 0;
let formData = {
    avatar_color: 'avatar-color-1'
};

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    initAvatarSelector();
    updateAvatarPreview();
});

// Следующий шаг
function nextStep() {
    if (validateCurrentStep()) {
        saveStepData();
        
        if (currentStep < steps.length - 1) {
            currentStep++;
            updateUI();
        } else {
            submitRegistration();
        }
    }
}

// Предыдущий шаг
function prevStep() {
    if (currentStep > 0) {
        currentStep--;
        updateUI();
    }
}

// Обновление UI
function updateUI() {
    // Скрыть все шаги
    document.querySelectorAll('.step-content').forEach(el => {
        el.classList.add('hidden');
    });
    
    // Показать текущий шаг
    document.getElementById(`step-${steps[currentStep]}`).classList.remove('hidden');
    
    // Обновить прогресс-бар
    const progress = ((currentStep + 1) / steps.length) * 100;
    document.getElementById('progress-fill').style.width = `${progress}%`;
    
    // Обновить индикаторы шагов
    updateStepIndicators();
    
    // Обновить кнопки
    updateButtons();
}

// Обновление индикаторов шагов
function updateStepIndicators() {
    for (let i = 0; i < steps.length; i++) {
        const indicator = document.getElementById(`step-indicator-${i}`);
        
        if (i < currentStep) {
            indicator.classList.add('completed');
            indicator.classList.remove('active');
        } else if (i === currentStep) {
            indicator.classList.add('active');
            indicator.classList.remove('completed');
        } else {
            indicator.classList.remove('active', 'completed');
        }
    }
}

// Обновление кнопок
function updateButtons() {
    const btnBack = document.getElementById('btn-back');
    const btnNext = document.getElementById('btn-next');
    const btnNextText = document.getElementById('btn-next-text');
    
    // Кнопка "Назад"
    btnBack.disabled = currentStep === 0;
    
    // Кнопка "Продолжить" / "Создать аккаунт"
    if (currentStep === steps.length - 1) {
        btnNextText.textContent = 'Создать аккаунт';
    } else {
        btnNextText.textContent = 'Продолжить';
    }
}

// Валидация текущего шага
function validateCurrentStep() {
    const step = steps[currentStep];
    
    switch(step) {
        case 'account':
            const username = document.getElementById('username').value.trim();
            if (!username) {
                showError('Введите имя пользователя');
                return false;
            }
            if (username.length < 3) {
                showError('Имя пользователя должно быть не менее 3 символов');
                return false;
            }
            if (!/^[a-zA-Z0-9_]+$/.test(username)) {
                showError('Имя пользователя может содержать только буквы, цифры и _');
                return false;
            }
            break;
            
        case 'email':
            const email = document.getElementById('email').value.trim();
            if (!email) {
                showError('Введите email');
                return false;
            }
            if (!isValidEmail(email)) {
                showError('Введите корректный email адрес');
                return false;
            }
            break;
            
        case 'profile':
            const name = document.getElementById('name').value.trim();
            if (!name) {
                showError('Введите ваше имя');
                return false;
            }
            break;
            
        case 'password':
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            if (!password) {
                showError('Введите пароль');
                return false;
            }
            if (password.length < 6) {
                showError('Пароль должен быть не менее 6 символов');
                return false;
            }
            if (password !== confirmPassword) {
                showError('Пароли не совпадают');
                return false;
            }
            break;
            
        case 'avatar':
            if (!formData.avatar_color) {
                showError('Выберите цвет аватара');
                return false;
            }
            const terms = document.getElementById('terms').checked;
            if (!terms) {
                showError('Необходимо принять условия использования');
                return false;
            }
            break;
    }
    
    hideError();
    return true;
}

// Сохранение данных шага
function saveStepData() {
    const step = steps[currentStep];
    
    switch(step) {
        case 'account':
            formData.username = document.getElementById('username').value.trim();
            break;
        case 'email':
            formData.email = document.getElementById('email').value.trim();
            break;
        case 'profile':
            formData.name = document.getElementById('name').value.trim();
            formData.bio = document.getElementById('bio').value.trim();
            break;
        case 'password':
            formData.password = document.getElementById('password').value;
            break;
    }
}

// Отправка регистрации
async function submitRegistration() {
    const btnNext = document.getElementById('btn-next');
    const btnNextText = document.getElementById('btn-next-text');
    const btnNextLoader = document.getElementById('btn-next-loader');
    
    // Показать лоадер
    btnNext.disabled = true;
    btnNextText.classList.add('hidden');
    btnNextLoader.classList.remove('hidden');
    
    try {
        const response = await fetch('/api/v1/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess('✅ Регистрация успешна! Перенаправление...');
            setTimeout(() => {
                window.location.href = '/login';
            }, 1500);
        } else {
            showError(data.error || 'Ошибка регистрации');
            btnNext.disabled = false;
            btnNextText.classList.remove('hidden');
            btnNextLoader.classList.add('hidden');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showError('Ошибка сети. Проверьте подключение.');
        btnNext.disabled = false;
        btnNextText.classList.remove('hidden');
        btnNextLoader.classList.add('hidden');
    }
}

// Инициализация выбора аватара
function initAvatarSelector() {
    const avatarOptions = document.querySelectorAll('.avatar-option');
    
    // Выбрать первый по умолчанию
    avatarOptions[0].classList.add('selected');
    
    avatarOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Убрать выделение со всех
            avatarOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Выделить выбранный
            option.classList.add('selected');
            
            // Сохранить цвет
            formData.avatar_color = option.dataset.color;
            
            // Обновить превью
            updateAvatarPreview();
        });
    });
}

// Обновление превью аватара
function updateAvatarPreview() {
    const preview = document.getElementById('avatar-preview');
    const letter = document.getElementById('avatar-letter');
    
    // Убрать все классы цветов
    preview.className = '';
    
    // Добавить выбранный цвет
    preview.classList.add(formData.avatar_color);
    
    // Обновить букву
    const username = document.getElementById('username')?.value || 'U';
    letter.textContent = username.charAt(0).toUpperCase();
}

// Обновление буквы при вводе username
document.addEventListener('DOMContentLoaded', () => {
    const usernameInput = document.getElementById('username');
    if (usernameInput) {
        usernameInput.addEventListener('input', () => {
            if (currentStep === 4) { // Если на шаге аватара
                updateAvatarPreview();
            }
        });
    }
});

// Валидация email
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Показать ошибку
function showError(message) {
    const alert = document.getElementById('alert');
    alert.textContent = message;
    alert.className = 'alert alert-error';
    alert.style.display = 'flex';
    
    // Прокрутить к алерту
    alert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Показать успех
function showSuccess(message) {
    const alert = document.getElementById('alert');
    alert.textContent = message;
    alert.className = 'alert alert-success';
    alert.style.display = 'flex';
}

// Скрыть ошибку
function hideError() {
    const alert = document.getElementById('alert');
    alert.classList.add('hidden');
}

// Enter для перехода на следующий шаг
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        nextStep();
    }
});
