"use client";

import { useCallback, useEffect, useState } from "react";

type Tab = "overview" | "users" | "reports" | "payments" | "settings" | "promo" | "faq";

interface Stats {
  users_total: number;
  users_admins: number;
  users_active: number;
  reports_total: number;
  payments_total: number;
  revenue_cents: number;
  payments_succeeded: number;
  payments_pending: number;
}

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface Report {
  id: string;
  title: string;
  category: string;
  status: string;
  file_url: string | null;
  user_email: string | null;
  created_at: string;
}

interface Payment {
  id: string;
  provider: string;
  amount_cents: number;
  currency: string;
  status: string;
  user_email: string | null;
  created_at: string;
}

interface AppSettings {
  require_payment: boolean;
  price_cents: number;
}

interface PromoCode {
  id: string;
  code: string;
  discount_percent: number;
  is_active: boolean;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  created_at: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface DashboardData {
  stats: Stats;
  users: User[];
  reports: Report[];
  payments: Payment[];
}

const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Обзор" },
  { key: "users", label: "Пользователи" },
  { key: "reports", label: "Отчёты" },
  { key: "payments", label: "Платежи" },
  { key: "settings", label: "Настройки" },
  { key: "promo", label: "Промо-коды" },
  { key: "faq", label: "Частые вопросы" },
];

function formatDate(value: string) {
  return new Date(value).toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" });
}

function formatMoney(cents: number) {
  return (cents / 100).toLocaleString("ru-RU") + " ₽";
}

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);

  // Форма создания промо-кода
  const [newCode, setNewCode] = useState("");
  const [newDiscount, setNewDiscount] = useState("10");
  const [newMaxUses, setNewMaxUses] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  const load = useCallback(async () => {
    if (!token) {
      window.location.href = "/login";
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await response.json();
      if (!json.ok) {
        setError(json.error || "Ошибка загрузки");
        if (response.status === 401 || response.status === 403) {
          window.location.href = "/login";
        }
        return;
      }
      setData(json);
    } catch {
      setError("Ошибка сети");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const loadSettings = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch("/api/admin/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await response.json();
      if (json.ok) setSettings(json.settings);
    } catch {
      /* ignore */
    }
  }, [token]);

  const loadPromoCodes = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch("/api/admin/promo-codes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await response.json();
      if (json.ok) setPromoCodes(json.promoCodes);
    } catch {
      /* ignore */
    }
  }, [token]);

  const loadFaqItems = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch("/api/admin/faq", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await response.json();
      if (json.ok) setFaqItems(json.items);
    } catch {
      /* ignore */
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (tab === "settings") loadSettings();
    if (tab === "promo") loadPromoCodes();
    if (tab === "faq") loadFaqItems();
  }, [tab, loadSettings, loadPromoCodes, loadFaqItems]);

  async function updateUser(id: string, body: Record<string, unknown>) {
    if (!token) return;
    setMessage("");
    const response = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    const json = await response.json();
    if (json.ok) {
      setMessage("Сохранено");
      load();
    } else {
      setMessage(json.error || "Ошибка");
    }
  }

  async function deleteUser(id: string) {
    if (!token) return;
    if (!confirm("Удалить пользователя? Это действие необратимо.")) return;
    setMessage("");
    const response = await fetch(`/api/admin/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await response.json();
    if (json.ok) {
      setMessage("Пользователь удалён");
      load();
    } else {
      setMessage(json.error || "Ошибка");
    }
  }

  async function saveSettings(patch: Partial<AppSettings>) {
    if (!token) return;
    setMessage("");
    const response = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(patch),
    });
    const json = await response.json();
    if (json.ok) {
      setSettings(json.settings);
      setMessage("Настройки сохранены");
    } else {
      setMessage(json.error || "Ошибка");
    }
  }

  async function createPromo() {
    if (!token) return;
    setMessage("");
    const response = await fetch("/api/admin/promo-codes", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        code: newCode,
        discount_percent: Number(newDiscount),
        max_uses: newMaxUses === "" ? null : Number(newMaxUses),
      }),
    });
    const json = await response.json();
    if (json.ok) {
      setMessage("Промо-код создан");
      setNewCode("");
      setNewDiscount("10");
      setNewMaxUses("");
      loadPromoCodes();
    } else {
      setMessage(json.error || "Ошибка");
    }
  }

  async function updatePromo(id: string, patch: Record<string, unknown>) {
    if (!token) return;
    setMessage("");
    const response = await fetch(`/api/admin/promo-codes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(patch),
    });
    const json = await response.json();
    if (json.ok) {
      setMessage("Сохранено");
      loadPromoCodes();
    } else {
      setMessage(json.error || "Ошибка");
    }
  }

  async function deletePromo(id: string) {
    if (!token) return;
    if (!confirm("Удалить промо-код?")) return;
    setMessage("");
    const response = await fetch(`/api/admin/promo-codes/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await response.json();
    if (json.ok) {
      setMessage("Промо-код удалён");
      loadPromoCodes();
    } else {
      setMessage(json.error || "Ошибка");
    }
  }

  async function saveFaq() {
    if (!token) return;
    setMessage("");
    const response = await fetch("/api/admin/faq", {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ items: faqItems }),
    });
    const json = await response.json();
    if (json.ok) {
      setFaqItems(json.items);
      setMessage("FAQ сохранён");
    } else {
      setMessage(json.error || "Ошибка");
    }
  }

  function addFaqItem() {
    setFaqItems((prev) => [...prev, { question: "", answer: "" }]);
  }

  function removeFaqItem(index: number) {
    setFaqItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateFaqItem(index: number, field: "question" | "answer", value: string) {
    setFaqItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }

  function logout() {
    localStorage.removeItem("authToken");
    window.location.href = "/login";
  }

  if (loading) return <div className="p-8">Загрузка админки...</div>;

  const stats = data?.stats;

  return (
    <main className="mx-auto max-w-6xl p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Админ-панель</h1>
          <p className="mt-1 text-slate-600">Управление пользователями, отчётами, платежами и настройками.</p>
        </div>
        <button onClick={logout} className="rounded-xl border px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
          Выйти
        </button>
      </div>

      {message ? <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      <nav className="mt-6 flex gap-2 border-b">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${
              tab === t.key
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === "overview" && stats ? (
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border p-5">
            <div className="text-sm text-slate-500">Пользователи</div>
            <div className="mt-1 text-3xl font-semibold">{stats.users_total}</div>
            <div className="mt-1 text-xs text-slate-400">активных: {stats.users_active} • админов: {stats.users_admins}</div>
          </div>
          <div className="rounded-2xl border p-5">
            <div className="text-sm text-slate-500">Отчёты</div>
            <div className="mt-1 text-3xl font-semibold">{stats.reports_total}</div>
          </div>
          <div className="rounded-2xl border p-5">
            <div className="text-sm text-slate-500">Платежи</div>
            <div className="mt-1 text-3xl font-semibold">{stats.payments_total}</div>
            <div className="mt-1 text-xs text-slate-400">успешных: {stats.payments_succeeded} • ожидают: {stats.payments_pending}</div>
          </div>
          <div className="rounded-2xl border p-5">
            <div className="text-sm text-slate-500">Выручка</div>
            <div className="mt-1 text-3xl font-semibold">{formatMoney(stats.revenue_cents)}</div>
          </div>
        </section>
      ) : null}

      {tab === "users" ? (
        <section className="mt-6 overflow-x-auto rounded-2xl border">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Имя</th>
                <th className="px-4 py-3">Роль</th>
                <th className="px-4 py-3">Статус</th>
                <th className="px-4 py-3">Регистрация</th>
                <th className="px-4 py-3">Действия</th>
              </tr>
            </thead>
            <tbody>
              {(data?.users || []).map((u) => (
                <tr key={u.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{u.email}</td>
                  <td className="px-4 py-3">{u.full_name || "—"}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => updateUser(u.id, { role: e.target.value })}
                      className="rounded-lg border px-2 py-1 text-sm"
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${u.is_active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                      {u.is_active ? "активен" : "заблокирован"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(u.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateUser(u.id, { is_active: !u.is_active })}
                        className="rounded-lg border px-2 py-1 text-xs hover:bg-slate-50"
                      >
                        {u.is_active ? "Заблокировать" : "Разблокировать"}
                      </button>
                      <button
                        onClick={() => deleteUser(u.id)}
                        className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                      >
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(data?.users || []).length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">Пользователей пока нет</td></tr>
              ) : null}
            </tbody>
          </table>
        </section>
      ) : null}

      {tab === "reports" ? (
        <section className="mt-6 overflow-x-auto rounded-2xl border">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3">Название</th>
                <th className="px-4 py-3">Категория</th>
                <th className="px-4 py-3">Статус</th>
                <th className="px-4 py-3">Пользователь</th>
                <th className="px-4 py-3">Дата</th>
                <th className="px-4 py-3">Файл</th>
              </tr>
            </thead>
            <tbody>
              {(data?.reports || []).map((r) => (
                <tr key={r.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{r.title}</td>
                  <td className="px-4 py-3">{r.category}</td>
                  <td className="px-4 py-3">{r.status}</td>
                  <td className="px-4 py-3 text-slate-500">{r.user_email || "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(r.created_at)}</td>
                  <td className="px-4 py-3">
                    {r.file_url ? (
                      <a href={r.file_url} target="_blank" rel="noreferrer" className="text-emerald-700 underline">Скачать</a>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {(data?.reports || []).length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">Отчётов пока нет</td></tr>
              ) : null}
            </tbody>
          </table>
        </section>
      ) : null}

      {tab === "payments" ? (
        <section className="mt-6 overflow-x-auto rounded-2xl border">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3">Провайдер</th>
                <th className="px-4 py-3">Сумма</th>
                <th className="px-4 py-3">Валюта</th>
                <th className="px-4 py-3">Статус</th>
                <th className="px-4 py-3">Пользователь</th>
                <th className="px-4 py-3">Дата</th>
              </tr>
            </thead>
            <tbody>
              {(data?.payments || []).map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="px-4 py-3">{p.provider}</td>
                  <td className="px-4 py-3 font-medium">{formatMoney(p.amount_cents)}</td>
                  <td className="px-4 py-3">{p.currency}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${
                      p.status === "succeeded" ? "bg-emerald-100 text-emerald-700" :
                      p.status === "pending" ? "bg-amber-100 text-amber-700" :
                      "bg-slate-100 text-slate-600"
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{p.user_email || "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(p.created_at)}</td>
                </tr>
              ))}
              {(data?.payments || []).length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">Платежей пока нет</td></tr>
              ) : null}
            </tbody>
          </table>
        </section>
      ) : null}

      {tab === "settings" ? (
        <section className="mt-6 max-w-2xl rounded-2xl border p-6">
          <h2 className="text-xl font-semibold">Настройки доступа</h2>
          <p className="mt-1 text-sm text-slate-500">Управление доступом к прохождению тестов.</p>

          {settings ? (
            <div className="mt-6 flex flex-col gap-6">
              <div className="flex items-center justify-between rounded-xl border p-4">
                <div>
                  <div className="font-medium">Тесты после оплаты</div>
                  <div className="text-sm text-slate-500">
                    {settings.require_payment
                      ? "Тест доступен только после успешной оплаты"
                      : "Тест доступен всем без оплаты"}
                  </div>
                </div>
                <button
                  onClick={() => saveSettings({ require_payment: !settings.require_payment })}
                  className={`relative h-7 w-14 rounded-full transition-colors ${settings.require_payment ? "bg-emerald-600" : "bg-slate-300"}`}
                >
                  <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${settings.require_payment ? "left-8" : "left-1"}`} />
                </button>
              </div>

              <div className="rounded-xl border p-4">
                <label className="font-medium">Стоимость доступа (₽)</label>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    value={settings.price_cents / 100}
                    onChange={(e) => {
                      const rub = Number(e.target.value);
                      if (Number.isFinite(rub) && rub > 0) {
                        setSettings({ ...settings, price_cents: Math.round(rub * 100) });
                      }
                    }}
                    className="w-32 rounded-lg border px-3 py-2 text-sm"
                  />
                  <button
                    onClick={() => saveSettings({ price_cents: settings.price_cents })}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                  >
                    Сохранить цену
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-400">Загрузка настроек...</p>
          )}
        </section>
      ) : null}

      {tab === "promo" ? (
        <section className="mt-6">
          <div className="rounded-2xl border p-6">
            <h2 className="text-xl font-semibold">Создать промо-код</h2>
            <div className="mt-4 flex flex-wrap items-end gap-3">
              <div>
                <label className="text-sm text-slate-500">Код</label>
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="PROMO10"
                  className="mt-1 rounded-lg border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-slate-500">Скидка, %</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={newDiscount}
                  onChange={(e) => setNewDiscount(e.target.value)}
                  className="mt-1 w-24 rounded-lg border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm text-slate-500">Лимит использований (пусто = без лимита)</label>
                <input
                  type="number"
                  min={1}
                  value={newMaxUses}
                  onChange={(e) => setNewMaxUses(e.target.value)}
                  placeholder="Без лимита"
                  className="mt-1 w-40 rounded-lg border px-3 py-2 text-sm"
                />
              </div>
              <button
                onClick={createPromo}
                disabled={!newCode.trim() || !newDiscount}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                Создать
              </button>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto rounded-2xl border">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3">Код</th>
                  <th className="px-4 py-3">Скидка</th>
                  <th className="px-4 py-3">Статус</th>
                  <th className="px-4 py-3">Использовано</th>
                  <th className="px-4 py-3">Лимит</th>
                  <th className="px-4 py-3">Создан</th>
                  <th className="px-4 py-3">Действия</th>
                </tr>
              </thead>
              <tbody>
                {promoCodes.map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">{p.code}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        defaultValue={p.discount_percent}
                        onBlur={(e) => {
                          const v = Number(e.target.value);
                          if (Number.isFinite(v) && v !== p.discount_percent) {
                            updatePromo(p.id, { discount_percent: v });
                          }
                        }}
                        className="w-20 rounded-lg border px-2 py-1 text-sm"
                      />
                      <span className="ml-1">%</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${p.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                        {p.is_active ? "активен" : "выключен"}
                      </span>
                    </td>
                    <td className="px-4 py-3">{p.used_count}</td>
                    <td className="px-4 py-3">{p.max_uses ?? "∞"}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(p.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => updatePromo(p.id, { is_active: !p.is_active })}
                          className="rounded-lg border px-2 py-1 text-xs hover:bg-slate-50"
                        >
                          {p.is_active ? "Выключить" : "Включить"}
                        </button>
                        <button
                          onClick={() => deletePromo(p.id)}
                          className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                        >
                          Удалить
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {promoCodes.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-400">Промо-кодов пока нет</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {tab === "faq" ? (
        <section className="mt-6 max-w-3xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Частые вопросы</h2>
              <p className="mt-1 text-sm text-slate-500">
                Редактирование блока «Частые вопросы» на главной странице.
              </p>
            </div>
            <button
              onClick={addFaqItem}
              className="rounded-lg border border-emerald-600 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
            >
              + Добавить вопрос
            </button>
          </div>

          <div className="mt-6 flex flex-col gap-4">
            {faqItems.map((item, index) => (
              <div key={index} className="rounded-2xl border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Вопрос {index + 1}</span>
                  <button
                    onClick={() => removeFaqItem(index)}
                    className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                  >
                    Удалить
                  </button>
                </div>
                <label className="mt-3 block text-sm text-slate-500">Вопрос</label>
                <input
                  type="text"
                  value={item.question}
                  onChange={(e) => updateFaqItem(index, "question", e.target.value)}
                  placeholder="Введите вопрос"
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                />
                <label className="mt-3 block text-sm text-slate-500">Ответ</label>
                <textarea
                  value={item.answer}
                  onChange={(e) => updateFaqItem(index, "answer", e.target.value)}
                  placeholder="Введите ответ"
                  rows={3}
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>
            ))}
            {faqItems.length === 0 ? (
              <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-slate-400">
                Вопросов пока нет. Нажмите «+ Добавить вопрос».
              </p>
            ) : null}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={saveFaq}
              disabled={faqItems.length === 0}
              className="rounded-lg bg-emerald-600 px-6 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              Сохранить FAQ
            </button>
          </div>
        </section>
      ) : null}
    </main>
  );
}
