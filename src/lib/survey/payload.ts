import type { Answers, Category } from "./types";
import { AI_DIALOGUE_POOL, SETTLEMENT_TYPES } from "./questions";

const POPULATION_BY_SETTLEMENT: Record<string, string> = {
  megapolis: "1000000+",
  large_city: "250000-1000000",
  medium_city: "50000-250000",
  small_city: "0-50000",
  village: "rural",
};

function asString(value: Answers[string] | undefined): string {
  return typeof value === "string" ? value : "";
}

function asArray(value: Answers[string] | undefined): string[] {
  return Array.isArray(value) ? value : [];
}

function asScaleGroup(value: Answers[string] | undefined): Record<string, number> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, number>)
    : {};
}

export function buildAnalysisPayload(
  category: Category,
  sessionId: string,
  answers: Answers,
) {
  const settlementType = asString(answers.settlementType);

  const aiDialogueKeys = Object.keys(answers).filter((key) =>
    key.startsWith("aiDialogue_"),
  );

  return {
    meta: {
      category,
      locale: "ru-RU",
      sessionId,
      completedAt: new Date().toISOString(),
    },
    geo: {
      country: asString(answers.country) || "Россия",
      region: asString(answers.region),
      settlementType,
      population: POPULATION_BY_SETTLEMENT[settlementType] ?? "",
    },
    profileCommon: {
      interests: asArray(answers.interests),
      thinkingStyle: asArray(answers.thinkingStyle),
      workFormatPreference: asString(answers.workFormatPreference),
      valuesRanking: asArray(answers.valuesRanking),
      relocationReadiness: asString(answers.relocationReadiness) || undefined,
    },
    teenSpecific:
      category === "teen"
        ? {
            favoriteSubjects: asArray(answers.favoriteSubjects),
            confidenceLevels: asScaleGroup(answers.confidenceLevels),
            successExperience: asString(answers.successExperience),
            studyAttitude: asString(answers.studyAttitude),
            languagePlans: asString(answers.languagePlans),
          }
        : null,
    adultSpecific:
      category === "adult"
        ? {
            currentProfession: asString(answers.currentProfession),
            yearsOfExperience: asString(answers.yearsOfExperience),
            likedAboutCurrentJob: asArray(answers.likedAboutCurrentJob),
            dislikedAboutCurrentJob: asArray(answers.dislikedAboutCurrentJob),
            reasonForChange: asArray(answers.reasonForChange),
            reasonForChangeComment: asString(answers.reasonForChangeComment),
            educationLevel: asString(answers.educationLevel),
            certifications: asString(answers.certifications),
            retrainingReadiness: {
              timeframe: asString(answers.retrainingTimeframe),
              format: asArray(answers.retrainingFormat),
            },
            financialCushionCategory: asString(answers.financialCushionCategory),
            familyLoad: asString(answers.familyLoad) || undefined,
          }
        : null,
    aiDialogue: aiDialogueKeys.map((key) => ({
      question: AI_DIALOGUE_POOL.find((q) => q.key === key)?.label ?? key,
      answer: asString(answers[key]),
    })),
  };
}

export { SETTLEMENT_TYPES };
