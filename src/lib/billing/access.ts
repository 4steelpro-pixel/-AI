import { getPool } from "@/lib/db/client";
import { verifyJwt } from "@/lib/auth/utils";
import { getSettings } from "./settings";

/** Заголовок, которым клиент передаёт email доступа (оплата без регистрации). */
export const ACCESS_EMAIL_HEADER = "x-access-email";
/** Cookie с email доступа — дублирует заголовок для надёжности. */
export const ACCESS_EMAIL_COOKIE = "pn_access_email";

export interface TestAccess {
  /** Разрешён ли доступ к прохождению теста. */
  allowed: boolean;
  /** Требуется ли оплата для доступа к тесту. */
  requirePayment: boolean;
  /** id пользователя, если распознан действующий токен. */
  userId: string | null;
  /** email, по которому выдан доступ (профиль или оплата). */
  email: string | null;
}

/** Извлекает Bearer-токен из заголовка Authorization. */
export function extractToken(request: Request): string {
  const authHeader = request.headers.get("authorization") || "";
  return authHeader.replace("Bearer ", "").trim();
}

/** Простая проверка формата email. */
export function isValidEmail(value: string): boolean {
  return value.length > 0 && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** Приводит email к каноническому виду (trim + lowercase) или возвращает null. */
export function normalizeEmail(value: string | null | undefined): string | null {
  const email = String(value ?? "").trim().toLowerCase();
  return isValidEmail(email) ? email : null;
}

/**
 * Возвращает email доступа из заголовка X-Access-Email или cookie pn_access_email.
 * Используется, когда пользователь оплатил доступ, но не регистрировался.
 */
export function extractAccessEmail(request: Request): string | null {
  const fromHeader = normalizeEmail(request.headers.get(ACCESS_EMAIL_HEADER));
  if (fromHeader) return fromHeader;

  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${ACCESS_EMAIL_COOKIE}=([^;]+)`));
  if (!match) return null;

  try {
    return normalizeEmail(decodeURIComponent(match[1]));
  } catch {
    return normalizeEmail(match[1]);
  }
}

/**
 * Проверяет доступ к тесту.
 * 1) Если оплата не требуется — доступ открыт всем.
 * 2) Если требуется — доступ есть при успешной оплате:
 *    - по аккаунту (user_id), либо
 *    - по email, указанному при оплате (доступ без регистрации).
 */
export async function checkTestAccess(request: Request): Promise<TestAccess> {
  const settings = await getSettings();

  let userId: string | null = null;
  const token = extractToken(request);
  if (token) {
    try {
      userId = verifyJwt(token).sub;
    } catch {
      userId = null;
    }
  }

  let email = extractAccessEmail(request);

  if (!settings.require_payment) {
    return { allowed: true, requirePayment: false, userId, email };
  }

  if (!userId && !email) {
    return { allowed: false, requirePayment: true, userId: null, email: null };
  }

  const pool = getPool();

  // Если клиент авторизован — берём email из профиля. Это позволяет получить
  // доступ, если оплата была сделана как гость с тем же email (или наоборот).
  if (userId && !email) {
    const { rows } = await pool.query<{ email: string | null }>(
      `select email from users where id = $1`,
      [userId],
    );
    email = normalizeEmail(rows[0]?.email);
  }

  if (!email) {
    return { allowed: false, requirePayment: true, userId, email: null };
  }

  const { rows } = await pool.query(
    `select id from payments
     where status = 'succeeded'
       and (user_id = $1 or lower(customer_email) = lower($2))
     limit 1`,
    [userId, email],
  );

  return { allowed: rows.length > 0, requirePayment: true, userId, email };
}
