create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  created_at timestamptz not null default now()
);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  category text not null check (category in ('teen', 'adult')),
  geo jsonb,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  question_key text not null,
  question_text text,
  answer jsonb,
  answer_type text check (answer_type in ('choice', 'multi_choice', 'ranking', 'free_text')),
  created_at timestamptz not null default now()
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  raw_llm_response jsonb not null,
  pdf_object_key text,
  docx_object_key text,
  created_at timestamptz not null default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  session_id uuid references sessions(id),
  amount numeric,
  currency text not null default 'RUB',
  status text,
  provider text,
  created_at timestamptz not null default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid,
  user_id uuid,
  event_name text not null,
  payload jsonb,
  created_at timestamptz not null default now()
);

create index if not exists answers_session_id_idx on answers(session_id);
create index if not exists reports_session_id_idx on reports(session_id);
create index if not exists events_session_id_idx on events(session_id);
