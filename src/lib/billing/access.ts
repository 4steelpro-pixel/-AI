import { getPool } from "@/lib/db/client";
import { verifyJwt } from "@/lib/auth/utils";
import { getSettings } from "./settings";

export interface TestAccess {
  /** Разрешён ли доступ к прохождению теста. */
  allowed: boolean;
  /** Требуется ли оплата для доступа к тесту. */
  requirePayment: boolean;
  /** id пользователя, если удалось распознать действующий токен. */
  userId: string | null;
}

/** Извлекает Bearer-токен из заголовка Authorization. */
export function extractToken(request: Request): string {
  const authHeader = request.headers.get("authorization") || "";
  return authHeader.replace("Bearer ", "").trim();
}

/**
 * Проверяет доступ к тесту.
 * Если настройка require_payment выключена — доступ открыт всем.
 * Если включена — доступ только после успешной оплаты (и только авторизованным).
 */
export async function checkTestAccess(request: Request): Promise<TestAccess> {
  const settings = await getSettings();
  const token = extractToken(request);

  let userId: string | null = null;
  if (token) {
    try {
      userId = verifyJwt(token).sub;
    } catch {
      userId = null;
    }
  }

  if (!settings.require_payment) {
    return { allowed: true, requirePayment: false, userId };
  }

  if (!userId) {
    return { allowed: false, requirePayment: true, userId: null };
  }

  const pool = getPool();
  const { rows } = await pool.query(
    `select id from payments where user_id = $1 and status = 'succeeded' limit 1`,
    [userId],
  );

  return { allowed: rows.length > 0, requirePayment: true, userId };
}
