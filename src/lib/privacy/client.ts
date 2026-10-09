import {
  COOKIE_CONSENT_COOKIE,
  parseCookieConsent,
  type CookieConsentChoice,
} from "./constants";

export const COOKIE_SETTINGS_EVENT = "pn:open-cookie-settings";

export function readCookieConsent(): CookieConsentChoice | null {
  if (typeof document === "undefined") return null;
  const entry = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_CONSENT_COOKIE}=`));

  if (!entry) return null;
  return parseCookieConsent(decodeURIComponent(entry.slice(entry.indexOf("=") + 1)));
}

export function hasAnalyticsConsent(): boolean {
  return readCookieConsent() === "all";
}
