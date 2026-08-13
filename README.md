# ПрофНавигатор AI

Веб-приложение на Next.js, которое с помощью YandexGPT помогает пользователю подобрать
профессию на ближайшие 5 лет с учётом его склонностей, опыта, региона проживания и
рынка труда. Полная спецификация — в [PROJECT_BRIEF.md](./PROJECT_BRIEF.md).

## Стек

Next.js 16 (App Router) + TypeScript + Tailwind CSS, backend — API routes того же
приложения, PostgreSQL (`pg`), Yandex Object Storage / S3-совместимое хранилище
(`@aws-sdk/client-s3`), генерация отчётов — YandexGPT (Foundation Models API),
PDF — `@react-pdf/renderer`, DOCX — `docx`.

## Разработка

1. Установить зависимости:

   ```bash
   npm install
   ```

2. Скопировать `.env.example` в `.env.local` и заполнить реальными значениями
   (`YC_FOLDER_ID`, `YC_SERVICE_ACCOUNT_KEY_ID`, `YC_SERVICE_ACCOUNT_SECRET` — ключи
   сервисного аккаунта Yandex Cloud с доступом к Foundation Models API).

3. Поднять локальные PostgreSQL и MinIO (S3-совместимое хранилище для разработки):

   ```bash
   docker compose up -d
   ```

4. Применить миграции БД (скрипт сам подхватит `DATABASE_URL` из `.env.local`):

   ```bash
   npm run db:migrate
   ```

5. Создать администратора (для доступа к `/admin`). В PowerShell переменные задаются
   через `$env:`:

   ```powershell
   $env:ADMIN_EMAIL="admin@example.com"; $env:ADMIN_PASSWORD="secret123"; npm run db:seed
   ```

   Если пользователь с таким email уже существует — его роль станет `admin`.
   По умолчанию (без переменных) создаётся `admin@profnavigator.ru` / `admin12345`.

6. Запустить дев-сервер:

   ```bash
   npm run dev
   ```

   Приложение — [http://localhost:3000](http://localhost:3000).
   Админ-панель — [http://localhost:3000/admin](http://localhost:3000/admin).
   Вход — [http://localhost:3000/login](http://localhost:3000/login).

## Админ-панель

Админ-панель доступна по адресу [http://localhost:3000/admin](http://localhost:3000/admin)
после входа под учётной записью с ролью `admin`. Вкладки:

- **Обзор** — статистика: пользователи, отчёты, платежи, выручка.
- **Пользователи** — блокировка/разблокировка, смена роли, удаление.
- **Отчёты** — список сгенерированных отчётов и ссылки на файлы.
- **Платежи** — история платежей и их статусы.
- **Настройки** — управление доступом к тестам:
  - **Тесты после оплаты** (переключатель): если включено — тест доступен только после
    успешной оплаты; если выключено — тест доступен всем без оплаты.
  - **Стоимость доступа** — базовая цена в рублях.
- **Промо-коды** — создание и управление скидками:
  - код, размер скидки (%), лимит использований (пусто = без лимита);
  - включение/выключение, изменение скидки, удаление.

### Промо-коды в форме оплаты

На странице `/billing` пользователь может ввести промо-код. Если код действителен,
скидка применяется автоматически к сумме оплаты. Проверка кода выполняется на сервере
(`/api/billing/validate-promo`), а итоговая сумма с учётом скидки рассчитывается в
`/api/billing/checkout`.

### Доступ к тесту

Перед началом теста `/survey/[category]` проверяется доступ через `/api/billing/access`:
- если настройка **«Тесты после оплаты»** выключена — доступ открыт всем;
- если включена — доступ только при наличии успешного платежа (`status = 'succeeded'`),
  иначе пользователь перенаправляется на страницу оплаты `/billing`.

## Структура

- `src/app` — страницы (главная, `/survey/[category]`, `/billing`, `/admin`) и API routes
  (`/api/analyze`, `/api/reports/export`, `/api/events`, `/api/auth/*`, `/api/admin/*`,
  `/api/billing/*`).
- `src/lib/survey` — вопросы, ветвление, сборка payload для YandexGPT.
- `src/lib/report` — системный промт, вызов YandexGPT, схема отчёта (zod), генерация
  PDF/DOCX, работа с Object Storage, сохранение в БД.
- `src/lib/analytics` — логирование событий воронки в таблицу `events`.
- `src/lib/admin` — сервисы и проверка прав для админ-панели.
- `src/lib/billing` — настройки приложения, промо-коды, провайдеры оплаты.
- `db/migrations` — SQL-схема БД, `db/migrate.ts` — простой раннер миграций.

## Заделы на будущее (не в MVP)

Ниже — что уже заложено в архитектуре для функций из раздела 2 брифа, которые
сознательно не входят в MVP.

**Регистрация по email.** Таблица `users` (`db/migrations/0001_init.sql`) и колонка
`sessions.user_id` (nullable, `references users(id)`) уже существуют — сейчас все
сессии анонимные (`user_id = null`). Добавление auth (NextAuth.js с email+OTP, как
указано в брифе) не потребует миграции схемы: достаточно создавать запись в `users`
при регистрации и передавать `userId` в `saveReport` (`src/lib/report/storage.ts`) при
создании сессии. Переменная `NEXTAUTH_SECRET` уже зарезервирована в `.env.example`.

**Оплата.** Таблица `payments` (`user_id`, `session_id`, `amount`, `currency`,
`status`, `provider`) уже в схеме БД — готова для интеграции ЮKassa/CloudPayments без
изменений структуры.

**Личный кабинет с историей отчётов.** Как только появится `user_id` в `sessions`,
кабинет — это просто `select` по `sessions`/`reports` с `where user_id = $1 order by
created_at desc`; `reports.pdf_object_key`/`docx_object_key` уже хранятся, так что
повторная генерация файлов не понадобится — только выпуск нового presigned URL
(`getDownloadUrl` в `src/lib/report/objectStorage.ts`).

Осознанно не сделано сейчас: сама auth-логика (провайдер, страницы входа), фактическая
интеграция платёжного шлюза, UI кабинета — добавлять их без реального провайдера/тестового
окружения означало бы нерабочий код без возможности проверить.
