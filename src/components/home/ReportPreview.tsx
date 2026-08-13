const LEVEL_WIDTH: Record<string, string> = {
  низкая: "33%",
  низкий: "33%",
  средняя: "66%",
  средний: "66%",
  высокая: "100%",
  высокий: "100%",
};

function PreviewStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="mt-1 flex items-center gap-2">
        <span className="text-sm text-slate-700">{value}</span>
        <span className="h-1.5 w-14 overflow-hidden rounded-full bg-slate-100">
          <span
            className={`block h-full rounded-full ${color}`}
            style={{ width: LEVEL_WIDTH[value] }}
          />
        </span>
      </dd>
    </div>
  );
}

export function ReportPreview() {
  return (
    <section className="mt-24 w-full max-w-2xl">
      <h2 className="text-2xl font-semibold text-slate-800 sm:text-3xl">Пример из отчёта</h2>
      <p className="mt-2 text-slate-500">Так выглядит одна из десяти профессий в вашем отчёте.</p>
      <div className="mt-6 rounded-2xl border border-brand-surface bg-white p-6 text-left shadow-sm">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-brand">1.</span>
          <h3 className="text-xl font-semibold text-slate-800">Специалист по искусственному интеллекту</h3>
        </div>
        <p className="mt-2 text-slate-600">
          Интерес к технологиям и инженерии, опыт работы с нейросетями и анализом данных,
          предпочтение к работе в одиночку.
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
          <PreviewStat label="Сложность входа" value="средняя" color="bg-amber-400" />
          <PreviewStat label="Риск автоматизации (5 лет)" value="средний" color="bg-amber-400" />
          <PreviewStat label="Востребованность (5 лет)" value="высокая" color="bg-brand" />
        </dl>
        <div className="mt-4 rounded-xl bg-brand-surface/60 p-4">
          <dt className="text-xs text-slate-400">Доход</dt>
          <dd className="mt-1 text-sm font-medium text-slate-800">
            от 100 000 до 200 000 рублей в зависимости от опыта и региона
          </dd>
        </div>
      </div>
      <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl border border-brand-surface bg-white p-6 text-center shadow-sm">
        <p className="text-slate-600">
          Хотите увидеть полный отчёт? Скачайте пример — в нём нет персональных данных.
        </p>
        <a
          href="/example-report.pdf"
          download
          className="mt-2 rounded-full bg-brand px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
        >
          Скачать пример отчёта (PDF)
        </a>
      </div>
    </section>
  );
}
