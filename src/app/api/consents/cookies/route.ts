import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db/client";
import {
  COOKIE_CONSENT_COOKIE,
  COOKIE_CONSENT_ID_COOKIE,
  COOKIE_CONSENT_VERSION,
  isCookieConsentChoice,
  serializeCookieConsent,
} from "@/lib/privacy/constants";

const ONE_YEAR = 60 * 60 * 24 * 365;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const choice = body?.choice;
  if (!isCookieConsentChoice(choice)) {
    return NextResponse.json({ ok: false, error: "Некорректный выбор" }, { status: 400 });
  }

  const existingId = request.cookies.get(COOKIE_CONSENT_ID_COOKIE)?.value;
  const consentId = /^[0-9a-f-]{36}$/i.test(existingId ?? "")
    ? existingId!
    : crypto.randomUUID();

  if (process.env.DATABASE_URL) {
    void getPool()
      .query(
        `insert into consent_records
           (id, consent_type, document_version, decision, source, granted_at)
         values ($1, 'cookies', $2, $3, 'cookie_banner', now())
         on conflict (id) do update
           set document_version = excluded.document_version,
               decision = excluded.decision,
               granted_at = now(),
               withdrawn_at = case when excluded.decision = 'necessary' then now() else null end`,
        [consentId, COOKIE_CONSENT_VERSION, choice],
      )
      .catch((error) => {
        // Выбор пользователя всё равно сохраняется в браузере, даже если БД временно недоступна.
        console.error("Не удалось записать выбор cookie в БД:", error);
      });
  }

  const response = NextResponse.json({ ok: true, choice });
  const secure = process.env.NODE_ENV === "production";
  response.cookies.set(COOKIE_CONSENT_COOKIE, serializeCookieConsent(choice), {
    path: "/",
    maxAge: ONE_YEAR,
    sameSite: "lax",
    secure,
  });
  response.cookies.set(COOKIE_CONSENT_ID_COOKIE, consentId, {
    path: "/",
    maxAge: ONE_YEAR,
    sameSite: "lax",
    secure,
    httpOnly: true,
  });
  return response;
}
