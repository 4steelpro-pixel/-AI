"use client";

import { COOKIE_SETTINGS_EVENT } from "@/lib/privacy/client";

export function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT))}
      className="hover:text-brand"
    >
      Настройки cookie
    </button>
  );
}
