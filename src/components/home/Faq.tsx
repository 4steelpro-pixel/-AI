"use client";

import { useEffect, useState } from "react";

interface FaqItem {
  question: string;
  answer: string;
}

const DEFAULT_FAQ_ITEMS: FaqItem[] = [
  { question: "Платно ли пройти анализ?", answer: "Нет, на данном этапе сервис доступен бесплатно." },
  { question: "Сколько времени занимает опрос?", answer: "Обычно 10–15 минут — вопросы идут короткими сериями по 3–5 штук." },
  { question: "Можно ли пройти повторно?", answer: "Да, вы можете пройти анализ снова в любой момент, например через несколько месяцев." },
  { question: "Что делать с сохранённым отчётом?", answer: "Отчёт можно скачать в формате PDF или DOCX сразу после прохождения анализа." },
  { question: "Нужна ли регистрация?", answer: "Нет, регистрация не требуется — отчёт формируется сразу после ответов на вопросы." },
];

export function Faq() {
  const [items, setItems] = useState<FaqItem[]>(DEFAULT_FAQ_ITEMS);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/faq")
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled && json.ok && Array.isArray(json.items) && json.items.length > 0) {
          setItems(json.items);
        }
      })
      .catch(() => {
        /* оставляем дефолтные вопросы, если API недоступно */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="mt-24 w-full max-w-2xl">
      <h2 className="text-2xl font-semibold text-slate-800 sm:text-3xl">Частые вопросы</h2>
      <div className="mt-6 flex flex-col gap-3">
        {items.map((item) => (
          <details
            key={item.question}
            className="group rounded-xl border border-brand-surface bg-white p-4 text-left open:bg-brand-surface/40"
          >
            <summary className="cursor-pointer list-none font-medium text-slate-800 marker:content-none">
              <span className="flex items-center justify-between gap-2">
                {item.question}
                <span className="text-brand transition-transform group-open:rotate-45">+</span>
              </span>
            </summary>
            <p className="mt-2 text-sm text-slate-500">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
