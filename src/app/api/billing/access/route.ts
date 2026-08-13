import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db/client";
import { verifyJwt } from "@/lib/auth/utils";
import { getSettings } from "@/lib/billing/settings";

/**
 * Проверяет, имеет ли пользователь доступ к прохождению теста.
 * Если настройка require_payment выключена — доступ открыт всем.
 * Если включена — доступ только после успешной оплаты.
 */
export async function GET(request: NextRequest) {
  const settings = await getSettings();

  // Оплата не требуется — доступ открыт всем, токен не нужен
  if (!settings.require_payment) {
    return NextResponse.json({ ok: true, allowed: true, requirePayment: false });
  }

  // Оплата требуется — нужен валидный токен и успешный платёж
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) {
    return NextResponse.json({ ok: false, error: "Токен отсутствует" }, { status: 401 });
  }

  try {
    const decoded = verifyJwt(token);

    // Проверяем наличие успешного платежа у пользователя
    const pool = getPool();
    const { rows } = await pool.query(
      `select id from payments where user_id = $1 and status = 'succeeded' limit 1`,
      [decoded.sub],
    );

    return NextResponse.json({
      ok: true,
      allowed: rows.length > 0,
      requirePayment: true,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Неверный токен" }, { status: 401 });
  }
}


