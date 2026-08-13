import { NextRequest, NextResponse } from "next/server";
import { hashPassword, signJwt } from "@/lib/auth/utils";
import { getPool } from "@/lib/db/client";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "");
  const fullName = String(body?.fullName || "").trim();

  if (!email || !password) {
    return NextResponse.json({ ok: false, error: "Email и пароль обязательны" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ ok: false, error: "Пароль должен быть не короче 6 символов" }, { status: 400 });
  }

  const pool = getPool();

  const existing = await pool.query(`select id from users where email = $1`, [email]);
  if (existing.rows.length > 0) {
    return NextResponse.json({ ok: false, error: "Пользователь уже зарегистрирован" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);

  const { rows } = await pool.query(
    `insert into users (email, password_hash, full_name, role)
     values ($1, $2, $3, 'user')
     returning id, email, full_name, role, created_at`,
    [email, passwordHash, fullName || null],
  );

  const user = rows[0];
  const token = signJwt({ sub: user.id, role: user.role });

  return NextResponse.json({
    ok: true,
    user: { id: user.id, email: user.email, fullName: user.full_name, role: user.role },
    token,
  });
}
