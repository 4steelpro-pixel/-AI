import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db/client";
import { verifyJwt } from "@/lib/auth/utils";
import { getRecommendedProvider } from "@/lib/billing/providers";
import { getSettings, validatePromoCode, incrementPromoUsage } from "@/lib/billing/settings";
import { extractToken, isValidEmail } from "@/lib/billing/access";
import { createYooKassaPayment, isYooKassaConfigured } from "@/lib/billing/yookassa";

/** Базовый адрес сайта для return_url (после оплаты). */
function appBaseUrl(request: NextRequest): string {
  const fromEnv = process.env.APP_BASE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, "");

  const host = request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  return host ? `${proto}://${host}` : "https://profnaviai.ru";
}

/**
 * Создаёт платёж за доступ к тесту и платёж в ЮKassa.
 * Ключевое: платёж привязывается к EMAIL покупателя, поэтому доступ
 * откроется даже без регистрации аккаунта.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ ok: false, error: "Некорректный запрос" }, { status: 400 });
  }

  if (!isYooKassaConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Оплата временно недоступна: приём платежей ещё настраивается. Попробуйте позже или напишите нам.",
      },
      { status: 503 },
    );
  }

  const pool = getPool();

  // Определяем покупателя: он может быть авторизован, а может быть гостем.
  const token = extractToken(request);
  let userId: string | null = null;
  let userEmail: string | null = null;
  if (token) {
    try {
      userId = verifyJwt(token).sub;
      const { rows } = await pool.query<{ email: string | null }>(
        `select email from users where id = $1`,
        [userId],
      );
      userEmail = rows[0]?.email ? String(rows[0].email).trim().toLowerCase() : null;
    } catch {
      userId = null;
    }
  }

  // Email обязателен: именно по нему будет выдан доступ к тесту.
  const email = String(body?.email ?? "").trim().toLowerCase() || userEmail || "";
  if (!isValidEmail(email)) {
    return NextResponse.json(
      { ok: false, error: "Укажите корректный email — на него будет открыт доступ к тесту." },
      { status: 400 },
    );
  }

  // Если гость указал email уже зарегистрированного пользователя — привязываем
  // платёж к его аккаунту, чтобы доступ и отчёты попали в личный кабинет.
  if (!userId) {
    const { rows } = await pool.query<{ id: string }>(
      `select id from users where lower(email) = $1 limit 1`,
      [email],
    );
    userId = rows[0]?.id ?? null;
  }

  const category = body?.category === "teen" ? "teen" : "adult";
  const provider = String(body?.provider || getRecommendedProvider());
  const promoCode = body?.promoCode ? String(body.promoCode).trim() : "";

  const settings = await getSettings();
  const basePrice = settings.price_cents;

  // Применяем промо-код, если он указан
  let discountPercent = 0;
  let appliedPromo = "";
  if (promoCode) {
    const discount = await validatePromoCode(promoCode);
    if (discount === null) {
      return NextResponse.json({ ok: false, error: "Промо-код недействителен" }, { status: 400 });
    }
    discountPercent = discount;
    appliedPromo = promoCode.toUpperCase();
  }

  const amountCents = Math.round((basePrice * (100 - discountPercent)) / 100);

  const metadata = {
    product: "career_test_access",
    category,
    base_price_cents: basePrice,
    discount_percent: discountPercent,
    promo_code: appliedPromo || null,
    email,
  };

  // Локальный платёж создаём первым: его id используем как Idempotence-Key
  // для ЮKassa, поэтому повторный запрос не создаст дубль платежа.
  const { rows } = await pool.query<{ id: string }>(
    `insert into payments (user_id, provider, amount_cents, currency, status, metadata, customer_email)
     values ($1, $2, $3, 'RUB', 'pending', $4, $5)
     returning id`,
    [userId, provider, amountCents, metadata, email],
  );
  const paymentId = rows[0].id;

  try {
    const remote = await createYooKassaPayment({
      amountCents,
      description: `Доступ к профориентационному тесту (${
        category === "teen" ? "подростки 13–17 лет" : "взрослые"
      })`,
      returnUrl: `${appBaseUrl(request)}/billing/success?paymentId=${paymentId}&category=${category}`,
      metadata: { ...metadata, paymentId },
      idempotenceKey: paymentId,
      customerEmail: email,
    });

    const confirmationUrl = remote.confirmation?.confirmation_url ?? null;

    await pool.query(
      `update payments
       set provider_payment_id = $2, provider_status = $3, confirmation_url = $4, updated_at = now()
       where id = $1`,
      [paymentId, remote.id, remote.status, confirmationUrl],
    );

    if (appliedPromo) {
      await incrementPromoUsage(appliedPromo);
    }

    return NextResponse.json({
      ok: true,
      paymentId,
      status: remote.status,
      confirmationUrl,
      amountCents,
      email,
      discountPercent,
      basePriceCents: basePrice,
    });
  } catch (error) {
    await pool.query(
      `update payments set status = 'failed', updated_at = now() where id = $1`,
      [paymentId],
    );
    console.error("Ошибка создания платежа в ЮKassa:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Не удалось создать платёж",
      },
      { status: 502 },
    );
  }
}
