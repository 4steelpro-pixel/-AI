import { z } from "zod";

export const analysisRequestSchema = z.object({
  meta: z.object({
    category: z.enum(["teen", "adult"]),
    locale: z.string(),
    sessionId: z.string(),
    completedAt: z.string(),
  }),
  geo: z.object({
    country: z.string(),
    region: z.string(),
    settlementType: z.string(),
    population: z.string(),
    vahtaReadiness: z.string(),
    teenEducationRelocation: z.string().optional(),
    teenDormReadiness: z.string().optional(),
  }),
  profileCommon: z.object({
    interests: z.array(z.string()),
    thinkingStyle: z.array(z.string()),
    workFormatPreference: z.string(),
    shiftWorkReadiness: z.string(),
    valuesRanking: z.array(z.string()),
    relocationReadiness: z.string().optional(),
    helpingUrgentImportance: z.string(),
    riskResponsibilityWillingness: z.string(),
    hierarchyComfort: z.string(),
    physicalLaborEnjoyment: z.string(),
    energySource: z.string(),
    teamOrSolo: z.string(),
    stressReaction: z.string(),
    detailOrBigPicture: z.string(),
    workPace: z.string(),
    decisionStyle: z.string().optional(),
    noveltyOrPerfection: z.string().optional(),
    leaderOrTeam: z.string().optional(),
    empathyFriendReaction: z.string().optional(),
    empathyImportance: z.string().optional(),
    empathyNotice: z.string().optional(),
    empathyHelpOrTech: z.string().optional(),
    empathyHelpReaction: z.string().optional(),
  }),


  teenSpecific: z
    .object({
      favoriteSubjects: z.array(z.string()),
      confidenceLevels: z.record(z.string(), z.number()),
      extracurricularActivities: z.array(z.string()),
      handsOnAttitude: z.string(),
      successExperience: z.string(),
      studyAttitude: z.string(),
      languagePlans: z.string(),
      attractiveProfessions: z.array(z.string()).optional(),
      specializationAreas: z.array(z.string()).optional(),
      dreamProfession: z.string().optional(),
      educationType: z.string().optional(),
      educationSpeed: z.string().optional(),
      examReadiness: z.string().optional(),
    })
    .nullable(),

  adultSpecific: z
    .object({
      currentProfession: z.string(),
      yearsOfExperience: z.string(),
      likedAboutCurrentJob: z.array(z.string()),
      dislikedAboutCurrentJob: z.array(z.string()),
      reasonForChange: z.array(z.string()),
      reasonForChangeComment: z.string(),
      educationLevel: z.string(),
      certifications: z.string(),
      retrainingReadiness: z.object({
        timeframe: z.string(),
        format: z.array(z.string()),
      }),
      financialCushionCategory: z.string(),
      familyLoad: z.string().optional(),
    })
    .nullable(),
  aiDialogue: z.array(
    z.object({ question: z.string(), answer: z.string() }),
  ),
});

export type AnalysisRequest = z.infer<typeof analysisRequestSchema>;
