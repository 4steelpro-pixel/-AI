import { getPool } from "@/lib/db/client";

export async function getStats() {
  const pool = getPool();
  const { rows } = await pool.query(`
    select
      (select count(*) from users) as users_total,
      (select count(*) from users where role = 'admin') as users_admins,
      (select count(*) from users where is_active = true) as users_active,
      (select count(*) from reports) as reports_total,
      (select count(*) from payments) as payments_total,
      (select coalesce(sum(amount_cents), 0) from payments where status = 'succeeded') as revenue_cents,
      (select count(*) from payments where status = 'succeeded') as payments_succeeded,
      (select count(*) from payments where status = 'pending') as payments_pending
  `);
  return rows[0];
}

export async function listUsers(limit = 100, offset = 0) {
  const pool = getPool();
  const { rows } = await pool.query(
    `select id, email, full_name, role, is_active, created_at, updated_at
     from users
     order by created_at desc
     limit $1 offset $2`,
    [limit, offset],
  );
  return rows;
}

export async function listReports(limit = 100, offset = 0) {
  const pool = getPool();
  const { rows } = await pool.query(
    `select r.id, r.title, r.category, r.status, r.file_url, r.file_name, r.created_at,
            u.email as user_email
     from reports r
     left join users u on u.id = r.user_id
     order by r.created_at desc
     limit $1 offset $2`,
    [limit, offset],
  );
  return rows;
}

export async function listPayments(limit = 100, offset = 0) {
  const pool = getPool();
  const { rows } = await pool.query(
    `select p.id, p.provider, p.amount_cents, p.currency, p.status, p.provider_payment_id,
            p.created_at, u.email as user_email
     from payments p
     left join users u on u.id = p.user_id
     order by p.created_at desc
     limit $1 offset $2`,
    [limit, offset],
  );
  return rows;
}

export async function setUserActive(userId: string, isActive: boolean) {
  const pool = getPool();
  const { rows } = await pool.query(
    `update users set is_active = $2, updated_at = now() where id = $1 returning id, email, role, is_active`,
    [userId, isActive],
  );
  return rows[0] || null;
}

export async function setUserRole(userId: string, role: string) {
  const pool = getPool();
  const { rows } = await pool.query(
    `update users set role = $2, updated_at = now() where id = $1 returning id, email, role, is_active`,
    [userId, role],
  );
  return rows[0] || null;
}

export async function deleteUser(userId: string) {
  const pool = getPool();
  const { rowCount } = await pool.query(`delete from users where id = $1`, [userId]);
  return rowCount;
}
