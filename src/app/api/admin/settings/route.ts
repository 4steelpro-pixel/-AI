import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { getSettings, saveSettings } from "@/lib/billing/settings";

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const settings = await getSettings();
    return NextResponse.json({ ok: true, settings });
  } catch {
    return NextResponse.json({ ok: false, error: "Ошибка загрузки настроек" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const patch: { require_payment?: boolean; price_cents?: number } = {};
    if (typeof body.require_payment === "boolean") patch.require_payment = body.require_payment;
    if (body.price_cents !== undefined) {
      const n = Number(body.price_cents);
      if (Number.isFinite(n) && n > 0) patch.price_cents = Math.round(n);
    }
    const settings = await saveSettings(patch);
    return NextResponse.json({ ok: true, settings });
  } catch {
    return NextResponse.json({ ok: false, error: "Ошибка сохранения настроек" }, { status: 500 });
  }
}
