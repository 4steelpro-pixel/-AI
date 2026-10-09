import Link from "next/link";

export default function ExampleReportPage() {
  return (
    <main className="min-h-dvh bg-[#f3fbf8]">
      <header className="sticky top-0 z-10 border-b border-brand-surface/80 bg-[#f3fbf8]/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 transition-colors hover:text-brand"
          >
            <span aria-hidden="true">←</span>
            Вернуться на главную
          </Link>
          <a
            href="/example-report.pdf"
            download
            className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
          >
            Скачать PDF
          </a>
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-5xl flex-col px-3 py-4 sm:px-6 sm:py-6">
        <div className="mb-4 px-1 text-left">
          <h1 className="text-xl font-semibold text-slate-800 sm:text-2xl">
            Пример отчёта
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            В примере нет персональных данных.
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-brand-surface/80 bg-white/80 p-2 shadow-[0_12px_35px_rgba(1,112,132,0.08)] sm:p-3">
          <iframe
            src="/example-report.pdf#view=FitH"
            title="Пример отчёта ПрофНавигатор AI"
            className="h-[calc(100dvh-12rem)] min-h-[32rem] w-full rounded-2xl bg-white"
          />
        </div>

        <p className="mt-4 px-2 text-center text-xs text-slate-500">
          Если документ не отображается, воспользуйтесь кнопкой «Скачать PDF».
        </p>
      </section>
    </main>
  );
}
