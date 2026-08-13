import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth/utils";

/**
 * Проверяет, что запрос авторизован и роль пользователя — admin.
 * Возвращает { sub } при успехе или NextResponse с ошибкой.
 */
export function requireAdmin(request: NextRequest): { sub: string } | NextResponse {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "").trim();

  if (!token) {
    return NextResponse.json({ ok: false, error: "Токен отсутствует" }, { status: 401 });
  }

  try {
    const decoded = verifyJwt(token);
    if (decoded.role !== "admin") {
      return NextResponse.json({ ok: false, error: "Нет доступа" }, { status: 403 });
    }
    return { sub: decoded.sub };
  } catch {
    return NextResponse.json({ ok: false, error: "Неверный токен" }, { status: 401 });
  }
}
