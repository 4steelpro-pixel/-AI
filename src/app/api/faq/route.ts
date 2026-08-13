import { NextResponse } from "next/server";
import { getFaqItems } from "@/lib/billing/settings";

export async function GET() {
  try {
    const items = await getFaqItems();
    return NextResponse.json({ ok: true, items });
  } catch {
    return NextResponse.json({ ok: false, error: "Ошибка загрузки FAQ" }, { status: 500 });
  }
}
