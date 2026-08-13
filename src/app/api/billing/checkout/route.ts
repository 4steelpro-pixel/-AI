import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db/client";
import { verifyJwt } from "@/lib/auth/utils";
import { getRecommendedProvider } from "@/lib/billing/providers";
import { getSettings, validatePromoCode, incrementPromoUsage } from "@/lib/billing/settings";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) {
    return NextResponse.json({ ok: false, error: "Токен отсутствует" }, { status: 401 });
  }

  try {
    const decoded = verifyJwt(token);
    const body = await request.json();
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

    const pool = getPool();
    const { rows } = await pool.query(
      `insert into payments (user_id, provider, amount_cents, currency, status, metadata)
       values ($1, $2, $3, 'RUB', 'pending', $4)
       returning id, provider, amount_cents, currency, status`,
      [
        decoded.sub,
        provider,
        amountCents,
        {
          product: "career_test_access",
          base_price_cents: basePrice,
          discount_percent: discountPercent,
          promo_code: appliedPromo || null,
        },
      ],
    );

    // Учитываем использование промо-кода
    if (appliedPromo) {
      await incrementPromoUsage(appliedPromo);
    }

    return NextResponse.json({
      ok: true,
      payment: rows[0],
      provider,
      discountPercent,
      basePriceCents: basePrice,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Неверный токен" }, { status: 401 });
  }
}
