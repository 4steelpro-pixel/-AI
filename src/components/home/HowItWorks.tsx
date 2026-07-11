import { AnalyzeIcon, DownloadIcon, QuestionsIcon, ReportIcon } from "@/components/icons";

const STEPS = [
  {
    icon: QuestionsIcon,
    title: "Отвечаете на вопросы",
    description: "Серии коротких вопросов о ваших интересах, опыте и планах — 10–15 минут.",
  },
  {
    icon: AnalyzeIcon,
    title: "ИИ анализирует профиль и рынок труда",
    description:
      "Учитываются регион, размер населённого пункта, спрос на профессии и риск автоматизации.",
  },
  {
    icon: ReportIcon,
    title: "Получаете отчёт с ТОП-10 профессий",
    description: "Подробный разбор: почему подходит, сложность входа, доход, перспективы.",
  },
  {
    icon: DownloadIcon,
    title: "Скачиваете PDF или DOCX",
    description: "Отчёт остаётся с вами — можно вернуться к нему в любой момент.",
  },
];

export function HowItWorks() {
  return (
    <section className="mt-24 w-full max-w-4xl">
      <h2 className="text-2xl font-semibold text-slate-800 sm:text-3xl">Как это работает</h2>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, index) => (
          <div key={step.title} className="flex flex-col items-center gap-3 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-surface text-brand">
              <step.icon className="h-7 w-7" />
            </span>
            <p className="text-sm font-semibold text-brand">Шаг {index + 1}</p>
            <h3 className="font-semibold text-slate-800">{step.title}</h3>
            <p className="text-sm text-slate-500">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
