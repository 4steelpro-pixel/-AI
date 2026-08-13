import type { ReactNode } from "react";
import type { CareerReport } from "@/lib/report/schema";

const LEVEL_COLOR = {
  low: "bg-rose-400",
  mid: "bg-amber-400",
  high: "bg-brand",
};

function levelMeta(value: string, levels: string[], goodDirection: "asc" | "desc") {
  const index = Math.max(0, levels.indexOf(value));
  const filled = levels.length > 1 ? index / (levels.length - 1) : 0;
  const goodness = goodDirection === "asc" ? filled : 1 - filled;
  const color = goodness >= 0.66 ? LEVEL_COLOR.high : goodness >= 0.33 ? LEVEL_COLOR.mid : LEVEL_COLOR.low;
  const width = `${Math.round(((index + 1) / levels.length) * 100)}%`;
  return { color, width };
}

function LevelStat({
  label,
  value,
  levels,
  goodDirection,
}: {
  label: string;
  value: string;
  levels: string[];
  goodDirection: "asc" | "desc";
}) {
  const { color, width } = levelMeta(value, levels, goodDirection);
  return (
    <div>
      <dt className="text-slate-400">{label}</dt>
      <dd className="mt-1 flex items-center gap-2">
        <span className="text-slate-700">{value}</span>
        <span className="h-1.5 w-14 overflow-hidden rounded-full bg-slate-100">
          <span className={`block h-full rounded-full ${color}`} style={{ width }} />
        </span>
      </dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-lg font-semibold text-brand-hover">{title}</h3>
      {children}
    </section>
  );
}

function TagList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-full bg-brand-surface px-4 py-1.5 text-sm text-slate-700"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

export function ReportView({ report }: { report: CareerReport }) {
  return (
    <div className="flex flex-col gap-10">
      <Section title="Краткое резюме">
        <p className="whitespace-pre-line text-slate-600">{report.personalitySummary}</p>
      </Section>

      <Section title="Сильные стороны">
        <TagList items={report.keyStrengths} />
      </Section>

      <Section title="Возможные ограничения">
        <TagList items={report.possibleLimitations} />
      </Section>

      <Section title="Психологический профиль">
        <p className="whitespace-pre-line text-slate-600">{report.psychologicalProfile}</p>
        {(report.psychotype || report.empathyLevel) && (
          <dl className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            {report.psychotype && (
              <div>
                <dt className="text-slate-400">Психотип</dt>
                <dd className="mt-1 text-slate-700">{report.psychotype}</dd>
              </div>
            )}
            {report.empathyLevel && (
              <div>
                <dt className="text-slate-400">Уровень эмпатии</dt>
                <dd className="mt-1 text-slate-700">{report.empathyLevel}</dd>
              </div>
            )}
          </dl>
        )}
      </Section>


      <Section title="ТОП-10 профессий">
        <div className="flex flex-col gap-4">
          {report.topProfessions.map((profession, index) => (
            <div
              key={profession.title}
              className="rounded-2xl border border-brand-surface bg-white p-6"
            >
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-semibold text-brand">{index + 1}.</span>
                <h4 className="text-xl font-semibold text-slate-800">{profession.title}</h4>
              </div>
              <p className="mt-2 text-slate-600">{profession.whyItFits}</p>
              {profession.topRoles && profession.topRoles.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-brand-hover">Наиболее доходные должности</p>
                  <ul className="mt-2 flex flex-col gap-1.5">
                    {profession.topRoles.map((role) => (
                      <li key={role.role} className="text-sm text-slate-600">
                        <span className="font-medium text-slate-800">{role.role}</span>
                        {role.incomeRange ? ` — ${role.incomeRange}` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {profession.salaryRegions && profession.salaryRegions.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-semibold text-brand-hover">Где платят больше (при переезде)</p>
                  <ul className="mt-2 flex flex-col gap-1.5">
                    {profession.salaryRegions.map((sr) => (
                      <li key={sr.region} className="text-sm text-slate-600">
                        <span className="font-medium text-slate-800">{sr.region}</span>
                        {sr.salaryRange ? ` — ${sr.salaryRange}` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">

                <LevelStat
                  label="Сложность входа"
                  value={profession.entryDifficulty}
                  levels={["низкая", "средняя", "высокая"]}
                  goodDirection="desc"
                />
                <div>
                  <dt className="text-slate-400">Доход</dt>
                  <dd className="text-slate-700">{profession.incomeRangeDescription}</dd>
                </div>
                <LevelStat
                  label="Удалёнка"
                  value={profession.remotePossibility}
                  levels={["низкая", "средняя", "высокая"]}
                  goodDirection="asc"
                />
                <div>
                  <dt className="text-slate-400">Перспектива</dt>
                  <dd className="text-slate-700">{profession.growthProspect}</dd>
                </div>
                <LevelStat
                  label="Риск автоматизации (5 лет)"
                  value={profession.automationRiskIn5Years}
                  levels={["низкий", "средний", "высокий"]}
                  goodDirection="desc"
                />
                <LevelStat
                  label="Востребованность (5 лет)"
                  value={profession.demandProbabilityIn5Years}
                  levels={["низкая", "средняя", "высокая"]}
                  goodDirection="asc"
                />
              </dl>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Альтернативные профессии">
        <div className="flex flex-col gap-2">
          {report.alternativeProfessions.map((alt) => (
            <p key={alt.title} className="text-slate-600">
              <span className="font-medium text-slate-800">{alt.title}</span> — {alt.shortReason}
            </p>
          ))}
        </div>
      </Section>

      {report.educationRecommendations && report.educationRecommendations.length > 0 && (
        <Section title="Рекомендуемые учебные заведения">
          <div className="flex flex-col gap-4">
            {report.educationRecommendations.map((edu) => (
              <div
                key={edu.institutionName + edu.specialization}
                className="rounded-2xl border border-brand-surface bg-white p-6"
              >
                <div className="flex flex-wrap items-baseline gap-2">
                  <h4 className="text-xl font-semibold text-slate-800">{edu.institutionName}</h4>
                  <span className="rounded-full bg-brand-surface px-3 py-0.5 text-xs font-medium text-brand">
                    {edu.institutionType}
                  </span>
                </div>
                <p className="mt-2 text-slate-600">
                  <span className="font-medium text-slate-800">Специализация:</span> {edu.specialization}
                </p>
                {edu.faculty && (
                  <p className="mt-1 text-slate-600">
                    <span className="font-medium text-slate-800">Факультет / направление:</span> {edu.faculty}
                  </p>
                )}
                <p className="mt-2 text-slate-600">{edu.whyItFits}</p>
                {edu.region && (
                  <p className="mt-2 text-sm text-slate-500">
                    <span className="font-medium text-slate-700">Регион:</span> {edu.region}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {report.bestRelocationRegion && (

        <Section title="Наиболее привлекательный регион для переезда">
          <div className="rounded-2xl border border-brand-surface bg-white p-6">
            <h4 className="text-xl font-semibold text-slate-800">
              {report.bestRelocationRegion.region}
            </h4>
            <p className="mt-2 text-slate-600">{report.bestRelocationRegion.reason}</p>
            {report.bestRelocationRegion.professions &&
              report.bestRelocationRegion.professions.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-semibold text-brand-hover">Профессии с более высоким доходом</p>
                  <TagList items={report.bestRelocationRegion.professions} />
                </div>
              )}
          </div>
        </Section>
      )}

      <Section title="План перехода">

        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["1-й месяц", report.transitionPlan.month1],
            ["2-й месяц", report.transitionPlan.month2],
            ["3-й месяц", report.transitionPlan.month3],
            ["6 месяцев", report.transitionPlan.sixMonths],
            ["1 год", report.transitionPlan.oneYear],
          ].map(([label, text]) => (
            <div key={label} className="rounded-xl bg-brand-surface p-4">
              <p className="text-sm font-semibold text-brand-hover">{label}</p>
              <p className="mt-1 text-sm text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Что изучать">
        <div className="flex flex-col gap-2">
          {report.whatToLearn.map((item) => (
            <p key={item.topic} className="text-slate-600">
              <span className="font-medium text-slate-800">{item.topic}</span> — {item.suggestedFormat}
            </p>
          ))}
        </div>
      </Section>

      <Section title="Уже есть навыки">
        <TagList items={report.existingSkills} />
      </Section>

      <Section title="Каких навыков не хватает">
        <TagList items={report.missingSkills} />
      </Section>

      <Section title="Подробное объяснение выбора">
        <p className="whitespace-pre-line text-slate-600">{report.detailedReasoning}</p>
      </Section>

      <Section title="Итоговая рекомендация">
        <p className="whitespace-pre-line text-slate-600">{report.finalRecommendation}</p>
      </Section>
    </div>
  );
}
