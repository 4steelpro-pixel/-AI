import { z } from "zod";

const salaryRegionSchema = z.object({
  region: z.string(),
  salaryRange: z.string(),
});

const professionSchema = z.object({
  title: z.string(),
  whyItFits: z.string(),
  entryDifficulty: z.enum(["низкая", "средняя", "высокая"]),
  incomeRangeDescription: z.string(),
  salarySource: z.string(),
  topRoles: z.array(
    z.object({ role: z.string(), incomeRange: z.string() }),
  ),
  salaryRegions: z.array(salaryRegionSchema),
  remotePossibility: z.enum(["высокая", "средняя", "низкая"]),
  growthProspect: z.string(),
  automationRiskIn5Years: z.enum(["низкий", "средний", "высокий"]),
  demandProbabilityIn5Years: z.enum(["низкая", "средняя", "высокая"]),
});

const educationRecommendationSchema = z.object({
  institutionType: z.enum(["вуз", "колледж", "техникум"]),
  institutionName: z.string(),
  specialization: z.string(),
  faculty: z.string(),
  whyItFits: z.string(),
  region: z.string(),
});

export const reportSchema = z.object({
  personalitySummary: z.string(),
  keyStrengths: z.array(z.string()),
  possibleLimitations: z.array(z.string()),
  psychologicalProfile: z.string(),
  psychotype: z.string().optional(),
  empathyLevel: z.enum(["низкий", "средний", "высокий"]).optional(),
  topProfessions: z.array(professionSchema).min(1),
  alternativeProfessions: z.array(
    z.object({ title: z.string(), shortReason: z.string() }),
  ),
  bestRelocationRegion: z.object({
    region: z.string(),
    reason: z.string(),
    professions: z.array(z.string()),
  }),
  educationRecommendations: z.array(educationRecommendationSchema).optional(),
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
