"use client";

import { useEffect, useState } from "react";

export default function AccountPage() {
  const [user, setUser] = useState<any>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    Promise.all([
      fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch("/api/account/dashboard", { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ])
      .then(([userResponse, dashboardResponse]) => {
        setUser(userResponse.user);
        setDashboard(dashboardResponse);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Загрузка...</div>;

  return (
    <main className="mx-auto max-w-6xl p-8">
      <h1 className="text-3xl font-semibold">Личный кабинет</h1>
      <p className="mt-2 text-slate-600">Просматривайте результаты, оплаты и доступ к прохождению теста.</p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border p-6">
          <h2 className="text-xl font-semibold">Профиль</h2>
          <div className="mt-4 space-y-2 text-sm">
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Имя:</strong> {user?.full_name || "—"}</p>
            <p><strong>Роль:</strong> {user?.role}</p>
          </div>
        </section>

        <section className="rounded-2xl border p-6">
          <h2 className="text-xl font-semibold">Оплаты</h2>
          <div className="mt-4 space-y-3">
            {(dashboard?.payments || []).length === 0 ? <p>Платежей пока нет.</p> : dashboard.payments.map((p: any) => (
              <div key={p.id} className="rounded-lg bg-slate-50 p-3 text-sm">
                <div className="flex justify-between">
                  <span>{p.provider}</span>
                  <span>{p.amount_cents / 100} ₽</span>
                </div>
                <div className="text-slate-500">{p.status}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-8 rounded-2xl border p-6">
        <h2 className="text-xl font-semibold">Результаты тестов</h2>
        <div className="mt-4 space-y-3">
          {(dashboard?.reports || []).length === 0 ? <p>Пока нет пройденных тестов.</p> : dashboard.reports.map((report: any) => (
            <div key={report.id} className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
              <div>
                <div className="font-medium">{report.title}</div>
                <div className="text-sm text-slate-500">{report.category} • {report.status}</div>
              </div>
              {report.file_url ? <a href={report.file_url} className="text-emerald-700 underline">Скачать</a> : <span className="text-slate-400">Файл не готов</span>}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
