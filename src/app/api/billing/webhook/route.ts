import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db/client";
import { fetchYooKassaPayment } from "@/lib/billing/yookassa";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function mapRemoteStatus(remoteStatus: string): string {
  if (remoteStatus === "succeeded") return "succeeded";
  if (remoteStatus === "canceled") return "canceled";
  return "pending";
}

/**
 * Вебхук ЮKassa (входящие уведомления: payment.succeeded / payment.canceled).
 *
 * Подлинность проверяем НЕ по телу запроса, а перезапросом платежа из API ЮKassa —
 * это надёжнее и не требует белого списка IP.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const objectId = body?.object?.id ? String(body.object.id) : "";
  const event = body?.event ? String(body.event) : "unknown";

  if (!objectId) {
    return NextResponse.json({ ok: false, error: "object.id required" }, { status: 400 });
  }

  const remote = await fetchYooKassaPayment(objectId);
  if (!remote) {
    // Не удалось подтвердить платёж (ЮKassa недоступна или платёж не найден) —
    // возвращаем ошибку, чтобы ЮKassa повторила уведомление.
    return NextResponse.json({ ok: false, error: "Не удалось подтвердить платёж" }, { status: 502 });
  }

  const pool = getPool();
  const metadata = (remote.metadata ?? {}) as Record<string, unknown>;
  const metadataPaymentId =
    typeof metadata.paymentId === "string" && UUID_RE.test(metadata.paymentId)
      ? metadata.paymentId
      : null;
  const metadataEmail =
    typeof metadata.email === "string" ? metadata.email.trim().toLowerCase() : null;

  const { rows } = await pool.query<{ id: string }>(
    `select id from payments
     where provider_payment_id = $1 or id = $2
     order by (provider_payment_id = $1) desc
     limit 1`,
    [objectId, metadataPaymentId],
  );

  if (rows.length === 0) {
    console.warn("Вебхук ЮKassa: локальный платёж не найден для", objectId);
    return NextResponse.json({ ok: true, matched: false });
  }

  const localPaymentId = rows[0].id;
  const status = mapRemoteStatus(String(remote.status));

  await pool.query(
    `update payments
     set status = $2,
         provider_status = $3,
         provider_payment_id = coalesce(provider_payment_id, $4),
         customer_email = coalesce(customer_email, $5),
         updated_at = now()
     where id = $1`,
    [localPaymentId, status, remote.status, remote.id, metadataEmail],
  );

  await pool.query(
    `insert into payment_events (payment_id, event_type, payload) values ($1, $2, $3)`,
    [localPaymentId, event, JSON.stringify(body)],
  );

  return NextResponse.json({ ok: true, matched: true, status });
}
