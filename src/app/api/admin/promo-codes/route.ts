import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { createPromoCode, listPromoCodes } from "@/lib/billing/settings";

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const promoCodes = await listPromoCodes();
    return NextResponse.json({ ok: true, promoCodes });
  } catch {
    return NextResponse.json({ ok: false, error: "Ошибка загрузки промо-кодов" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const code = String(body.code || "").trim();
    const discount = Number(body.discount_percent);
    if (!code) {
      return NextResponse.json({ ok: false, error: "Укажите код" }, { status: 400 });
    }
    if (!Number.isFinite(discount) || discount < 0 || discount > 100) {
      return NextResponse.json({ ok: false, error: "Скидка должна быть от 0 до 100%" }, { status: 400 });
    }

    const promo = await createPromoCode({
      code,
      discount_percent: Math.round(discount),
      is_active: body.is_active !== false,
      max_uses: body.max_uses === undefined || body.max_uses === null || body.max_uses === "" ? null : Number(body.max_uses),
      expires_at: body.expires_at || null,
    });
    return NextResponse.json({ ok: true, promo });
  } catch (error) {
    const message = error instanceof Error && error.message.includes("duplicate")
      ? "Такой промо-код уже существует"
      : "Ошибка создания промо-кода";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
