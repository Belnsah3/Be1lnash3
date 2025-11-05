#!/usr/bin/env python3
"""
Скрипт для замены localhost на IP сервера во всех файлах
"""

import os
import re

SERVER_IP = "lumeai.ru"

# Список файлов для обновления
FILES = [
    "README.md",
    "API_ENDPOINTS.md",
    "KILO_CODE_SETUP.md",
    "QUICK_START.md",
    "UBUNTU_INSTALL.md",
    "SWAGGER_DOCS.md",
    "FIX_SQLITE_ERROR.md",
    "install.sh",
    "setup_ubuntu.py",
    "test-mock.js",
    "src/config/swagger.js",
    "src/routes/endpoints.js"
]

def update_file(filepath):
    """Обновляет localhost на IP в файле"""
    if not os.path.exists(filepath):
        return False
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Замена localhost и 127.0.0.1 на IP
        content = content.replace('localhost', SERVER_IP)
        content = content.replace('127.0.0.1', SERVER_IP)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        return True
    except Exception as e:
        print(f"❌ Ошибка при обновлении {filepath}: {e}")
        return False

def main():
    print(f"🔄 Обновление IP адреса на {SERVER_IP}...")
    print()
    
    updated = 0
    for filepath in FILES:
        if update_file(filepath):
            print(f"📝 Обновлен: {filepath}")
            updated += 1
    
    print()
    print(f"✅ Готово! Обновлено файлов: {updated}")
    print()
    print(f"🌐 Теперь используй:")
    print(f"   http://{SERVER_IP}:3000")

if __name__ == "__main__":
    main()
