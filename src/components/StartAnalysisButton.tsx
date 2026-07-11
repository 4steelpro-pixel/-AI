"use client";

import { useState } from "react";
import Link from "next/link";
import { Modal } from "./Modal";

export function StartAnalysisButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-10 rounded-full bg-brand px-10 py-4 text-lg font-medium text-white transition-colors hover:bg-brand-hover"
      >
        Начать анализ
      </button>

      <Modal open={open} onClose={() => setOpen(false)}>
        <h2 className="text-xl font-semibold text-slate-800">
          Кто будет проходить анализ?
        </h2>
        <p className="mt-2 text-slate-500">
          Выберите подходящий вариант, чтобы перейти к опросу.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/survey/teen"
            className="rounded-xl border border-brand-surface bg-brand-surface/60 px-5 py-4 text-left font-medium text-slate-800 transition-colors hover:bg-brand-surface"
          >
            Для подростков 13–17 лет
          </Link>
          <Link
            href="/survey/adult"
            className="rounded-xl border border-brand-surface bg-brand-surface/60 px-5 py-4 text-left font-medium text-slate-800 transition-colors hover:bg-brand-surface"
          >
            Для взрослых
          </Link>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mt-6 text-sm text-slate-400 hover:text-brand"
        >
          Отмена
        </button>
      </Modal>
    </>
  );
}
