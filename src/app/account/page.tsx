"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";

interface AccountUser {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at?: string;
}

interface ReportItem {
  id: string;
  title: string | null;
  category: string | null;
  status: string;
  file_url: string | null;
  created_at: string;
}

interface PaymentItem {
  id: string;
  provider: string | null;
  amount_cents: number | null;
  currency: string | null;
  status: string | null;
  created_at: string;
}

const PAYMENT_STATUS: Record<string, string> = {
  succeeded: "Оплачен",
  pending: "Ожидает оплаты",
  canceled: "Отменён",
  cancelled: "Отменён",
  failed: "Ошибка оплаты",
  refunded: "Возврат",
};

const CATEGORY_LABEL: Record<string, string> = {
  teen: "Подростки 13–17 лет",
  adult: "Взрослые",
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" });
}

function formatAmount(payment: PaymentItem) {
  if (payment.amount_cents == null) return "—";
  return `${(payment.amount_cents / 100).toLocaleString("ru-RU")} ₽`;
}

export default function AccountPage() {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [access, setAccess] = useState<{ allowed: boolean; requirePayment: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  // Форма профиля
  const [fullName, setFullName] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  // Форма смены пароля
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const authHeaders = useCallback((): HeadersInit => {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const load = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      const [meRes, dashboardRes, accessRes] = await Promise.all([
        fetch("/api/auth/me", { headers: authHeaders() }).then((r) => r.json()),
        fetch("/api/account/dashboard", { headers: authHeaders() }).then((r) => r.json()),
        fetch("/api/billing/access", { headers: authHeaders() }).then((r) => r.json()),
      ]);

      if (meRes?.ok && meRes.user) {
        setUser(meRes.user);
        setFullName(meRes.user.full_name || "");
      }
      if (dashboardRes?.ok) {
        setReports(dashboardRes.reports || []);
        setPayments(dashboardRes.payments || []);
      }
      if (accessRes?.ok) {
        setAccess({ allowed: !!accessRes.allowed, requirePayment: !!accessRes.requirePayment });
      }
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSaveProfile(e: FormEvent) {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage("");
    setProfileError("");
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ fullName }),
      });
      const data = await res.json();
      if (data.ok) {
        setUser((prev) => (prev ? { ...prev, full_name: data.user.full_name } : prev));
        setFullName(data.user.full_name || "");
        setProfileMessage("Имя сохранено.");
      } else {
        setProfileError(data.error || "Не удалось сохранить имя");
      }
    } catch {
      setProfileError("Не удалось сохранить имя");
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    setPasswordMessage("");
    setPasswordError("");

    if (newPassword !== confirmPassword) {
      setPasswordError("Новый пароль и подтверждение не совпадают");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Новый пароль должен быть не короче 6 символов");
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (data.ok) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordMessage("Пароль изменён.");
      } else {
        setPasswordError(data.error || "Не удалось изменить пароль");
      }
    } catch {
      setPasswordError("Не удалось изменить пароль");
    } finally {
      setPasswordSaving(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("authToken");
    window.location.href = "/";
  }

  if (loading) {
    return (
      <main className="mx-auto flex min-h-screen max-w-6xl items-center justify-center p-8">
        <p className="text-slate-500">Загрузка…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="text-sm text-slate-400 hover:text-brand">
          ← На главную
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="text-sm text-slate-400 hover:text-red-600"
        >
          Выйти
        </button>
      </div>

      <h1 className="mt-6 text-3xl font-semibold text-slate-800">Личный кабинет</h1>
      <p className="mt-2 text-slate-600">
        Управляйте профилем, следите за оплатами и скачивайте готовые отчёты.
      </p>

      {/* Статус доступа к тесту */}
      <section className="mt-8">
        {access == null ? null : access.requirePayment ? (
          access.allowed ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
              <div className="text-lg font-semibold text-emerald-800">Доступ к тесту активен</div>
              <p className="mt-1 text-sm text-emerald-700">
                Оплата получена. Вы можете пройти профориентационный тест в любой момент.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/survey/teen"
                  className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  Пройти тест (подростки)
                </Link>
                <Link
                  href="/survey/adult"
                  className="rounded-full border border-emerald-600 px-5 py-3 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
                >
                  Пройти тест (взрослые)
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
              <div className="text-lg font-semibold text-amber-800">Доступ к тесту не оплачен</div>
              <p className="mt-1 text-sm text-amber-700">
                Чтобы пройти тест и получить отчёт, оплатите доступ. Это займёт пару минут.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/billing?category=adult"
                  className="rounded-full bg-amber-600 px-5 py-3 text-sm font-medium text-white hover:bg-amber-700"
                >
                  Оплатить доступ
                </Link>
              </div>
            </div>
          )
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <div className="text-lg font-semibold text-slate-800">Тест доступен бесплатно</div>
            <p className="mt-1 text-sm text-slate-600">
              Оплата не требуется — можно сразу перейти к прохождению теста.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/survey/adult"
                className="rounded-full bg-brand px-5 py-3 text-sm font-medium text-white hover:bg-brand-hover"
              >
                Начать тест
              </Link>
            </div>
          </div>
        )}
      </section>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* Профиль */}
        <section className="rounded-2xl border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-800">Профиль</h2>
          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <p>
              <strong>Email:</strong> {user?.email}
            </p>
            <p>
              <strong>Роль:</strong> {user?.role}
            </p>
            <p>
              <strong>Дата регистрации:</strong> {formatDate(user?.created_at)}
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="mt-5 border-t border-slate-100 pt-5">
            <label className="block text-sm font-medium text-slate-700">Имя</label>
            <input
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setProfileMessage("");
                setProfileError("");
              }}
              placeholder="Как к вам обращаться"
              className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={profileSaving}
              className="mt-3 rounded-xl bg-slate-800 px-5 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {profileSaving ? "Сохранение…" : "Сохранить имя"}
            </button>
            {profileMessage ? (
              <p className="mt-2 text-sm text-emerald-600">{profileMessage}</p>
            ) : null}
            {profileError ? <p className="mt-2 text-sm text-red-600">{profileError}</p> : null}
          </form>
        </section>

        {/* Смена пароля */}
        <section className="rounded-2xl border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-800">Смена пароля</h2>
          <form onSubmit={handleChangePassword} className="mt-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">Текущий пароль</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Новый пароль</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Повторите пароль</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={passwordSaving}
              className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {passwordSaving ? "Изменение…" : "Изменить пароль"}
            </button>
            {passwordMessage ? (
              <p className="text-sm text-emerald-600">{passwordMessage}</p>
            ) : null}
            {passwordError ? <p className="text-sm text-red-600">{passwordError}</p> : null}
          </form>
        </section>
      </div>

      {/* История оплат */}
      <section className="mt-6 rounded-2xl border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-800">История оплат</h2>
        <div className="mt-4 space-y-3">
          {payments.length === 0 ? (
            <p className="text-sm text-slate-500">Платежей пока нет.</p>
          ) : (
            payments.map((p) => (
              <div key={p.id} className="rounded-lg bg-slate-50 p-3 text-sm">
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="font-medium text-slate-700">
                    {PAYMENT_STATUS[p.status ?? ""] ?? p.status ?? "—"}
                  </span>
                  <span className="text-slate-700">{formatAmount(p)}</span>
                </div>
                <div className="mt-1 text-slate-500">
                  {p.provider ?? "—"} • {formatDate(p.created_at)}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Результаты тестов */}
      <section className="mt-6 rounded-2xl border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-800">Результаты тестов</h2>
        <div className="mt-4 space-y-3">
          {reports.length === 0 ? (
            <p className="text-sm text-slate-500">Пока нет пройденных тестов.</p>
          ) : (
            reports.map((report) => (
              <div
                key={report.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 p-3"
              >
                <div>
                  <div className="font-medium text-slate-800">
                    {report.title || "Профориентационный отчёт"}
                  </div>
                  <div className="text-sm text-slate-500">
                    {CATEGORY_LABEL[report.category ?? ""] ?? report.category ?? "—"} •{" "}
                    {formatDate(report.created_at)}
                  </div>
                </div>
                {report.file_url ? (
                  <a href={report.file_url} className="text-emerald-700 underline">
                    Скачать
                  </a>
                ) : (
                  <span className="text-sm text-slate-400">Файл ещё не сформирован</span>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/"
          className="rounded-full border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          На главную
        </Link>
        <Link
          href="/survey/adult"
          className="rounded-full border border-brand px-5 py-3 text-sm font-medium text-brand hover:bg-brand-surface"
        >
          Пройти тест ещё раз
        </Link>
      </div>
    </main>
  );
}
