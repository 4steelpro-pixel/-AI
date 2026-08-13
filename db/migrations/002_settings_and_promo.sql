-- Настройки приложения и промо-коды.

-- ===== settings (ключ-значение) =====
create table if not exists settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Настройка "тесты после оплаты" (require_payment):
--   true  — тест доступен только после успешной оплаты
--   false — тест доступен всем без оплаты
insert into settings (key, value) values ('require_payment', 'true'::jsonb)
on conflict (key) do nothing;

-- ===== promo_codes =====
create table if not exists promo_codes (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,
  discount_percent integer not null default 0 check (discount_percent >= 0 and discount_percent <= 100),
  is_active boolean not null default true,
  max_uses integer,
  used_count integer not null default 0,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_promo_codes_code on promo_codes(code);
