// 🎨 LumeAI - Новый логин

let passwordVisible = false;

// Обработка формы логина
async function handleLogin(event) {
    event.preventDefault();
    
    const loginBtn = document.getElementById('login-btn');
    const btnText = document.getElementById('btn-text');
    const btnLoader = document.getElementById('btn-loader');
    
    // Получить данные
    const login = document.getElementById('login').value.trim();
    const password = document.getElementById('password').value;
    const twofa = document.getElementById('twofa').value.trim();
    const remember = document.getElementById('remember').checked;
    
    // Валидация
    if (!login) {
        showError('Введите email или username');
        return;
    }
    
    if (!password) {
        showError('Введите пароль');
        return;
    }
    
    // Показать лоадер
    loginBtn.disabled = true;
    btnText.classList.add('hidden');
    btnLoader.classList.remove('hidden');
    
    try {
        const requestBody = {
            login: login,
            password: password
        };
        
        if (twofa) {
            requestBody.twoFAToken = twofa;
        }
        
        const response = await fetch('/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess('✅ Вход выполнен! Перенаправление...');
            
            // Сохранить в localStorage если "Запомнить меня"
            if (remember) {
                localStorage.setItem('remember_login', login);
            } else {
                localStorage.removeItem('remember_login');
            }
            
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1000);
            
        } else if (data.requires2FA) {
            // Показать поле 2FA
            document.getElementById('twofa-group').classList.remove('hidden');
            document.getElementById('twofa').focus();
            showError('Введите 2FA код из приложения');
            
            loginBtn.disabled = false;
            btnText.classList.remove('hidden');
            btnLoader.classList.add('hidden');
            
        } else {
            showError(data.error || 'Неверный логин или пароль');
            
            loginBtn.disabled = false;
            btnText.classList.remove('hidden');
            btnLoader.classList.add('hidden');
        }
        
    } catch (error) {
        console.error('Login error:', error);
        showError('Ошибка сети. Проверьте подключение.');
        
        loginBtn.disabled = false;
        btnText.classList.remove('hidden');
        btnLoader.classList.add('hidden');
    }
}

// Переключение видимости пароля
function togglePassword() {
    const passwordInput = document.getElementById('password');
    passwordVisible = !passwordVisible;
    
    if (passwordVisible) {
        passwordInput.type = 'text';
    } else {
        passwordInput.type = 'password';
    }
}

// Показать ошибку
function showError(message) {
    const alert = document.getElementById('alert');
    alert.textContent = message;
    alert.className = 'alert alert-error';
    alert.style.display = 'flex';
}

// Показать успех
function showSuccess(message) {
    const alert = document.getElementById('alert');
    alert.textContent = message;
    alert.className = 'alert alert-success';
    alert.style.display = 'flex';
}

// Скрыть алерт
function hideAlert() {
    const alert = document.getElementById('alert');
    alert.classList.add('hidden');
}

// Переключение темы (заглушка)
function toggleTheme() {
    // TODO: Реализовать переключение светлой/темной темы
    alert('Переключение темы будет доступно в следующей версии');
}

// Загрузка сохраненного логина
document.addEventListener('DOMContentLoaded', () => {
    const savedLogin = localStorage.getItem('remember_login');
    if (savedLogin) {
        document.getElementById('login').value = savedLogin;
        document.getElementById('remember').checked = true;
        document.getElementById('password').focus();
    }
});

// Enter для отправки формы
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        const form = document.querySelector('form');
        if (form) {
            form.dispatchEvent(new Event('submit'));
        }
    }
});
