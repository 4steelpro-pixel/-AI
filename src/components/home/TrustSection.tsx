const POINTS = [
  "Регион и размер населённого пункта — учитываем доступность профессий и рынок труда на месте",
  "Риск автоматизации и рост спроса на профессию на горизонте 5 лет",
  "Склад мышления, интересы, ценности и опыт — а не только 5 вопросов теста",
  "Все сферы профессий наравне: IT, медицина, инженерия, рабочие специальности, госслужба",
];

export function TrustSection() {
  return (
    <section className="mt-24 w-full max-w-3xl">
      <h2 className="text-2xl font-semibold text-slate-800 sm:text-3xl">
        Почему можно доверять анализу
      </h2>
      <p className="mt-3 text-slate-500">
        Это не короткий тест на 5 вопросов, а структурированный анализ по методологии
        карьерного консультирования.
      </p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {POINTS.map((point) => (
          <li
            key={point}
            className="flex items-start gap-2 rounded-xl bg-brand-surface/60 p-4 text-sm text-slate-700"
          >
            <span className="mt-0.5 text-brand" aria-hidden="true">
              ✓
            </span>
            {point}
          </li>
        ))}
      </ul>
    </section>
  );
}
