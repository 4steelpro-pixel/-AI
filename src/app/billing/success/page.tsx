"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

/** Ключ, по которому сохраняем email доступа (оплата без регистрации). */
export const ACCESS_EMAIL_KEY = "pn_access_email";

function saveAccessEmail(email: string) {
  try {
    localStorage.setItem(ACCESS_EMAIL_KEY, email);
    document.cookie = `${ACCESS_EMAIL_KEY}=${encodeURIComponent(email)}; path=/; max-age=${
      60 * 60 * 24 * 365
    }; SameSite=Lax`;
  } catch {
    // localStorage/cookie могут быть недоступны — не критично
  }
}

type Status = "loading" | "pending" | "succeeded" | "canceled" | "error";

const MAX_POLLS = 10;
const POLL_INTERVAL_MS = 4000;

function SuccessContent() {
  const params = useSearchParams();
  const paymentId = params.get("paymentId") || "";
  const category = params.get("category") === "teen" ? "teen" : "adult";

  const [status, setStatus] = useState<Status>("loading");
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [polls, setPolls] = useState(0);

  const check = useCallback(async () => {
    if (!paymentId) {
      setStatus("error");
      setError("Не указан идентификатор платежа.");
      return;
    }
    try {
      const res = await fetch(`/api/billing/status?paymentId=${encodeURIComponent(paymentId)}`);
      const data = await res.json();
      if (!data.ok) {
        setStatus("error");
        setError(data.error || "Не удалось получить статус платежа.");
        return;
      }
      if (data.email) {
        setEmail(data.email);
        saveAccessEmail(data.email);
      }
      if (data.status === "succeeded") setStatus("succeeded");
      else if (data.status === "canceled") setStatus("canceled");
      else setStatus("pending");
    } catch {
      setStatus("error");
      setError("Не удалось получить статус платежа. Проверьте соединение и обновите страницу.");
    }
  }, [paymentId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void check();
    }, 0);
    return () => clearTimeout(timer);
  }, [check]);

  // Пока платёж в обработке — периодически перепроверяем статус
  useEffect(() => {
    if (status !== "pending" || polls >= MAX_POLLS) return;
    const timer = setTimeout(() => {
      setPolls((value) => value + 1);
      check();
    }, POLL_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [status, polls, check]);

  return (
    <main className="mx-auto max-w-3xl p-8">
      <Link href="/" className="mb-4 inline-block text-sm text-slate-400 hover:text-emerald-700">
        ← На главную
      </Link>

      <div className="rounded-3xl border bg-white p-8 shadow-sm">
        {status === "loading" ? (
          <>
            <h1 className="text-2xl font-semibold">Проверяем оплату…</h1>
            <p className="mt-3 text-slate-600">Это займёт пару секунд.</p>
          </>
        ) : null}

        {status === "succeeded" ? (
          <>
            <h1 className="text-2xl font-semibold text-emerald-700">Оплата получена</h1>
            <p className="mt-3 text-slate-600">
              Доступ к тесту открыт{email ? <> для <strong>{email}</strong></> : null}. Можно
              проходить профориентационный тест.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/survey/${category}`}
                className="rounded-xl bg-emerald-600 px-6 py-3 font-medium text-white hover:bg-emerald-700"
              >
                Пройти тест
              </Link>
              <Link
                href="/account"
                className="rounded-xl border border-slate-300 px-6 py-3 font-medium text-slate-600 hover:bg-slate-50"
              >
                Личный кабинет
              </Link>
            </div>
            {email ? (
              <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                Доступ привязан к email <strong>{email}</strong>. Если зарегистрируетесь с этим же
                email, отчёты появятся в личном кабинете.
              </p>
            ) : null}
          </>
        ) : null}

        {status === "pending" ? (
          <>
            <h1 className="text-2xl font-semibold">Оплата обрабатывается</h1>
            <p className="mt-3 text-slate-600">
              Мы ждём подтверждение от ЮKassa. Страница обновится автоматически.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={check}
                className="rounded-xl bg-emerald-600 px-6 py-3 font-medium text-white hover:bg-emerald-700"
              >
                Проверить ещё раз
              </button>
              <Link
                href="/"
                className="rounded-xl border border-slate-300 px-6 py-3 font-medium text-slate-600 hover:bg-slate-50"
              >
                На главную
              </Link>
            </div>
            {polls >= MAX_POLLS ? (
              <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
                Если оплата прошла, а доступ не открылся в течение 10–15 минут — напишите на{" "}
                <a href="mailto:info@profnaviai.ru" className="underline">
                  info@profnaviai.ru
                </a>
                .
              </p>
            ) : null}
          </>
        ) : null}

        {status === "canceled" ? (
          <>
            <h1 className="text-2xl font-semibold text-red-700">Платёж отменён</h1>
            <p className="mt-3 text-slate-600">
              Деньги не списаны. Вы можете попробовать оплатить доступ ещё раз.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/billing?category=${category}`}
                className="rounded-xl bg-emerald-600 px-6 py-3 font-medium text-white hover:bg-emerald-700"
              >
                Оплатить снова
              </Link>
              <Link
                href="/"
                className="rounded-xl border border-slate-300 px-6 py-3 font-medium text-slate-600 hover:bg-slate-50"
              >
                На главную
              </Link>
            </div>
          </>
        ) : null}

        {status === "error" ? (
          <>
            <h1 className="text-2xl font-semibold text-red-700">Не удалось проверить оплату</h1>
            <p className="mt-3 text-slate-600">{error}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={check}
                className="rounded-xl bg-emerald-600 px-6 py-3 font-medium text-white hover:bg-emerald-700"
              >
                Повторить
              </button>
              <Link
                href="/account"
                className="rounded-xl border border-slate-300 px-6 py-3 font-medium text-slate-600 hover:bg-slate-50"
              >
                Личный кабинет
              </Link>
            </div>
          </>
        ) : null}
      </div>
    </main>
  );
}

export default function BillingSuccessPage() {
  return (
    <Suspense fallback={<div className="p-8">Загрузка…</div>}>
      <SuccessContent />
    </Suspense>
  );
}
