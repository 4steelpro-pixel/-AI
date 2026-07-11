import path from "node:path";
import type { ReactNode } from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { CareerReport } from "./schema";

Font.register({
  family: "Roboto",
  fonts: [
    { src: path.join(process.cwd(), "public/fonts/Roboto-Regular.ttf"), fontWeight: "normal" },
    { src: path.join(process.cwd(), "public/fonts/Roboto-Bold.ttf"), fontWeight: "bold" },
  ],
});

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Roboto", fontSize: 11, color: "#3f3f46" },
  title: { fontSize: 20, fontWeight: "bold", color: "#0f6e56", marginBottom: 16 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#0f6e56",
    marginTop: 16,
    marginBottom: 6,
  },
  paragraph: { marginBottom: 4, lineHeight: 1.4 },
  listItem: { marginBottom: 2 },
  professionCard: {
    marginBottom: 10,
    padding: 8,
    backgroundColor: "#e1f5ee",
    borderRadius: 4,
  },
  professionTitle: { fontSize: 12, fontWeight: "bold", marginBottom: 2 },
  metaLine: { fontSize: 9, color: "#52525b", marginBottom: 1 },
});

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <View>
      {items.map((item, i) => (
        <Text key={i} style={styles.listItem}>
          • {item}
        </Text>
      ))}
    </View>
  );
}

function ReportDocument({ report }: { report: CareerReport }) {
  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.title}>ПрофНавигатор AI — отчёт</Text>

        <Section title="Краткое резюме">
          <Text style={styles.paragraph}>{report.personalitySummary}</Text>
        </Section>

        <Section title="Сильные стороны">
          <BulletList items={report.keyStrengths} />
        </Section>

        <Section title="Возможные ограничения">
          <BulletList items={report.possibleLimitations} />
        </Section>

        <Section title="Психологический профиль">
          <Text style={styles.paragraph}>{report.psychologicalProfile}</Text>
        </Section>

        <Section title="ТОП-10 профессий">
          {report.topProfessions.map((p, i) => (
            <View key={p.title} style={styles.professionCard} wrap={false}>
              <Text style={styles.professionTitle}>
                {i + 1}. {p.title}
              </Text>
              <Text style={styles.paragraph}>{p.whyItFits}</Text>
              <Text style={styles.metaLine}>Сложность входа: {p.entryDifficulty}</Text>
              <Text style={styles.metaLine}>Доход: {p.incomeRangeDescription}</Text>
              <Text style={styles.metaLine}>Удалёнка: {p.remotePossibility}</Text>
              <Text style={styles.metaLine}>Перспектива: {p.growthProspect}</Text>
              <Text style={styles.metaLine}>
                Риск автоматизации (5 лет): {p.automationRiskIn5Years}
              </Text>
              <Text style={styles.metaLine}>
                Востребованность (5 лет): {p.demandProbabilityIn5Years}
              </Text>
            </View>
          ))}
        </Section>

        <Section title="Альтернативные профессии">
          {report.alternativeProfessions.map((a) => (
            <Text key={a.title} style={styles.paragraph}>
              {a.title} — {a.shortReason}
            </Text>
          ))}
        </Section>

        <Section title="План перехода">
          <Text style={styles.paragraph}>1-й месяц: {report.transitionPlan.month1}</Text>
          <Text style={styles.paragraph}>2-й месяц: {report.transitionPlan.month2}</Text>
          <Text style={styles.paragraph}>3-й месяц: {report.transitionPlan.month3}</Text>
          <Text style={styles.paragraph}>6 месяцев: {report.transitionPlan.sixMonths}</Text>
          <Text style={styles.paragraph}>1 год: {report.transitionPlan.oneYear}</Text>
        </Section>

        <Section title="Что изучать">
          {report.whatToLearn.map((item) => (
            <Text key={item.topic} style={styles.paragraph}>
              {item.topic} — {item.suggestedFormat}
            </Text>
          ))}
        </Section>

        <Section title="Уже есть навыки">
          <BulletList items={report.existingSkills} />
        </Section>

        <Section title="Каких навыков не хватает">
          <BulletList items={report.missingSkills} />
        </Section>

        <Section title="Подробное объяснение выбора">
          <Text style={styles.paragraph}>{report.detailedReasoning}</Text>
        </Section>

        <Section title="Итоговая рекомендация">
          <Text style={styles.paragraph}>{report.finalRecommendation}</Text>
        </Section>
      </Page>
    </Document>
  );
}

export async function renderReportPdf(report: CareerReport): Promise<Buffer> {
  return renderToBuffer(<ReportDocument report={report} />);
}
