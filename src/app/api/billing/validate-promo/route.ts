import { NextRequest, NextResponse } from "next/server";
import { validatePromoCode } from "@/lib/billing/settings";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const code = String(body?.code || "").trim();
    if (!code) {
      return NextResponse.json({ ok: false, error: "Укажите промо-код" }, { status: 400 });
    }

    const discountPercent = await validatePromoCode(code);
    if (discountPercent === null) {
      return NextResponse.json({ ok: false, error: "Промо-код недействителен" }, { status: 400 });
    }

    return NextResponse.json({ ok: true, discountPercent, code: code.toUpperCase() });
  } catch {
    return NextResponse.json({ ok: false, error: "Ошибка проверки промо-кода" }, { status: 500 });
  }
}
