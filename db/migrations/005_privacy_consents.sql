-- Подтверждаемые версии согласий на обработку персональных данных и cookie.
create table if not exists consent_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  session_id text,
  consent_type text not null check (consent_type in ('cookies', 'personal_data')),
  document_version text not null,
  decision text not null,
  subject_age_group text,
  source text not null,
  granted_at timestamptz not null default now(),
  withdrawn_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists idx_consent_records_user on consent_records(user_id, granted_at desc);
create index if not exists idx_consent_records_session on consent_records(session_id, granted_at desc);
create unique index if not exists idx_consent_records_survey_unique
  on consent_records(session_id, consent_type, document_version)
  where session_id is not null and consent_type = 'personal_data';
