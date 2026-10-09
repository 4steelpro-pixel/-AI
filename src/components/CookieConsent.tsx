"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { COOKIE_SETTINGS_EVENT, readCookieConsent } from "@/lib/privacy/client";
import type { CookieConsentChoice } from "@/lib/privacy/constants";

export function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState<CookieConsentChoice | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setOpen(readCookieConsent() === null), 0);
    const showSettings = () => setOpen(true);
    window.addEventListener(COOKIE_SETTINGS_EVENT, showSettings);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(COOKIE_SETTINGS_EVENT, showSettings);
    };
  }, []);

  const save = useCallback(async (choice: CookieConsentChoice) => {
    setSaving(choice);
    try {
      const response = await fetch("/api/consents/cookies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choice }),
      });
      if (!response.ok) throw new Error("Не удалось сохранить выбор");
      setOpen(false);
      window.dispatchEvent(new CustomEvent("pn:cookie-consent-changed", { detail: choice }));
    } catch {
      // Не скрываем окно: пользователь сможет повторить сохранение.
    } finally {
      setSaving(null);
    }
  }, []);

  if (!open) return null;

  return (
    <section
      aria-label="Настройки файлов cookie"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:inset-x-6 sm:bottom-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl text-sm leading-6 text-slate-600">
          <p className="font-semibold text-slate-800">Настройки cookie</p>
          <p className="mt-1">
            Обязательные cookie и локальное хранилище нужны для входа, сохранения оплаченного
            доступа и работы сервиса. С вашего согласия мы также собираем собственную аналитику
            прохождения теста. Подробнее — в{" "}
            <Link href="/cookies" className="font-medium text-brand underline">
              политике использования cookie
            </Link>
            .
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <button
            type="button"
            disabled={saving !== null}
            onClick={() => void save("necessary")}
            className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {saving === "necessary" ? "Сохраняем…" : "Только необходимые"}
          </button>
          <button
            type="button"
            disabled={saving !== null}
            onClick={() => void save("all")}
            className="rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50"
          >
            {saving === "all" ? "Сохраняем…" : "Принять все"}
          </button>
        </div>
      </div>
    </section>
  );
}
