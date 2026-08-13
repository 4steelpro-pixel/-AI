import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth/utils";
import { getPool } from "@/lib/db/client";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "").trim();

  if (!token) {
    return NextResponse.json({ ok: false, error: "Токен отсутствует" }, { status: 401 });
  }

  try {
    const decoded = verifyJwt(token);
    const pool = getPool();
    const { rows } = await pool.query(
      `select id, email, full_name, role, is_active, created_at from users where id = $1`,
      [decoded.sub],
    );

    const user = rows[0];
    if (!user) {
      return NextResponse.json({ ok: false, error: "Пользователь не найден" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        is_active: user.is_active,
        created_at: user.created_at,
      },
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Неверный токен" }, { status: 401 });
  }
}
