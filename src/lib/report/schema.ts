import { z } from "zod";

const professionSchema = z.object({
  title: z.string(),
  whyItFits: z.string(),
  entryDifficulty: z.enum(["низкая", "средняя", "высокая"]),
  incomeRangeDescription: z.string(),
  remotePossibility: z.enum(["высокая", "средняя", "низкая"]),
  growthProspect: z.string(),
  automationRiskIn5Years: z.enum(["низкий", "средний", "высокий"]),
  demandProbabilityIn5Years: z.enum(["низкая", "средняя", "высокая"]),
});

export const reportSchema = z.object({
  personalitySummary: z.string(),
  keyStrengths: z.array(z.string()),
  possibleLimitations: z.array(z.string()),
  psychologicalProfile: z.string(),
  topProfessions: z.array(professionSchema).min(1),
  alternativeProfessions: z.array(
    z.object({ title: z.string(), shortReason: z.string() }),
  ),
  transitionPlan: z.object({
    month1: z.string(),
    month2: z.string(),
    month3: z.string(),
    sixMonths: z.string(),
    oneYear: z.string(),
  }),
  whatToLearn: z.array(
    z.object({ topic: z.string(), suggestedFormat: z.string() }),
  ),
  existingSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  detailedReasoning: z.string(),
  finalRecommendation: z.string(),
});

export type CareerReport = z.infer<typeof reportSchema>;
