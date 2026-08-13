-- Миграция auth + billing поверх базовой схемы (0001_init.sql).
-- Использует ADD COLUMN IF NOT EXISTS, чтобы корректно работать,
-- если таблицы уже созданы предыдущей миграцией.

create extension if not exists "uuid-ossp";

-- ===== users =====
alter table users add column if not exists password_hash text;
alter table users add column if not exists full_name text;
alter table users add column if not exists phone text;
alter table users add column if not exists role text not null default 'user';
alter table users add column if not exists is_active boolean not null default true;
alter table users add column if not exists updated_at timestamptz not null default now();

-- ===== user_sessions =====
create table if not exists user_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  token_hash text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz
);

-- ===== reports =====
alter table reports add column if not exists user_id uuid references users(id) on delete cascade;
alter table reports add column if not exists title text;
alter table reports add column if not exists category text;
alter table reports add column if not exists status text not null default 'completed';
alter table reports add column if not exists payload jsonb not null default '{}'::jsonb;
alter table reports add column if not exists file_url text;
alter table reports add column if not exists file_name text;
alter table reports add column if not exists updated_at timestamptz not null default now();

-- ===== payments =====
alter table payments add column if not exists amount_cents integer;
alter table payments add column if not exists provider_payment_id text;
alter table payments add column if not exists provider_status text;
alter table payments add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table payments add column if not exists updated_at timestamptz not null default now();

-- ===== payment_events =====
create table if not exists payment_events (
  id uuid primary key default uuid_generate_v4(),
  payment_id uuid not null references payments(id) on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ===== access_rules =====
create table if not exists access_rules (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  feature text not null,
  granted boolean not null default false,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- ===== индексы =====
create index if not exists idx_reports_user_created on reports(user_id, created_at desc);
create index if not exists idx_payments_user_created on payments(user_id, created_at desc);
create index if not exists idx_access_rules_user_feature on access_rules(user_id, feature);
