# Развёртывание ПрофНавигатор AI на Timeweb VDS

Пошаговая инструкция по публикации проекта в интернете на облачном сервере Timeweb.

---

## Шаг 1. SSH-ключ (уже сгенерирован ✅)

SSH-ключ для этого проекта **уже создан** на вашей машине. Он находится в:
`C:\Users\Admin\.ssh\id_ed25519` (приватный) и `id_ed25519.pub` (публичный).

**Публичный ключ** (скопируйте его в Timeweb при создании сервера):

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAILmYgvbftLtMlpN1IsGN4OOB2hBAxlUuhZ321amjqRss profnavigator
```

> ⚠️ **Приватный ключ** `id_ed25519` никому не показывайте и не загружайте в GitHub.

> 💡 Если понадобится сгенерировать ключ заново или на другой машине, используйте
> `ssh-keygen` из Git (в PATH его нет): `"C:\Program Files\Git\usr\bin\ssh-keygen.exe"`.

---

## Шаг 2. Создание сервера в Timeweb

В панели Timeweb выберите **«Облачные серверы» → «Создать сервер»**:

| Параметр | Значение |
|---|---|
| **Тип** | Облачный сервер (VDS) |
| **ОС** | Ubuntu 22.04 LTS (чистая, без панели) |
| **Конфигурация** | 2 vCPU / 4 GB RAM / 50 GB NVMe |
| **Регион** | ближайший к аудитории (например, Москва) |
| **SSH-ключ** | выбрать созданный на шаге 1 |
| **Бэкапы** | можно отключить (настроим свои через cron) |
| **DDoS-защита** | можно отключить (для старта не нужна) |

---

## Шаг 3. Первоначальная настройка сервера

В панели Timeweb есть поле **«Скрипт инициализации»** (или «Автоматизация настройки»).
Загрузите туда содержимое файла [`deploy/cloud-init.yaml`](./deploy/cloud-init.yaml) из проекта.

> ⚠️ Timeweb принимает только скрипты, начинающиеся с `#cloud-config` или `#!/bin/sh`.
> Файл `deploy/cloud-init.yaml` уже в правильном формате `#cloud-config` — загружайте именно его.

Скрипт автоматически установит и настроит:
- Node.js 20, PM2, Git, curl
- PostgreSQL
- MinIO (S3-хранилище для отчётов)
- Nginx (reverse-proxy)
- Файрвол UFW (порты 22, 80, 443)
- Ежедневный бэкап БД через cron

> Если поле скрипта недоступно — просто создайте сервер, а затем выполните скрипт
> вручную после подключения по SSH (см. шаг 4). Для ручного запуска используйте
> `deploy/setup.sh` (обычный bash-скрипт).

---

## Шаг 4. Подключение к серверу по SSH

После создания сервера Timeweb покажет его **IP-адрес**. Подключитесь из PowerShell:

```powershell
ssh root@<IP-адрес>
```

Если скрипт инициализации не выполнялся автоматически, запустите его вручную:

```bash
cd /root
# скопируйте содержимое deploy/setup.sh в файл setup.sh, затем:
bash setup.sh
```

---

## Шаг 5. Создание базы данных PostgreSQL

```bash
sudo -u postgres psql
```

В консоли PostgreSQL выполните (замените пароль на свой):

```sql
CREATE USER profnavigator WITH PASSWORD 'ваш_надёжный_пароль';
CREATE DATABASE profnavigator OWNER profnavigator;
\q
```

---

## Шаг 6. Клонирование проекта

```bash
cd /var/www/profnavigator
git clone <URL-вашего-репозитория> .
npm install
```

> Если репозиторий приватный — настройте доступ по SSH-ключу или токену GitHub.

---

## Шаг 7. Настройка `.env.local`

Создайте файл `.env.local` в корне проекта:

```bash
nano /var/www/profnavigator/.env.local
```

Заполните переменные (пример для продакшена):

```env
# Yandex Cloud (Foundation Models API)
YC_FOLDER_ID=ваш_folder_id
YC_SERVICE_ACCOUNT_KEY_ID=ваш_key_id
YC_SERVICE_ACCOUNT_SECRET=ваш_secret
YC_GPT_MODEL_URI=gpt://<YC_FOLDER_ID>/yandexgpt/latest

# База данных (локальный PostgreSQL на сервере)
DATABASE_URL=postgres://profnavigator:ваш_пароль@localhost:5432/profnavigator

# S3-хранилище (MinIO на сервере)
STORAGE_BUCKET=profnavigator-reports
STORAGE_ENDPOINT=http://localhost:9000
STORAGE_REGION=us-east-1
STORAGE_ACCESS_KEY_ID=minioadmin
STORAGE_SECRET_ACCESS_KEY=minioadmin
STORAGE_FORCE_PATH_STYLE=true

# Секрет для JWT (сгенерируйте случайную строку)
JWT_SECRET=случайная_длинная_строка
```

> ⚠️ Смените пароли MinIO в `/etc/default/minio` (по умолчанию `minioadmin/minioadmin`)
> и перезапустите: `systemctl restart minio`. Затем обновите `STORAGE_ACCESS_KEY_ID`
> и `STORAGE_SECRET_ACCESS_KEY` в `.env.local`.

---

## Шаг 8. Миграции и создание администратора

```bash
cd /var/www/profnavigator
npm run db:migrate
ADMIN_EMAIL=admin@ваш-домен.ru ADMIN_PASSWORD=ваш_пароль npm run db:seed
```

---

## Шаг 9. Сборка и запуск через PM2

```bash
cd /var/www/profnavigator
npm run build
pm2 start npm --name profnavigator -- start
pm2 save
```

Проверьте, что приложение работает:

```bash
curl http://localhost:3000
```

---

## Шаг 10. Настройка Nginx + SSL

Создайте конфигурацию Nginx:

```bash
nano /etc/nginx/sites-available/profnavigator
```

```nginx
server {
    listen 80;
    server_name ваш-домен.ru www.ваш-домен.ru;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Активируйте сайт и перезапустите Nginx:

```bash
ln -s /etc/nginx/sites-available/profnavigator /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

### SSL-сертификат (Let's Encrypt)

```bash
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d ваш-домен.ru -d www.ваш-домен.ru
```

---

## Шаг 11. Настройка DNS

В панели регистратора домена (или в Timeweb, если домен там) создайте A-записи:

| Тип | Имя | Значение |
|---|---|---|
| A | `@` | IP-адрес сервера |
| A | `www` | IP-адрес сервера |

Дождитесь распространения DNS (обычно 5–30 минут).

---

## Шаг 12. Проверка

- Откройте `https://ваш-домен.ru` — главная страница.
- `https://ваш-домен.ru/admin` — админ-панель (вход под администратором из шага 8).
- `https://ваш-домен.ru/login` — вход для пользователей.

---

## Полезные команды

```bash
# Логи приложения
pm2 logs profnavigator

# Перезапуск приложения
pm2 restart profnavigator

# Статус сервисов
systemctl status postgresql minio nginx

# Бэкап БД вручную
/usr/local/bin/backup-db.sh
ls -la /var/backups/profnavigator/
```

---

## Обновление проекта

```bash
cd /var/www/profnavigator
git pull
npm install
npm run build
pm2 restart profnavigator
```

---

## Приём платежей через ЮKassa

### 1. Переменные окружения

В `/var/www/profnavigator/.env.local` добавьте:

```env
YOOKASSA_SHOP_ID=1433965
YOOKASSA_SECRET_KEY=live_ваш_секретный_ключ
YOOKASSA_SEND_RECEIPT=true
YOOKASSA_VAT_CODE=1
APP_BASE_URL=https://profnaviai.ru
```

> ⚠️ **Важно про чеки.** Если в магазине ЮKassa включена фискализация
> (чеки формирует ЮKassa), объект `receipt` в запросе **обязателен**, иначе платёж
> отклоняется с ошибкой `Receipt is missing or illegal`. Проверить настройку магазина:
>
> ```bash
> cd /var/www/profnavigator
> node -e "require('@next/env').loadEnvConfig(process.cwd()); const s=process.env.YOOKASSA_SHOP_ID,k=process.env.YOOKASSA_SECRET_KEY; fetch('https://api.yookassa.ru/v3/me',{headers:{Authorization:'Basic '+Buffer.from(s+':'+k).toString('base64')}}).then(async r=>console.log(r.status,(await r.text())))"
> ```
>
> В ответе смотрите `fiscalization.enabled` и `test` (боевой/тестовый магазин).
> Ставка НДС задаётся `YOOKASSA_VAT_CODE` (1 — без НДС; для ИП на УСН/НПД обычно 1).

После изменения `.env.local` пересоберите и перезапустите приложение:

```bash
cd /var/www/profnavigator
npm run build && pm2 restart profnavigator
```

Проверка, что ключи подхватились:

```bash
cd /var/www/profnavigator
node -e "require('@next/env').loadEnvConfig(process.cwd()); console.log('shop:', process.env.YOOKASSA_SHOP_ID, '| key length:', (process.env.YOOKASSA_SECRET_KEY||'').length)"
```

### 2. Вебхуки в личном кабинете ЮKassa

Настройки → **HTTP-уведомления**. Укажите URL:

```
https://profnaviai.ru/api/billing/webhook
```

События: `payment.succeeded`, `payment.canceled`.

> Подлинность уведомлений проверяется перезапросом платежа из API ЮKassa,
> поэтому белый список IP настраивать не обязательно.

### 3. Страховка от пропущенных вебхуков (cron)

```bash
crontab -e
```

Добавьте строку — каждые 10 минут (замените расписание на нужное):

```cron
10 * * * * cd /var/www/profnavigator && /usr/bin/npm run db:sync-payments >> /var/log/pn-sync.log 2>&1
```

Ручная проверка:

```bash
cd /var/www/profnavigator && npm run db:sync-payments
tail -n 50 /var/log/pn-sync.log
```

### 4. Как выдаётся доступ к тесту

1. Покупатель указывает **email** на странице `/billing` — регистрация не обязательна.
2. Создаётся локальный платёж и платёж в ЮKassa; покупатель переходит на платёжную форму.
3. После оплаты ЮKassa возвращает покупателя на `/billing/success?paymentId=...`.
4. Доступ проверяется по email: без успешного платежа `/api/analyze` вернёт **402**.
5. Если покупатель позже зарегистрируется с тем же email, отчёты появятся в личном кабинете.

### 5. Тестирование

В ЮKassa используйте **тестовый магазин** и тестовые карты. Сценарии:

- гость оплатил → доступ открылся по email без регистрации;
- гость оплатил → зарегистрировался с тем же email → доступ и отчёты в кабинете;
- вебхук не пришёл → `npm run db:sync-payments` подтянул статус;
- повторный вебхук не создаёт дублей (идемпотентность).

---

## Полезные эндпоинты биллинга

| Метод | Путь | Назначение |
|---|---|---|
| GET | `/api/billing/access` | проверка доступа к тесту (по токену или email) |
| GET | `/api/billing/price` | актуальная цена из настроек |
| POST | `/api/billing/validate-promo` | проверка промо-кода |
| POST | `/api/billing/checkout` | создание платежа + платёж в ЮKassa |
| GET | `/api/billing/status?paymentId=...` | статус платежа для `/billing/success` |
| POST | `/api/billing/webhook` | уведомления ЮKassa (проверка через API) |
