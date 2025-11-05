#!/usr/bin/env python3
"""
LumeAI - Автоматическая установка и запуск на Ubuntu
Этот скрипт устанавливает все зависимости и запускает сервер
"""

import os
import sys
import subprocess
import platform

# Цвета для вывода
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_header(text):
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{text.center(60)}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}\n")

def print_success(text):
    print(f"{Colors.OKGREEN}✅ {text}{Colors.ENDC}")

def print_error(text):
    print(f"{Colors.FAIL}❌ {text}{Colors.ENDC}")

def print_info(text):
    print(f"{Colors.OKCYAN}ℹ️  {text}{Colors.ENDC}")

def print_warning(text):
    print(f"{Colors.WARNING}⚠️  {text}{Colors.ENDC}")

def run_command(command, description, check=True):
    """Выполнить команду с описанием"""
    print_info(f"{description}...")
    try:
        result = subprocess.run(
            command,
            shell=True,
            check=check,
            capture_output=True,
            text=True
        )
        if result.returncode == 0:
            print_success(f"{description} - успешно")
            return True
        else:
            if check:
                print_error(f"{description} - ошибка")
                print(result.stderr)
                return False
            return True
    except subprocess.CalledProcessError as e:
        print_error(f"{description} - ошибка")
        print(e.stderr)
        return False

def check_system():
    """Проверка системы"""
    print_header("Проверка системы")
    
    # Проверка ОС
    if platform.system() != "Linux":
        print_error("Этот скрипт предназначен для Ubuntu/Linux")
        sys.exit(1)
    
    print_success(f"ОС: {platform.system()} {platform.release()}")
    
    # Проверка прав
    if os.geteuid() == 0:
        print_warning("Запущено от root. Рекомендуется запускать от обычного пользователя")
    
    # Установка базовых пакетов для компиляции
    print_info("Установка базовых пакетов...")
    run_command(
        "sudo apt-get update -qq && sudo apt-get install -y build-essential python3 python3-pip make g++",
        "Установка build-essential и python3",
        check=False
    )
    
    return True

def install_nodejs():
    """Установка Node.js"""
    print_header("Установка Node.js")
    
    # Проверка наличия Node.js
    result = subprocess.run("node --version", shell=True, capture_output=True)
    if result.returncode == 0:
        version = result.stdout.decode().strip()
        print_success(f"Node.js уже установлен: {version}")
        return True
    
    print_info("Node.js не найден. Устанавливаем...")
    
    # Установка Node.js 20.x
    commands = [
        ("curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -", 
         "Добавление репозитория NodeSource"),
        ("sudo apt-get install -y nodejs", 
         "Установка Node.js"),
    ]
    
    for cmd, desc in commands:
        if not run_command(cmd, desc):
            return False
    
    # Проверка установки
    result = subprocess.run("node --version", shell=True, capture_output=True)
    if result.returncode == 0:
        version = result.stdout.decode().strip()
        print_success(f"Node.js установлен: {version}")
        return True
    else:
        print_error("Не удалось установить Node.js")
        return False

def install_dependencies():
    """Установка зависимостей проекта"""
    print_header("Установка зависимостей проекта")
    
    # Проверка наличия package.json
    if not os.path.exists("package.json"):
        print_error("package.json не найден. Убедитесь, что вы в корне проекта")
        return False
    
    # Установка npm зависимостей
    if not run_command("npm install", "Установка npm зависимостей"):
        return False
    
    # Пересборка native модулей
    if not run_command("npm rebuild", "Пересборка native модулей"):
        return False
    
    print_success("Все зависимости установлены")
    return True

def setup_database():
    """Настройка базы данных"""
    print_header("Настройка базы данных")
    
    # Создание директории data если её нет
    if not os.path.exists("data"):
        os.makedirs("data")
        print_success("Создана директория data/")
    
    # Проверка наличия БД
    if os.path.exists("data/api.db"):
        print_info("База данных уже существует")
        response = input("Пересоздать базу данных? (y/N): ").lower()
        if response == 'y':
            os.remove("data/api.db")
            print_success("Старая база данных удалена")
    
    print_success("База данных будет создана при первом запуске")
    return True

def setup_environment():
    """Настройка переменных окружения"""
    print_header("Настройка переменных окружения")
    
    # Создание .env если его нет
    if not os.path.exists(".env"):
        env_content = """# LumeAI Environment Variables
PORT=3000
NODE_ENV=production
SESSION_SECRET=your-secret-key-change-this-in-production
"""
        with open(".env", "w") as f:
            f.write(env_content)
        print_success("Создан файл .env")
    else:
        print_info("Файл .env уже существует")
    
    return True

def setup_systemd_service():
    """Создание systemd сервиса"""
    print_header("Настройка systemd сервиса (опционально)")
    
    response = input("Создать systemd сервис для автозапуска? (y/N): ").lower()
    if response != 'y':
        print_info("Пропускаем создание systemd сервиса")
        return True
    
    current_dir = os.getcwd()
    user = os.getenv("USER")
    
    service_content = f"""[Unit]
Description=LumeAI API Service
After=network.target

[Service]
Type=simple
User={user}
WorkingDirectory={current_dir}
ExecStart=/usr/bin/node {current_dir}/src/server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
"""
    
    service_file = "/tmp/lumeai.service"
    with open(service_file, "w") as f:
        f.write(service_content)
    
    print_info("Создан файл сервиса. Для установки выполните:")
    print(f"{Colors.OKCYAN}sudo cp {service_file} /etc/systemd/system/lumeai.service{Colors.ENDC}")
    print(f"{Colors.OKCYAN}sudo systemctl daemon-reload{Colors.ENDC}")
    print(f"{Colors.OKCYAN}sudo systemctl enable lumeai{Colors.ENDC}")
    print(f"{Colors.OKCYAN}sudo systemctl start lumeai{Colors.ENDC}")
    
    return True

def setup_nginx():
    """Настройка Nginx (опционально)"""
    print_header("Настройка Nginx (опционально)")
    
    response = input("Создать конфигурацию Nginx? (y/N): ").lower()
    if response != 'y':
        print_info("Пропускаем настройку Nginx")
        return True
    
    domain = input("Введите домен (например, api.example.com): ").strip()
    if not domain:
        print_warning("Домен не указан, пропускаем")
        return True
    
    nginx_config = f"""server {{
    listen 80;
    server_name {domain};

    location / {{
        proxy_pass https://lumeai.ru;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }}
}}
"""
    
    config_file = f"/tmp/lumeai-{domain}.conf"
    with open(config_file, "w") as f:
        f.write(nginx_config)
    
    print_success(f"Создан файл конфигурации: {config_file}")
    print_info("Для установки выполните:")
    print(f"{Colors.OKCYAN}sudo cp {config_file} /etc/nginx/sites-available/lumeai{Colors.ENDC}")
    print(f"{Colors.OKCYAN}sudo ln -s /etc/nginx/sites-available/lumeai /etc/nginx/sites-enabled/{Colors.ENDC}")
    print(f"{Colors.OKCYAN}sudo nginx -t{Colors.ENDC}")
    print(f"{Colors.OKCYAN}sudo systemctl reload nginx{Colors.ENDC}")
    
    return True

def start_server():
    """Запуск сервера"""
    print_header("Запуск сервера")
    
    print_info("Запускаем LumeAI сервер...")
    print_warning("Для остановки нажмите Ctrl+C")
    print()
    
    try:
        subprocess.run("npm start", shell=True)
    except KeyboardInterrupt:
        print()
        print_info("Сервер остановлен")
    
    return True

def main():
    """Главная функция"""
    print_header("🚀 LumeAI - Установка на Ubuntu")
    
    # Проверка системы
    if not check_system():
        sys.exit(1)
    
    # Установка Node.js
    if not install_nodejs():
        print_error("Не удалось установить Node.js")
        sys.exit(1)
    
    # Установка зависимостей
    if not install_dependencies():
        print_error("Не удалось установить зависимости")
        sys.exit(1)
    
    # Настройка БД
    if not setup_database():
        print_error("Не удалось настроить базу данных")
        sys.exit(1)
    
    # Настройка окружения
    if not setup_environment():
        print_error("Не удалось настроить окружение")
        sys.exit(1)
    
    # Опциональные настройки
    setup_systemd_service()
    setup_nginx()
    
    # Финальная информация
    print_header("✅ Установка завершена!")
    
    print_info("Учетные данные:")
    print(f"{Colors.OKGREEN}Супер-админ:{Colors.ENDC}")
    print(f"  Username: Be1lnash3")
    print(f"  Password: Zaza_0203!")
    print()
    print(f"{Colors.OKGREEN}Обычный пользователь:{Colors.ENDC}")
    print(f"  Username: Be1lnash")
    print(f"  Password: Zaza_0203!")
    print()
    
    # Запуск сервера
    response = input("Запустить сервер сейчас? (Y/n): ").lower()
    if response != 'n':
        start_server()
    else:
        print_info("Для запуска сервера выполните: npm start")
        print_info("Или используйте: python3 setup_ubuntu.py --start")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--start":
        start_server()
    else:
        main()
