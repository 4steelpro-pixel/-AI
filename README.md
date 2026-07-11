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

4. Применить миграции БД:

   ```bash
   npm run db:migrate
   ```

5. Запустить дев-сервер:

   ```bash
   npm run dev
   ```

   Приложение — [http://localhost:3000](http://localhost:3000).

## Структура

- `src/app` — страницы (главная, `/survey/[category]`) и API routes (`/api/analyze`,
  `/api/reports/export`, `/api/events`).
- `src/lib/survey` — вопросы, ветвление, сборка payload для YandexGPT.
- `src/lib/report` — системный промт, вызов YandexGPT, схема отчёта (zod), генерация
  PDF/DOCX, работа с Object Storage, сохранение в БД.
- `src/lib/analytics` — логирование событий воронки в таблицу `events`.
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
