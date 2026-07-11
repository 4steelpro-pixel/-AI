import type { ReactNode } from "react";
import type { CareerReport } from "@/lib/report/schema";

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
              <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-slate-400">Сложность входа</dt>
                  <dd className="text-slate-700">{profession.entryDifficulty}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">Доход</dt>
                  <dd className="text-slate-700">{profession.incomeRangeDescription}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">Удалёнка</dt>
                  <dd className="text-slate-700">{profession.remotePossibility}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">Перспектива</dt>
                  <dd className="text-slate-700">{profession.growthProspect}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">Риск автоматизации (5 лет)</dt>
                  <dd className="text-slate-700">{profession.automationRiskIn5Years}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">Востребованность (5 лет)</dt>
                  <dd className="text-slate-700">{profession.demandProbabilityIn5Years}</dd>
                </div>
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
