import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { getFaqItems, saveFaqItems } from "@/lib/billing/settings";

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const items = await getFaqItems();
    return NextResponse.json({ ok: true, items });
  } catch {
    return NextResponse.json({ ok: false, error: "Ошибка загрузки FAQ" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const items = Array.isArray(body.items) ? body.items : [];
    const saved = await saveFaqItems(items);
    return NextResponse.json({ ok: true, items: saved });
  } catch {
    return NextResponse.json({ ok: false, error: "Ошибка сохранения FAQ" }, { status: 500 });
  }
}
