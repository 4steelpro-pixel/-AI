import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { deleteUser, setUserActive, setUserRole } from "@/lib/admin/service";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  try {
    if (typeof body.is_active === "boolean") {
      const user = await setUserActive(id, body.is_active);
      if (!user) return NextResponse.json({ ok: false, error: "Пользователь не найден" }, { status: 404 });
      return NextResponse.json({ ok: true, user });
    }

    if (typeof body.role === "string" && ["user", "admin"].includes(body.role)) {
      const user = await setUserRole(id, body.role);
      if (!user) return NextResponse.json({ ok: false, error: "Пользователь не найден" }, { status: 404 });
      return NextResponse.json({ ok: true, user });
    }

    return NextResponse.json({ ok: false, error: "Некорректные данные" }, { status: 400 });
  } catch (error) {
    console.error("Admin user update error:", error);
    return NextResponse.json({ ok: false, error: "Ошибка обновления" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  try {
    const deleted = await deleteUser(id);
    if (!deleted) return NextResponse.json({ ok: false, error: "Пользователь не найден" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin user delete error:", error);
    return NextResponse.json({ ok: false, error: "Ошибка удаления" }, { status: 500 });
  }
}
