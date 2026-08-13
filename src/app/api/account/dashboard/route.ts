import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth/utils";
import { listUserPayments, listUserReports } from "@/lib/account/service";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) {
    return NextResponse.json({ ok: false, error: "Токен отсутствует" }, { status: 401 });
  }

  try {
    const decoded = verifyJwt(token);
    const reports = await listUserReports(decoded.sub);
    const payments = await listUserPayments(decoded.sub);
    return NextResponse.json({ ok: true, reports, payments });
  } catch {
    return NextResponse.json({ ok: false, error: "Неверный токен" }, { status: 401 });
  }
}
