import {
  AnalyzeIcon,
  TeenIcon,
  ReportIcon,
  ServiceIcon,
  DownloadIcon,
  ShieldCheckIcon,
} from "@/components/icons";



const ADVANTAGES = [
  {
    icon: AnalyzeIcon,
    title: "Анализ анкеты полностью проводит ИИ",
    description:
      "Нейросеть обрабатывает ваши ответы и формирует персональный отчёт без участия человека.",
  },
  {
    icon: TeenIcon,
    title: "Два трека: для подростков и для взрослых",
    description:
      "Отдельные опросники для подростков и взрослых, кто хочет кардинально сменить род деятельности.",
  },
  {
    icon: ReportIcon,
    title: "Регион + рынок труда + риск автоматизации",
    description:
      "Берём в расчёт конкретный регион, рынок труда и риск автоматизации на 5 лет — всё в одном отчёте.",
  },
  {
    icon: ServiceIcon,
    title: "Заработные платы в регионе",
    description:
      "По подобранным профессиям выделяются зарплаты в регионе на основании открытых вакансий за последний год.",
  },
  {
    icon: DownloadIcon,

    title: "Готовый план перехода в профессию",
    description:
      "Можно скачать PDF/DOCX сразу после прохождения теста и вернуться к отчёту в любой момент.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Данные хранятся на серверах РФ (152-ФЗ)",
    description:
      "Ваши персональные данные защищены и обрабатываются в соответствии с законодательством России.",
  },
];

export function KeyAdvantages() {
  return (
    <section className="mt-24 w-full max-w-4xl">
      <h2 className="text-2xl font-semibold text-slate-800 sm:text-3xl">Ключевые преимущества</h2>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {ADVANTAGES.map((adv) => (
          <div
            key={adv.title}
            className="flex flex-col gap-3 rounded-2xl border border-brand-surface bg-white p-6 text-left shadow-sm"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-surface text-brand">
              <adv.icon className="h-6 w-6" />
            </span>
            <h3 className="font-semibold text-slate-800">{adv.title}</h3>
            <p className="text-sm text-slate-500">{adv.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
