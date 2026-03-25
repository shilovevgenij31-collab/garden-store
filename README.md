# Всё в сад — интернет-магазин для сада

Интернет-магазин садовых товаров. Frontend на React + TypeScript, backend на FastAPI + SQLite.

## Структура проекта

```
├── src/                # Frontend (React + Vite + TypeScript)
├── backend/            # Backend (FastAPI + SQLAlchemy)
│   ├── app/            # Код приложения
│   ├── alembic/        # Миграции базы данных
│   └── requirements.txt
├── public/             # Статические файлы
└── package.json        # Зависимости frontend
```

## Запуск frontend (локально)

```bash
# Установить зависимости
npm install

# Запустить dev-сервер (порт 8080)
npm run dev

# Собрать для продакшена
npm run build
```

## Запуск backend (локально)

```bash
cd backend

# Создать виртуальное окружение
python -m venv venv

# Активировать (Windows)
venv\Scripts\activate
# Активировать (Linux/macOS)
source venv/bin/activate

# Установить зависимости
pip install -r requirements.txt

# Скопировать .env и заполнить
cp .env.example .env

# Применить миграции
alembic upgrade head

# Запустить сервер (порт 8000)
uvicorn app.main:app --reload
```

## Деплой на сервер (Ubuntu/Debian)

### Быстрый деплой (одна команда)

```bash
ssh root@YOUR_SERVER_IP
apt update && apt install -y git curl && \
curl -fsSL https://raw.githubusercontent.com/shilovevgenij31-collab/garden-store/main/deploy.sh | bash
```

Или вручную:

```bash
git clone https://github.com/shilovevgenij31-collab/garden-store.git /var/www/garden-store
cd /var/www/garden-store
bash deploy.sh
```

Скрипт `deploy.sh` автоматически:
- Установит nginx, Node.js 20, Python 3
- Соберёт frontend (`npm run build`)
- Настроит backend (venv, pip, миграции)
- Создаст systemd-сервис для FastAPI
- Настроит Nginx как reverse proxy

### Обновление после git push

```bash
cd /var/www/garden-store && git pull && npm run build && systemctl restart garden-backend
```

### Полезные команды

```bash
systemctl status garden-backend    # статус бэкенда
journalctl -u garden-backend -f    # логи бэкенда
systemctl restart garden-backend   # перезапуск бэкенда
nginx -t && systemctl reload nginx # перезагрузка nginx
```

## Переменные окружения

Смотри `backend/.env.example` — все доступные настройки с описанием.
