import { NextResponse } from "next/server";
import { z } from "zod";
import { logEvent } from "@/lib/analytics/events";

const eventRequestSchema = z.object({
  eventName: z.string(),
  sessionId: z.string().optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = eventRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректное событие" }, { status: 400 });
  }

  await logEvent(parsed.data.eventName, parsed.data.sessionId, parsed.data.payload);

  return NextResponse.json({ ok: true });
}
