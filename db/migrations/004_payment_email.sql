-- Привязка платежей и отчётов к email покупателя.
-- Позволяет выдать доступ к тесту после оплаты БЕЗ обязательной регистрации:
-- доступ проверяется по email, указанному при оплате.

alter table payments add column if not exists customer_email text;
alter table payments add column if not exists confirmation_url text;

alter table reports add column if not exists customer_email text;

create index if not exists idx_payments_customer_email_status
  on payments (lower(customer_email), status);

create index if not exists idx_payments_provider_payment_id
  on payments (provider_payment_id);

create index if not exists idx_reports_customer_email
  on reports (lower(customer_email));
