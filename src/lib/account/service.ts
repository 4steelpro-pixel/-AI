import { getPool } from "@/lib/db/client";

export async function listUserReports(userId: string) {
  const pool = getPool();
  const { rows } = await pool.query(
    `select id, title, category, status, file_url, file_name, created_at
     from reports
     where user_id = $1
     order by created_at desc`,
    [userId],
  );
  return rows;
}

export async function listUserPayments(userId: string) {
  const pool = getPool();
  const { rows } = await pool.query(
    `select id, provider, amount_cents, currency, status, provider_payment_id, created_at
     from payments
     where user_id = $1
     order by created_at desc`,
    [userId],
  );
  return rows;
}
