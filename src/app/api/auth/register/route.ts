import { NextRequest, NextResponse } from "next/server";
import { hashPassword, signJwt } from "@/lib/auth/utils";
import { getPool } from "@/lib/db/client";
import { PERSONAL_DATA_CONSENT_VERSION } from "@/lib/privacy/constants";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "");
  const fullName = String(body?.fullName || "").trim();
  const consentGranted = body?.consentGranted === true;
  const consentVersion = String(body?.consentVersion || "");

  if (!email || !password) {
    return NextResponse.json({ ok: false, error: "Email и пароль обязательны" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ ok: false, error: "Пароль должен быть не короче 6 символов" }, { status: 400 });
  }
  if (!consentGranted || consentVersion !== PERSONAL_DATA_CONSENT_VERSION) {
    return NextResponse.json(
      { ok: false, error: "Необходимо подтвердить актуальную редакцию согласия" },
      { status: 400 },
    );
  }

  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query("begin");
    const existing = await client.query(`select id from users where email = $1`, [email]);
    if (existing.rows.length > 0) {
      await client.query("rollback");
      return NextResponse.json(
        { ok: false, error: "Пользователь уже зарегистрирован" },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);
    const { rows } = await client.query(
      `insert into users (email, password_hash, full_name, role)
       values ($1, $2, $3, 'user')
       returning id, email, full_name, role, created_at`,
      [email, passwordHash, fullName || null],
    );
    const user = rows[0];

    await client.query(
      `insert into consent_records
         (user_id, consent_type, document_version, decision, subject_age_group, source)
       values ($1, 'personal_data', $2, 'granted', 'adult_or_14_plus', 'registration')`,
      [user.id, PERSONAL_DATA_CONSENT_VERSION],
    );
    await client.query("commit");

    const token = signJwt({ sub: user.id, role: user.role });
    return NextResponse.json({
      ok: true,
      user: { id: user.id, email: user.email, fullName: user.full_name, role: user.role },
      token,
    });
  } catch (error) {
    await client.query("rollback");
    console.error("Ошибка регистрации:", error);
    return NextResponse.json({ ok: false, error: "Не удалось создать аккаунт" }, { status: 500 });
  } finally {
    client.release();
  }
}
