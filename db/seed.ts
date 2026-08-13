import { Client } from "pg";
import bcrypt from "bcryptjs";
import { loadEnv } from "./loadEnv";

loadEnv();

/**
 * Создаёт администратора в БД.
 *
 * Использование (PowerShell):
 *   $env:ADMIN_EMAIL="admin@example.com"; $env:ADMIN_PASSWORD="secret123"; npm run db:seed
 *
 * Если пользователь с таким email уже существует — его роль обновляется на 'admin'
 * и (при указании пароля) обновляется пароль. Если не существует — создаётся новый.
 */
async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL не задан");
  }

  const email = (process.env.ADMIN_EMAIL || "admin@profnavigator.ru").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "admin12345";
  const fullName = process.env.ADMIN_NAME || "Администратор";

  if (password.length < 6) {
    throw new Error("ADMIN_PASSWORD должен быть не короче 6 символов");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const client = new Client({ connectionString });
  await client.connect();

  try {
    const existing = await client.query(`select id from users where email = $1`, [email]);

    if (existing.rows.length > 0) {
      await client.query(
        `update users set role = 'admin', password_hash = $2, full_name = $3, is_active = true, updated_at = now()
         where email = $1`,
        [email, passwordHash, fullName],
      );
      console.log(`Администратор обновлён: ${email}`);
    } else {
      await client.query(
        `insert into users (email, password_hash, full_name, role, is_active)
         values ($1, $2, $3, 'admin', true)`,
        [email, passwordHash, fullName],
      );
      console.log(`Администратор создан: ${email}`);
    }

    console.log("Готово. Вход в админку: /login");
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
