import { NextResponse } from "next/server";
import { getSettings } from "@/lib/billing/settings";

export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json({ ok: true, priceCents: settings.price_cents });
  } catch {
    return NextResponse.json({ ok: false, error: "Ошибка загрузки цены" }, { status: 500 });
  }
}
