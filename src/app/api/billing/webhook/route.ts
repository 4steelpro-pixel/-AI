import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db/client";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const pool = getPool();

  const paymentId = body?.paymentId || body?.metadata?.paymentId;
  if (!paymentId) {
    return NextResponse.json({ ok: false, error: "paymentId required" }, { status: 400 });
  }

  await pool.query(
    `insert into payment_events (payment_id, event_type, payload)
     values ($1, $2, $3)`,
    [paymentId, "webhook", body],
  );

  await pool.query(
    `update payments set status = $1, provider_status = $2, updated_at = now() where id = $3`,
    [body?.status || "succeeded", body?.providerStatus || "succeeded", paymentId],
  );

  return NextResponse.json({ ok: true });
}
