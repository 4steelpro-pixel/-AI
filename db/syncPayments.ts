import { Client } from "pg";
import { loadEnv } from "./loadEnv";

loadEnv();

/**
 * Синхронизация «зависших» платежей с ЮKassa.
 * Страховка на случай, если вебхук не дошёл: раз в несколько минут
 * опрашиваем pending-платежи и обновляем их статус.
 *
 * Запуск: npm run db:sync-payments
 * Пример cron (расписание — каждые 10 минут):
 *   cd /var/www/profnavigator && npm run db:sync-payments >> /var/log/pn-sync.log 2>&1
 */

const API_BASE = "https://api.yookassa.ru/v3";

function authHeader(): string {
  const shopId = process.env.YOOKASSA_SHOP_ID ?? "";
  const secret = process.env.YOOKASSA_SECRET_KEY ?? "";
  return `Basic ${Buffer.from(`${shopId}:${secret}`).toString("base64")}`;
}

function mapStatus(remoteStatus: string): string {
  if (remoteStatus === "succeeded") return "succeeded";
  if (remoteStatus === "canceled") return "canceled";
  return "pending";
}

async function fetchPayment(id: string): Promise<{ id: string; status: string } | null> {
  const response = await fetch(`${API_BASE}/payments/${encodeURIComponent(id)}`, {
    headers: { Authorization: authHeader() },
  });
  if (!response.ok) return null;

  try {
    return (await response.json()) as { id: string; status: string };
  } catch {
    return null;
  }
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL не задан");
  }

  if (!process.env.YOOKASSA_SHOP_ID || !process.env.YOOKASSA_SECRET_KEY) {
    console.log("ЮKassa не настроена (нет YOOKASSA_SHOP_ID / YOOKASSA_SECRET_KEY) — пропускаем.");
    return;
  }

  const client = new Client({ connectionString });
  await client.connect();

  try {
    const { rows } = await client.query<{
      id: string;
      provider_payment_id: string;
      status: string;
    }>(
      `select id, provider_payment_id, status
       from payments
       where status = 'pending'
         and provider_payment_id is not null
         and created_at > now() - interval '2 days'
       order by created_at desc
       limit 100`,
    );

    console.log(`Платежей для синхронизации: ${rows.length}`);

    for (const row of rows) {
      const remote = await fetchPayment(row.provider_payment_id);
      if (!remote?.status) {
        console.warn(`  ${row.id}: не удалось получить статус из ЮKassa`);
        continue;
      }

      const status = mapStatus(remote.status);
      if (status === row.status) {
        console.log(`  ${row.id}: без изменений (${status})`);
        continue;
      }

      await client.query(
        `update payments set status = $2, provider_status = $3, updated_at = now() where id = $1`,
        [row.id, status, remote.status],
      );
      await client.query(
        `insert into payment_events (payment_id, event_type, payload) values ($1, $2, $3)`,
        [row.id, "sync", JSON.stringify(remote)],
      );

      console.log(`  ${row.id}: ${row.status} -> ${status}`);
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
