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
 * Возвращает статус платежа для страницы /billing/success.
 * Если платёж ещё не финальный — синхронизирует его напрямую с ЮKassa,
 * чтобы доступ открывался даже при задержке вебхука.
 */
export async function GET(request: NextRequest) {
  const paymentId = request.nextUrl.searchParams.get("paymentId")?.trim() ?? "";

  if (!UUID_RE.test(paymentId)) {
    return NextResponse.json({ ok: false, error: "Некорректный paymentId" }, { status: 400 });
  }

  try {
    const pool = getPool();
    const { rows } = await pool.query<{
      id: string;
      status: string | null;
      provider_payment_id: string | null;
      customer_email: string | null;
      amount_cents: number | null;
      metadata: Record<string, unknown> | null;
    }>(
      `select id, status, provider_payment_id, customer_email, amount_cents, metadata
       from payments where id = $1`,
      [paymentId],
    );

    const payment = rows[0];
    if (!payment) {
      return NextResponse.json({ ok: false, error: "Платёж не найден" }, { status: 404 });
    }

    let status = payment.status ?? "pending";

    if (status !== "succeeded" && status !== "canceled" && payment.provider_payment_id) {
      const remote = await fetchYooKassaPayment(payment.provider_payment_id);
      if (remote?.status) {
        const nextStatus = mapRemoteStatus(String(remote.status));
        if (nextStatus !== status) {
          await pool.query(
            `update payments set status = $2, provider_status = $3, updated_at = now() where id = $1`,
            [paymentId, nextStatus, remote.status],
          );
        }
        status = nextStatus;
      }
    }

    const metadata = (payment.metadata ?? {}) as Record<string, unknown>;

    return NextResponse.json({
      ok: true,
      paymentId,
      status,
      email: payment.customer_email,
      amountCents: payment.amount_cents,
      category: typeof metadata.category === "string" ? metadata.category : null,
    });
  } catch (error) {
    console.error("Ошибка проверки статуса платежа:", error);
    return NextResponse.json({ ok: false, error: "Ошибка проверки статуса" }, { status: 500 });
  }
}
