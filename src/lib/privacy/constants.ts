export const COOKIE_CONSENT_VERSION = "2026-10-08";
export const PERSONAL_DATA_CONSENT_VERSION = "2026-10-08";

export const COOKIE_CONSENT_COOKIE = "pn_cookie_consent";
export const COOKIE_CONSENT_ID_COOKIE = "pn_consent_id";

export type CookieConsentChoice = "all" | "necessary";

export function isCookieConsentChoice(value: unknown): value is CookieConsentChoice {
  return value === "all" || value === "necessary";
}

export function serializeCookieConsent(choice: CookieConsentChoice): string {
  return `${COOKIE_CONSENT_VERSION}:${choice}`;
}

export function parseCookieConsent(value: string | null | undefined): CookieConsentChoice | null {
  if (!value) return null;
  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return null;
  }
  const [version, choice] = decoded.split(":");
  if (version !== COOKIE_CONSENT_VERSION || !isCookieConsentChoice(choice)) return null;
  return choice;
}
