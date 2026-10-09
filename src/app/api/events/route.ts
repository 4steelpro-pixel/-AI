import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { logEvent } from "@/lib/analytics/events";
import { COOKIE_CONSENT_COOKIE, parseCookieConsent } from "@/lib/privacy/constants";

const eventRequestSchema = z.object({
  eventName: z.string(),
  sessionId: z.string().optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  if (parseCookieConsent(request.cookies.get(COOKIE_CONSENT_COOKIE)?.value) !== "all") {
    return NextResponse.json({ ok: false, error: "Аналитика отключена" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = eventRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректное событие" }, { status: 400 });
  }

  await logEvent(parsed.data.eventName, parsed.data.sessionId, parsed.data.payload);

  return NextResponse.json({ ok: true });
}
