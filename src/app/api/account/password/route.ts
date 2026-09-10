import { NextRequest, NextResponse } from "next/server";
import { hashPassword, verifyJwt, verifyPassword } from "@/lib/auth/utils";
import { getUserWithPasswordHash, updateUserPassword } from "@/lib/account/service";

/** Меняет пароль пользователя после проверки текущего пароля. */
export async function POST(request: NextRequest) {
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
  const currentPassword = String(body?.currentPassword || "");
  const newPassword = String(body?.newPassword || "");

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { ok: false, error: "Укажите текущий и новый пароль" },
      { status: 400 },
    );
  }
  if (newPassword.length < 6) {
    return NextResponse.json(
      { ok: false, error: "Новый пароль должен быть не короче 6 символов" },
      { status: 400 },
    );
  }

  try {
    const user = await getUserWithPasswordHash(userId);
    if (!user) {
      return NextResponse.json({ ok: false, error: "Пользователь не найден" }, { status: 404 });
    }
    if (!user.password_hash) {
      return NextResponse.json({ ok: false, error: "Смена пароля недоступна" }, { status: 400 });
    }

    const valid = await verifyPassword(currentPassword, user.password_hash);
    if (!valid) {
      return NextResponse.json({ ok: false, error: "Текущий пароль указан неверно" }, { status: 400 });
    }

    const passwordHash = await hashPassword(newPassword);
    await updateUserPassword(userId, passwordHash);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Ошибка смены пароля:", error);
    return NextResponse.json({ ok: false, error: "Не удалось изменить пароль" }, { status: 500 });
  }
}
