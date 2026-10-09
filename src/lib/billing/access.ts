import { getPool } from "@/lib/db/client";
import { verifyGuestAccessToken, verifyJwt } from "@/lib/auth/utils";
import { getSettings } from "./settings";

/** Устаревший заголовок оставлен только для плавной миграции существующих оплат. */
export const ACCESS_EMAIL_HEADER = "x-access-email";
/** Устаревший cookie с открытым email; удаляется после обмена на защищённый токен. */
export const ACCESS_EMAIL_COOKIE = "pn_access_email";
/** Подписанный HttpOnly-cookie для гостевого оплаченного доступа. */
export const ACCESS_TOKEN_COOKIE = "pn_access_token";

export interface TestAccess {
  /** Разрешён ли доступ к прохождению теста. */
  allowed: boolean;
  /** Требуется ли оплата для доступа к тесту. */
  requirePayment: boolean;
  /** id пользователя, если распознан действующий токен. */
  userId: string | null;
  /** email, по которому выдан доступ (профиль или оплата). */
  email: string | null;
  /** Доступ получен через старый email-cookie и его следует обменять на токен. */
  usedLegacyEmail: boolean;
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
  const cookie = request.headers.get("cookie") ?? "";
  const tokenMatch = cookie.match(new RegExp(`(?:^|;\\s*)${ACCESS_TOKEN_COOKIE}=([^;]+)`));
  if (tokenMatch) {
    try {
      const email = verifyGuestAccessToken(decodeURIComponent(tokenMatch[1]));
      if (email) return normalizeEmail(email);
    } catch {
      // Продолжаем проверку legacy-значений.
    }
  }

  const fromHeader = normalizeEmail(request.headers.get(ACCESS_EMAIL_HEADER));
  if (fromHeader) return fromHeader;

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

  const cookie = request.headers.get("cookie") ?? "";
  const hasAccessToken = new RegExp(`(?:^|;\\s*)${ACCESS_TOKEN_COOKIE}=`).test(cookie);
  let email = extractAccessEmail(request);
  const usedLegacyEmail = Boolean(email && !hasAccessToken);

  if (!settings.require_payment) {
    return { allowed: true, requirePayment: false, userId, email, usedLegacyEmail };
  }

  if (!userId && !email) {
    return {
      allowed: false,
      requirePayment: true,
      userId: null,
      email: null,
      usedLegacyEmail: false,
    };
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
    return { allowed: false, requirePayment: true, userId, email: null, usedLegacyEmail: false };
  }

  const { rows } = await pool.query(
    `select id from payments
     where status = 'succeeded'
       and (user_id = $1 or lower(customer_email) = lower($2))
     limit 1`,
    [userId, email],
  );

  return { allowed: rows.length > 0, requirePayment: true, userId, email, usedLegacyEmail };
}
