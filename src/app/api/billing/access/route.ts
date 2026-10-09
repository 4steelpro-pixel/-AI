import { NextRequest, NextResponse } from "next/server";
import { signGuestAccessToken } from "@/lib/auth/utils";
import {
  ACCESS_EMAIL_COOKIE,
  ACCESS_TOKEN_COOKIE,
  checkTestAccess,
} from "@/lib/billing/access";

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
    const response = NextResponse.json({
      ok: true,
      allowed: access.allowed,
      requirePayment: access.requirePayment,
    });
    if (access.allowed && access.usedLegacyEmail && access.email) {
      response.cookies.set(ACCESS_TOKEN_COOKIE, signGuestAccessToken(access.email), {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
      response.cookies.set(ACCESS_EMAIL_COOKIE, "", { path: "/", maxAge: 0 });
    }
    return response;
  } catch {
    return NextResponse.json({ ok: false, error: "Ошибка проверки доступа" }, { status: 500 });
  }
}

