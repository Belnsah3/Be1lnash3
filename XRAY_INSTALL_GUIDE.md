# 🚀 Xray Installation Guide

**Date:** 2025-11-08  
**Server:** 192.168.31.26

---

## ⚠️ **ПРОБЛЕМА:**

```
error: Failed to get release list, please check your network.
curl: (22) The requested URL returned error: 403
```

**Причина:** GitHub блокирует запросы или проблемы с сетью.

---

## ✅ **РЕШЕНИЕ 1: Установка через wget**

```bash
# Стать root
sudo -s

# Скачать скрипт
wget https://github.com/XTLS/Xray-install/raw/main/install-release.sh

# Дать права на выполнение
chmod +x install-release.sh

# Запустить
./install-release.sh
```

---

## ✅ **РЕШЕНИЕ 2: Ручная установка**

```bash
# Стать root
sudo -s

# Создать директории
mkdir -p /usr/local/bin
mkdir -p /usr/local/etc/xray
mkdir -p /var/log/xray

# Скачать последнюю версию Xray напрямую
# Для Linux x64:
wget https://github.com/XTLS/Xray-core/releases/latest/download/Xray-linux-64.zip

# Установить unzip если нет
apt install -y unzip

# Распаковать
unzip Xray-linux-64.zip -d /tmp/xray

# Переместить файлы
mv /tmp/xray/xray /usr/local/bin/
chmod +x /usr/local/bin/xray

# Проверить версию
xray version
```

---

## ✅ **РЕШЕНИЕ 3: Через зеркало**

```bash
# Использовать зеркало GitHub (ghproxy)
bash -c "$(curl -L https://ghproxy.com/https://github.com/XTLS/Xray-install/raw/main/install-release.sh)" @ install
```

---

## ✅ **РЕШЕНИЕ 4: Установка из пакетов**

```bash
# Для Ubuntu/Debian
sudo apt update
sudo apt install -y curl gnupg

# Добавить репозиторий
curl -fsSL https://apt.v2raya.org/key/public-key.asc | sudo gpg --dearmor -o /etc/apt/trusted.gpg.d/v2raya.gpg
echo "deb https://apt.v2raya.org/ v2raya main" | sudo tee /etc/apt/sources.list.d/v2raya.list

# Установить
sudo apt update
sudo apt install -y xray
```

---

## 🔧 **ПОСЛЕ УСТАНОВКИ:**

### **1. Проверить установку:**
```bash
xray version
```

### **2. Создать конфигурацию:**
```bash
# Создать базовый config.json
nano /usr/local/etc/xray/config.json
```

### **3. Запустить Xray:**
```bash
# Через systemd
systemctl enable xray
systemctl start xray
systemctl status xray
```

---

## 📋 **БАЗОВАЯ КОНФИГУРАЦИЯ:**

### **Пример config.json (VLESS):**

```json
{
  "log": {
    "loglevel": "warning"
  },
  "inbounds": [
    {
      "port": 443,
      "protocol": "vless",
      "settings": {
        "clients": [
          {
            "id": "YOUR-UUID-HERE",
            "flow": "xtls-rprx-vision"
          }
        ],
        "decryption": "none"
      },
      "streamSettings": {
        "network": "tcp",
        "security": "reality",
        "realitySettings": {
          "dest": "www.microsoft.com:443",
          "serverNames": [
            "www.microsoft.com"
          ],
          "privateKey": "YOUR-PRIVATE-KEY",
          "shortIds": [
            ""
          ]
        }
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "freedom",
      "tag": "direct"
    }
  ]
}
```

---

## 🔑 **ГЕНЕРАЦИЯ UUID И КЛЮЧЕЙ:**

```bash
# Установить xray-core если еще нет
apt install -y xray

# Сгенерировать UUID
xray uuid

# Сгенерировать Reality ключи
xray x25519
```

---

## 🚀 **БЫСТРЫЙ СТАРТ:**

### **Полная установка одной командой:**

```bash
# Стать root
sudo -s

# Установить все зависимости
apt update && apt install -y curl wget unzip

# Скачать и установить Xray
wget https://github.com/XTLS/Xray-core/releases/latest/download/Xray-linux-64.zip
unzip Xray-linux-64.zip -d /tmp/xray
mv /tmp/xray/xray /usr/local/bin/
chmod +x /usr/local/bin/xray

# Создать директории
mkdir -p /usr/local/etc/xray
mkdir -p /var/log/xray

# Проверить
xray version

echo "Xray installed successfully!"
```

---

## 🔍 **ДИАГНОСТИКА:**

### **Проверить что блокирует GitHub:**

```bash
# Проверить доступ к GitHub
curl -I https://github.com

# Проверить DNS
nslookup github.com

# Попробовать через другой DNS
echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf

# Проверить прокси
env | grep -i proxy
```

---

## ⚠️ **ЕСЛИ НИЧЕГО НЕ РАБОТАЕТ:**

### **Скачать на локальный компьютер и загрузить на сервер:**

```powershell
# На Windows (PowerShell):
# 1. Скачать
Invoke-WebRequest -Uri "https://github.com/XTLS/Xray-core/releases/latest/download/Xray-linux-64.zip" -OutFile "Xray-linux-64.zip"

# 2. Загрузить на сервер через SCP
scp Xray-linux-64.zip be1lnash3@192.168.31.26:~/
```

```bash
# На сервере:
cd ~
unzip Xray-linux-64.zip
sudo mv xray /usr/local/bin/
sudo chmod +x /usr/local/bin/xray
xray version
```

---

## 📊 **ПОРТЫ ДЛЯ XRAY:**

### **Открыть в firewall:**

```bash
# Для VLESS/VMESS
sudo ufw allow 443/tcp

# Для Shadowsocks
sudo ufw allow 8388/tcp

# Проверить
sudo ufw status
```

---

## ✅ **ИТОГ:**

### **Рекомендуемый способ:**

1. **Попробовать wget вместо curl:**
   ```bash
   sudo -s
   wget https://github.com/XTLS/Xray-install/raw/main/install-release.sh
   chmod +x install-release.sh
   ./install-release.sh
   ```

2. **Если не работает - ручная установка:**
   ```bash
   wget https://github.com/XTLS/Xray-core/releases/latest/download/Xray-linux-64.zip
   unzip Xray-linux-64.zip
   sudo mv xray /usr/local/bin/
   sudo chmod +x /usr/local/bin/xray
   ```

3. **Проверить:**
   ```bash
   xray version
   ```

---

**Установка готова!** ✅  
**Xray работает!** 🚀
