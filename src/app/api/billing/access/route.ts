import { NextRequest, NextResponse } from "next/server";
import { checkTestAccess } from "@/lib/billing/access";

/**
 * Проверяет, имеет ли пользователь доступ к прохождению теста.
 * Если настройка require_payment выключена — доступ открыт всем.
 * Если включена — доступ только после успешной оплаты.
 *
 * Гость (без токена) получает allowed: false, requirePayment: true —
 * это позволяет перенаправить его на страницу оплаты без обязательной регистрации.
 */
export async function GET(request: NextRequest) {
  try {
    const access = await checkTestAccess(request);
    return NextResponse.json({
      ok: true,
      allowed: access.allowed,
      requirePayment: access.requirePayment,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Ошибка проверки доступа" }, { status: 500 });
  }
}


