import { getPool } from "@/lib/db/client";

export async function logEvent(
  eventName: string,
  sessionId?: string,
  payload?: Record<string, unknown>,
): Promise<void> {
  if (!process.env.DATABASE_URL) {
    return;
  }

  try {
    await getPool().query(
      "insert into events (session_id, event_name, payload) values ($1, $2, $3)",
      [sessionId ?? null, eventName, payload ? JSON.stringify(payload) : null],
    );
  } catch (error) {
    console.error("Не удалось записать событие аналитики:", eventName, error);
  }
}
