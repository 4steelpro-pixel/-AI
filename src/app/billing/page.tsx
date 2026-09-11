"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function BillingContent() {
  const params = useSearchParams();
  const category = params.get("category") || "adult";
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [priceCents, setPriceCents] = useState(29900);
  const [promoCode, setPromoCode] = useState("");
  const [promoStatus, setPromoStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [email, setEmail] = useState("");

  // Загружаем актуальную цену из настроек
  useEffect(() => {
    fetch("/api/billing/price")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.priceCents) setPriceCents(data.priceCents);
      })
      .catch(() => {});
  }, []);

  // Подставляем email: сохранённый ранее или из профиля
  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(() => {
      try {
        const saved = localStorage.getItem("pn_access_email");
        if (saved && !cancelled) setEmail(saved);
      } catch {
        // localStorage может быть недоступен — не критично
      }
    }, 0);

    const token = localStorage.getItem("authToken");
    if (token) {
      fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => res.json())
        .then((data) => {
          if (!cancelled && data?.ok && data.user?.email) setEmail(data.user.email);
        })
        .catch(() => {});
    }

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  async function handleApplyPromo() {
    const code = promoCode.trim();
    if (!code) return;
    setPromoStatus("checking");
    setError("");
    try {
      const res = await fetch("/api/billing/validate-promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data.ok) {
        setDiscountPercent(data.discountPercent);
        setPromoStatus("valid");
      } else {
        setDiscountPercent(0);
        setPromoStatus("invalid");
      }
    } catch {
      setDiscountPercent(0);
      setPromoStatus("invalid");
    }
  }

  const finalPrice = Math.round((priceCents * (100 - discountPercent)) / 100);

  async function handlePay() {
    const trimmedEmail = email.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Укажите корректный email — на него будет открыт доступ к тесту.");
      return;
    }

    const token = localStorage.getItem("authToken");

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          email: trimmedEmail,
          category,
          provider: "yoomoney",
          promoCode: promoStatus === "valid" ? promoCode : "",
        }),
      });
      const data = await response.json();
      setLoading(false);

      if (!data.ok) {
        setError(data.error || "Ошибка оплаты");
        return;
      }

      // Запоминаем email, чтобы доступ к тесту работал и без регистрации
      try {
        localStorage.setItem("pn_access_email", trimmedEmail);
      } catch {
        // localStorage может быть недоступен — не критично
      }

      if (data.confirmationUrl) {
        // Переходим на платёжную форму ЮKassa
        window.location.href = data.confirmationUrl;
        return;
      }

      if (data.status === "succeeded") {
        window.location.replace(`/survey/${category}`);
        return;
      }

      setMessage("Платёж создан. Подтвердите оплату, чтобы открыть доступ к тесту.");
    } catch {
      setLoading(false);
      setError("Не удалось создать платёж. Попробуйте позже.");
    }
  }

  return (
    <main className="mx-auto max-w-3xl p-8">
      <Link href="/" className="mb-4 inline-block text-sm text-slate-400 hover:text-emerald-700">
        ← На главную
      </Link>
      <div className="rounded-3xl border bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">Оплата доступа к тесту</h1>
        <p className="mt-3 text-slate-600">Для прохождения опроса требуется доступ. Мы предлагаем оплату через российский сервис YooMoney / ЮKassa.</p>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
          <div className="font-semibold text-slate-800">Реквизиты получателя</div>
          <dl className="mt-3 grid gap-1 sm:grid-cols-[auto_1fr] sm:gap-x-4">
            <dt>Получатель</dt><dd>ИП Аношин Илья Александрович</dd>
            <dt>ОГРН</dt><dd>311645333900022</dd>
            <dt>ИНН</dt><dd>645393837753</dd>
          </dl>
        </div>

        <div className="mt-6 rounded-2xl bg-emerald-50 p-5 text-sm text-emerald-800">
          <div className="font-semibold">Стоимость доступа</div>
          <div className="mt-2 text-3xl font-semibold">
            {discountPercent > 0 ? (
              <>
                <span className="mr-2 text-lg text-emerald-500 line-through">{(priceCents / 100).toLocaleString("ru-RU")} ₽</span>
                {(finalPrice / 100).toLocaleString("ru-RU")} ₽
              </>
            ) : (
              <>{(priceCents / 100).toLocaleString("ru-RU")} ₽</>
            )}
          </div>
          {discountPercent > 0 ? (
            <div className="mt-1 font-medium text-emerald-700">Скидка {discountPercent}% по промо-коду</div>
          ) : null}
          <div className="mt-2">Поддерживаются русские карты и банковские платежи.</div>
        </div>

        <div className="mt-6">
          <label className="text-sm font-medium text-slate-700">Email для доступа к тесту</label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            placeholder="you@example.com"
            autoComplete="email"
            className="mt-2 w-full rounded-xl border px-4 py-2 text-sm"
          />
          <p className="mt-2 text-xs text-slate-500">
            На этот email будет открыт доступ к тесту после оплаты — регистрация не обязательна.
          </p>
        </div>

        <div className="mt-6">
          <label className="text-sm font-medium text-slate-700">Промо-код</label>
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => {
                setPromoCode(e.target.value);
                setPromoStatus("idle");
                setDiscountPercent(0);
              }}
              placeholder="Введите промо-код"
              className="flex-1 rounded-xl border px-4 py-2 text-sm"
            />
            <button
              type="button"
              onClick={handleApplyPromo}
              disabled={promoStatus === "checking" || !promoCode.trim()}
              className="rounded-xl border px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
            >
              {promoStatus === "checking" ? "Проверка..." : "Применить"}
            </button>
          </div>
          {promoStatus === "valid" ? (
            <p className="mt-2 text-sm text-emerald-600">Промо-код применён: скидка {discountPercent}%</p>
          ) : null}
          {promoStatus === "invalid" ? (
            <p className="mt-2 text-sm text-red-600">Промо-код недействителен</p>
          ) : null}
        </div>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
        {message ? <p className="mt-4 text-sm text-slate-600">{message}</p> : null}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button onClick={handlePay} disabled={loading} className="rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white disabled:opacity-70">
            {loading ? "Подождите..." : "Оплатить и продолжить"}
          </button>
          <Link
            href="/"
            className="rounded-xl border border-slate-300 px-5 py-3 font-medium text-slate-600 hover:bg-slate-50"
          >
            На главную
          </Link>
          <Link
            href="/account"
            className="rounded-xl border border-slate-300 px-5 py-3 font-medium text-slate-600 hover:bg-slate-50"
          >
            Личный кабинет
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="p-8">Загрузка...</div>}>
      <BillingContent />
    </Suspense>
  );
}
