import { hasAnalyticsConsent } from "@/lib/privacy/client";

export function trackEvent(
  eventName: string,
  sessionId?: string,
  payload?: Record<string, unknown>,
): void {
  if (!hasAnalyticsConsent()) return;
  fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventName, sessionId, payload }),
    keepalive: true,
  }).catch(() => {});
}
