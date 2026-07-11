export function trackEvent(
  eventName: string,
  sessionId?: string,
  payload?: Record<string, unknown>,
): void {
  fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventName, sessionId, payload }),
    keepalive: true,
  }).catch(() => {});
}
