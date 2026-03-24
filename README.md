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

## Деплой на сервер

### 1. Подготовка сервера (Ubuntu/Debian)

```bash
sudo apt update && sudo apt install python3 python3-venv nodejs npm nginx
```

### 2. Клонирование и настройка

```bash
git clone https://github.com/<username>/<repo>.git
cd <repo>
```

### 3. Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Отредактировать .env: выставить ENV=production, DEBUG=false, задать SECRET_KEY
alembic upgrade head
```

Запуск через systemd или:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 4. Frontend

```bash
cd ..
npm install
npm run build
# Папка dist/ — готовые статические файлы для Nginx
```

### 5. Nginx (пример конфига)

```nginx
server {
    listen 80;
    server_name example.com;

    # Frontend
    location / {
        root /path/to/project/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Uploads
    location /uploads/ {
        proxy_pass http://127.0.0.1:8000;
    }
}
```

## Переменные окружения

Смотри `backend/.env.example` — все доступные настройки с описанием.
