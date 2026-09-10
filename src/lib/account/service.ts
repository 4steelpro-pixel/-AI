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

/** Возвращает пользователя вместе с хешем пароля (для смены пароля). */
export async function getUserWithPasswordHash(userId: string) {
  const pool = getPool();
  const { rows } = await pool.query(
    `select id, email, full_name, role, is_active, password_hash, created_at, updated_at
     from users
     where id = $1`,
    [userId],
  );
  return rows[0] || null;
}

/** Обновляет имя пользователя. */
export async function updateUserProfile(userId: string, fullName: string | null) {
  const pool = getPool();
  const { rows } = await pool.query(
    `update users set full_name = $2, updated_at = now()
     where id = $1
     returning id, email, full_name, role, created_at`,
    [userId, fullName],
  );
  return rows[0] || null;
}

/** Обновляет хеш пароля пользователя. */
export async function updateUserPassword(userId: string, passwordHash: string) {
  const pool = getPool();
  const { rowCount } = await pool.query(
    `update users set password_hash = $2, updated_at = now() where id = $1`,
    [userId, passwordHash],
  );
  return (rowCount ?? 0) > 0;
}
