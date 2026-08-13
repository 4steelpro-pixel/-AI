#!/usr/bin/env bash
#
# ПрофНавигатор AI — скрипт первоначальной настройки сервера (Timeweb VDS)
# ОС: Ubuntu 22.04 LTS / 24.04 LTS
#
# Скрипт идемпотентный — безопасно запускать повторно.
# Не содержит секретов (пароли БД, ключи API) — они задаются отдельно в .env.local.
#
# Запуск: bash setup.sh
set -euo pipefail

log() { echo -e "\n\033[1;32m[SETUP]\033[0m $1"; }

# ---------------------------------------------------------------------------
# 1. Обновление системы
# ---------------------------------------------------------------------------
log "Обновление системы..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get upgrade -y

# ---------------------------------------------------------------------------
# 2. Базовые утилиты
# ---------------------------------------------------------------------------
log "Установка базовых утилит (git, curl, wget, unzip, build-essential)..."
apt-get install -y git curl wget unzip build-essential ca-certificates gnupg lsb-release ufw

# ---------------------------------------------------------------------------
# 3. Node.js 20 (нужен для Next.js 16)
# ---------------------------------------------------------------------------
if ! command -v node >/dev/null 2>&1 || [ "$(node -v | cut -d. -f1 | tr -d 'v')" -lt 20 ]; then
  log "Установка Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
log "Node.js: $(node -v) | npm: $(npm -v)"

# ---------------------------------------------------------------------------
# 4. PM2 — менеджер процессов для автозапуска приложения
# ---------------------------------------------------------------------------
if ! command -v pm2 >/dev/null 2>&1; then
  log "Установка PM2..."
  npm install -g pm2
  pm2 startup systemd -u root --hp /root || true
fi
log "PM2: $(pm2 -v)"

# ---------------------------------------------------------------------------
# 5. PostgreSQL
# ---------------------------------------------------------------------------
if ! command -v psql >/dev/null 2>&1; then
  log "Установка PostgreSQL..."
  apt-get install -y postgresql postgresql-contrib
  systemctl enable postgresql
  systemctl start postgresql
fi
log "PostgreSQL: $(psql --version)"

# ---------------------------------------------------------------------------
# 6. MinIO (S3-совместимое хранилище для отчётов PDF/DOCX)
# ---------------------------------------------------------------------------
if [ ! -f /usr/local/bin/minio ]; then
  log "Установка MinIO..."
  wget -q https://dl.min.io/server/minio/release/linux-amd64/minio -O /usr/local/bin/minio
  chmod +x /usr/local/bin/minio

  # Пользователь и папка данных
  useradd -r minio-user -s /sbin/nologin 2>/dev/null || true
  mkdir -p /mnt/data
  chown -R minio-user:minio-user /mnt/data

  # systemd-сервис
  cat > /etc/systemd/system/minio.service <<'EOF'
[Unit]
Description=MinIO
Documentation=https://docs.min.io
Wants=network-online.target
After=network-online.target

[Service]
User=minio-user
Group=minio-user
EnvironmentFile=-/etc/default/minio
ExecStart=/usr/local/bin/minio server /mnt/data --console-address ":9001"
Restart=always
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOF

  # Конфигурация по умолчанию (замените пароли в /etc/default/minio после первого запуска)
  cat > /etc/default/minio <<'EOF'
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
MINIO_VOLUMES="/mnt/data"
EOF

  systemctl daemon-reload
  systemctl enable minio
  systemctl start minio
fi
log "MinIO установлен (порт 9000 API, 9001 консоль)"

# ---------------------------------------------------------------------------
# 7. Nginx — reverse-proxy для Next.js
# ---------------------------------------------------------------------------
if ! command -v nginx >/dev/null 2>&1; then
  log "Установка Nginx..."
  apt-get install -y nginx
  systemctl enable nginx
  systemctl start nginx
fi
log "Nginx: $(nginx -v 2>&1)"

# ---------------------------------------------------------------------------
# 8. Файрвол UFW
# ---------------------------------------------------------------------------
log "Настройка файрвола UFW (порты 22, 80, 443)..."
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# ---------------------------------------------------------------------------
# 9. Папка проекта
# ---------------------------------------------------------------------------
mkdir -p /var/www/profnavigator
log "Папка проекта создана: /var/www/profnavigator"

# ---------------------------------------------------------------------------
# 10. Автоматический бэкап БД (cron) — pg_dump раз в сутки
# ---------------------------------------------------------------------------
log "Настройка ежедневного бэкапа БД (cron)..."
mkdir -p /var/backups/profnavigator
cat > /usr/local/bin/backup-db.sh <<'EOF'
#!/usr/bin/env bash
# Ежедневный бэкап базы данных ПрофНавигатор AI
# Замените DB_NAME и DB_USER на реальные значения из .env.local
DB_NAME="profnavigator"
DB_USER="profnavigator"
BACKUP_DIR="/var/backups/profnavigator"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_DIR/db_$DATE.sql.gz"
# Храним последние 14 бэкапов
ls -t "$BACKUP_DIR"/db_*.sql.gz | tail -n +15 | xargs -r rm --
EOF
chmod +x /usr/local/bin/backup-db.sh

# Добавляем задачу в cron (если ещё нет)
if ! crontab -l 2>/dev/null | grep -q "backup-db.sh"; then
  (crontab -l 2>/dev/null; echo "0 3 * * * /usr/local/bin/backup-db.sh") | crontab -
fi
log "Бэкап БД настроен (ежедневно в 03:00, хранится 14 копий)"

# ---------------------------------------------------------------------------
# Готово
# ---------------------------------------------------------------------------
log "Первоначальная настройка завершена!"
echo ""
echo "  Установлено: Node.js, PM2, PostgreSQL, MinIO, Nginx, Git, UFW"
echo "  Папка проекта: /var/www/profnavigator"
echo "  MinIO: API :9000, консоль :9001 (логин/пароль по умолчанию minioadmin/minioadmin)"
echo ""
echo "  ДАЛЬШЕ ВРУЧНУЮ:"
echo "  1. Сменить пароли MinIO в /etc/default/minio и перезапустить: systemctl restart minio"
echo "  2. Создать БД и пользователя PostgreSQL (см. инструкцию)"
echo "  3. Склонировать проект в /var/www/profnavigator"
echo "  4. Создать .env.local с реальными ключами"
echo "  5. Запустить миграции и seed"
echo "  6. Настроить Nginx + SSL"
echo "  7. Запустить приложение через PM2"
