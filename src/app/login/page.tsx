"use client";

import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (data.ok) {
      localStorage.setItem("authToken", data.token);
      window.location.href = data.user.role === "admin" ? "/admin" : "/account";
    } else {
      setMessage(data.error || "Ошибка входа");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center justify-center p-8">
      <form onSubmit={onSubmit} className="w-full rounded-2xl border bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold">Вход в аккаунт</h1>
        <p className="mt-2 text-sm text-slate-600">Авторизация по email</p>
        <label className="mt-6 block text-sm">Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2" />
        <label className="mt-4 block text-sm">Пароль</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2" />
        <button className="mt-6 w-full rounded-xl bg-emerald-600 px-4 py-3 font-medium text-white" type="submit">Войти</button>
        {message ? <p className="mt-3 text-sm text-red-600">{message}</p> : null}
        <p className="mt-4 text-sm text-slate-500">Нет аккаунта? <a className="text-emerald-700 underline" href="/register">Зарегистрироваться</a></p>
      </form>
    </main>
  );
}
