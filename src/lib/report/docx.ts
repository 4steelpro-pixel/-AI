import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
} from "docx";
import type { CareerReport } from "./schema";

const BRAND_COLOR = "0F6E56";

function heading(text: string) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
  });
}

function paragraph(text: string) {
  return new Paragraph({ text, spacing: { after: 120 } });
}

function bulletList(items: string[]) {
  return items.map(
    (item) =>
      new Paragraph({ text: item, bullet: { level: 0 }, spacing: { after: 40 } }),
  );
}

export async function renderReportDocx(report: CareerReport): Promise<Buffer> {
  const children: Paragraph[] = [
    new Paragraph({
      children: [
        new TextRun({
          text: "ПрофНавигатор AI — отчёт",
          bold: true,
          size: 36,
          color: BRAND_COLOR,
        }),
      ],
      spacing: { after: 240 },
    }),

    heading("Краткое резюме"),
    paragraph(report.personalitySummary),

    heading("Сильные стороны"),
    ...bulletList(report.keyStrengths),

    heading("Возможные ограничения"),
    ...bulletList(report.possibleLimitations),

    heading("Психологический профиль"),
    paragraph(report.psychologicalProfile),

    heading("ТОП-10 профессий"),
  ];

  report.topProfessions.forEach((p, i) => {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: `${i + 1}. ${p.title}`, bold: true })],
        spacing: { before: 160, after: 40 },
      }),
      paragraph(p.whyItFits),
      paragraph(`Сложность входа: ${p.entryDifficulty}`),
      paragraph(`Доход: ${p.incomeRangeDescription}`),
      paragraph(`Удалёнка: ${p.remotePossibility}`),
      paragraph(`Перспектива: ${p.growthProspect}`),
      paragraph(`Риск автоматизации (5 лет): ${p.automationRiskIn5Years}`),
      paragraph(`Востребованность (5 лет): ${p.demandProbabilityIn5Years}`),
    );
  });

  children.push(
    heading("Альтернативные профессии"),
    ...report.alternativeProfessions.map((a) =>
      paragraph(`${a.title} — ${a.shortReason}`),
    ),

    heading("План перехода"),
    paragraph(`1-й месяц: ${report.transitionPlan.month1}`),
    paragraph(`2-й месяц: ${report.transitionPlan.month2}`),
    paragraph(`3-й месяц: ${report.transitionPlan.month3}`),
    paragraph(`6 месяцев: ${report.transitionPlan.sixMonths}`),
    paragraph(`1 год: ${report.transitionPlan.oneYear}`),

    heading("Что изучать"),
    ...report.whatToLearn.map((item) =>
      paragraph(`${item.topic} — ${item.suggestedFormat}`),
    ),

    heading("Уже есть навыки"),
    ...bulletList(report.existingSkills),

    heading("Каких навыков не хватает"),
    ...bulletList(report.missingSkills),

    heading("Подробное объяснение выбора"),
    paragraph(report.detailedReasoning),

    heading("Итоговая рекомендация"),
    paragraph(report.finalRecommendation),
  );

  const doc = new Document({
    sections: [{ children }],
  });

  return Packer.toBuffer(doc);
}
