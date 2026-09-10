import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth/utils";
import { updateUserProfile } from "@/lib/account/service";

/** Обновляет имя пользователя (поля профиля личного кабинета). */
export async function PATCH(request: NextRequest) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) {
    return NextResponse.json({ ok: false, error: "Токен отсутствует" }, { status: 401 });
  }

  let userId: string;
  try {
    userId = verifyJwt(token).sub;
  } catch {
    return NextResponse.json({ ok: false, error: "Неверный токен" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const fullName = String(body?.fullName ?? "").trim();

  if (fullName.length > 120) {
    return NextResponse.json({ ok: false, error: "Имя слишком длинное" }, { status: 400 });
  }

  try {
    const user = await updateUserProfile(userId, fullName || null);
    if (!user) {
      return NextResponse.json({ ok: false, error: "Пользователь не найден" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, user });
  } catch (error) {
    console.error("Ошибка обновления профиля:", error);
    return NextResponse.json({ ok: false, error: "Не удалось сохранить изменения" }, { status: 500 });
  }
}
