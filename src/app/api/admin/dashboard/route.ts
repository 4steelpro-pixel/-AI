import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { getStats, listPayments, listReports, listUsers } from "@/lib/admin/service";

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const [stats, users, reports, payments] = await Promise.all([
      getStats(),
      listUsers(100, 0),
      listReports(100, 0),
      listPayments(100, 0),
    ]);

    return NextResponse.json({ ok: true, stats, users, reports, payments });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return NextResponse.json({ ok: false, error: "Ошибка загрузки данных" }, { status: 500 });
  }
}
