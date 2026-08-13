"use client";

import { FormEvent, useState } from "react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, fullName }),
    });
    const data = await response.json();
    if (data.ok) {
      localStorage.setItem("authToken", data.token);
      window.location.href = "/account";
    } else {
      setMessage(data.error || "Ошибка регистрации");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center justify-center p-8">
      <form onSubmit={onSubmit} className="w-full rounded-2xl border bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold">Регистрация</h1>
        <p className="mt-2 text-sm text-slate-600">Создайте аккаунт для личного кабинета</p>
        <label className="mt-6 block text-sm">Имя</label>
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2" />
        <label className="mt-4 block text-sm">Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2" />
        <label className="mt-4 block text-sm">Пароль</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2" />
        <button className="mt-6 w-full rounded-xl bg-emerald-600 px-4 py-3 font-medium text-white" type="submit">Создать аккаунт</button>
        {message ? <p className="mt-3 text-sm text-red-600">{message}</p> : null}
        <p className="mt-4 text-sm text-slate-500">Есть аккаунт? <a className="text-emerald-700 underline" href="/login">Войти</a></p>
      </form>
    </main>
  );
}
