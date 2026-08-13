import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db/client";
import { createOtpCode } from "@/lib/auth/utils";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const email = String(body?.email || "").trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ ok: false, error: "Email обязателен" }, { status: 400 });
  }

  const pool = getPool();
  const otp = createOtpCode();

  await pool.query(
    `insert into user_sessions (user_id, token_hash, expires_at)
     values ((select id from users where email = $1), $2, now() + interval '15 minutes')
     on conflict do nothing`,
    [email, otp],
  );

  return NextResponse.json({ ok: true, message: "Если email найден, мы отправили код восстановления", otp });
}
