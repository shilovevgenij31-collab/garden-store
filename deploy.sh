#!/bin/bash
# ==============================================================
# Deploy script for "Всё в сад" — garden-store
# Tested on Ubuntu 22.04 / Debian 12 (Beget VPS)
# Run as root: bash deploy.sh
# ==============================================================

set -e

DOMAIN="159.194.209.18"
REPO="https://github.com/shilovevgenij31-collab/garden-store.git"
PROJECT_DIR="/var/www/garden-store"
BACKEND_PORT=8000

echo "=== 1. Installing system packages ==="
apt update
apt install -y nginx git curl python3 python3-venv python3-pip

# Install Node.js 20 LTS
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
fi

echo "=== 2. Cloning repository ==="
if [ -d "$PROJECT_DIR" ]; then
    echo "Directory exists, pulling latest..."
    cd "$PROJECT_DIR"
    git pull origin main
else
    git clone "$REPO" "$PROJECT_DIR"
    cd "$PROJECT_DIR"
fi

echo "=== 3. Building frontend ==="
npm install
npm run build

echo "=== 4. Setting up backend ==="
cd "$PROJECT_DIR/backend"
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create production .env if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    SECRET=$(python3 -c "import secrets; print(secrets.token_hex(32))")
    sed -i "s/ENV=development/ENV=production/" .env
    sed -i "s/DEBUG=true/DEBUG=false/" .env
    sed -i "s|FRONTEND_URL=http://localhost:5173|FRONTEND_URL=http://$DOMAIN|" .env
    sed -i "s|BASE_URL=http://localhost:8000|BASE_URL=http://$DOMAIN|" .env
    sed -i "s|CORS_ORIGINS=.*|CORS_ORIGINS=[\"http://$DOMAIN\"]|" .env
    sed -i "s/SECRET_KEY=/SECRET_KEY=$SECRET/" .env
    echo ">>> .env created. Edit it to set ADMIN_PASSWORD_HASH!"
fi

# Run migrations (PYTHONPATH needed so alembic finds app.models)
source venv/bin/activate
PYTHONPATH="$PROJECT_DIR/backend" alembic upgrade head

deactivate

echo "=== 5. Creating systemd service for backend ==="
cat > /etc/systemd/system/garden-backend.service << 'EOF'
[Unit]
Description=Garden Store Backend (FastAPI)
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/garden-store/backend
Environment=PATH=/var/www/garden-store/backend/venv/bin:/usr/bin
Environment=PYTHONPATH=/var/www/garden-store/backend
ExecStart=/var/www/garden-store/backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable garden-backend
systemctl restart garden-backend

echo "=== 6. Configuring Nginx ==="
cat > /etc/nginx/sites-available/garden-store << NGINXEOF
server {
    listen 80;
    server_name $DOMAIN;

    # Frontend (static files)
    location / {
        root $PROJECT_DIR/dist;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:$BACKEND_PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Health check
    location /health {
        proxy_pass http://127.0.0.1:$BACKEND_PORT;
    }

    # Uploads
    location /uploads/ {
        proxy_pass http://127.0.0.1:$BACKEND_PORT;
    }

    # Docs (only in dev)
    location /docs {
        proxy_pass http://127.0.0.1:$BACKEND_PORT;
    }
    location /redoc {
        proxy_pass http://127.0.0.1:$BACKEND_PORT;
    }
    location /openapi.json {
        proxy_pass http://127.0.0.1:$BACKEND_PORT;
    }
}
NGINXEOF

# Enable site
ln -sf /etc/nginx/sites-available/garden-store /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and reload
nginx -t
systemctl reload nginx
systemctl enable nginx

echo ""
echo "==========================================="
echo "  DEPLOY COMPLETE!"
echo "  Site: http://$DOMAIN"
echo "  API:  http://$DOMAIN/api/"
echo "==========================================="
echo ""
echo "Useful commands:"
echo "  systemctl status garden-backend   # check backend"
echo "  journalctl -u garden-backend -f   # backend logs"
echo "  systemctl restart garden-backend  # restart backend"
echo "  cd $PROJECT_DIR && git pull && npm run build && systemctl restart garden-backend  # update"
