import { NextRequest, NextResponse } from "next/server";
import { signJwt, verifyPassword } from "@/lib/auth/utils";
import { getPool } from "@/lib/db/client";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "");

  if (!email || !password) {
    return NextResponse.json({ ok: false, error: "Email и пароль обязательны" }, { status: 400 });
  }

  const pool = getPool();
  const { rows } = await pool.query(
    `select id, email, password_hash, full_name, role, is_active from users where email = $1`,
    [email],
  );

  const user = rows[0];
  if (!user) {
    return NextResponse.json({ ok: false, error: "Неверный логин или пароль" }, { status: 401 });
  }

  if (!user.is_active) {
    return NextResponse.json({ ok: false, error: "Аккаунт заблокирован" }, { status: 403 });
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return NextResponse.json({ ok: false, error: "Неверный логин или пароль" }, { status: 401 });
  }

  const token = signJwt({ sub: user.id, role: user.role });

  return NextResponse.json({
    ok: true,
    user: { id: user.id, email: user.email, fullName: user.full_name, role: user.role },
    token,
  });
}
