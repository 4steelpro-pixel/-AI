import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { deletePromoCode, updatePromoCode } from "@/lib/billing/settings";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  try {
    const body = await request.json();
    const patch: {
      discount_percent?: number;
      is_active?: boolean;
      max_uses?: number | null;
      expires_at?: string | null;
    } = {};

    if (body.discount_percent !== undefined) {
      const n = Number(body.discount_percent);
      if (!Number.isFinite(n) || n < 0 || n > 100) {
        return NextResponse.json({ ok: false, error: "Скидка должна быть от 0 до 100%" }, { status: 400 });
      }
      patch.discount_percent = Math.round(n);
    }
    if (typeof body.is_active === "boolean") patch.is_active = body.is_active;
    if (body.max_uses !== undefined) {
      patch.max_uses = body.max_uses === null || body.max_uses === "" ? null : Number(body.max_uses);
    }
    if (body.expires_at !== undefined) patch.expires_at = body.expires_at || null;

    const promo = await updatePromoCode(id, patch);
    if (!promo) {
      return NextResponse.json({ ok: false, error: "Промо-код не найден" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, promo });
  } catch {
    return NextResponse.json({ ok: false, error: "Ошибка обновления промо-кода" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  try {
    const rowCount = await deletePromoCode(id);
    if (!rowCount) {
      return NextResponse.json({ ok: false, error: "Промо-код не найден" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Ошибка удаления промо-кода" }, { status: 500 });
  }
}
