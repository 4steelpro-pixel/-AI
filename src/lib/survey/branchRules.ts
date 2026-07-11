import type { Answers, Category, QuestionSeries } from "./types";
import { getRelocationSeries } from "./questions";

export interface BranchRule {
  id: string;
  appliesToCategory?: Category;
  afterSeriesId: string;
  condition: (answers: Answers) => boolean;
  buildSeries: (answers: Answers) => QuestionSeries;
}

export const BRANCH_RULES: BranchRule[] = [
  {
    id: "relocation",
    afterSeriesId: "common-format-values",
    condition: (answers) =>
      answers.workFormatPreference === "travel" && answers.settlementType === "village",
    buildSeries: () => getRelocationSeries(),
  },
];

export function getApplicableRules(category: Category): BranchRule[] {
  return BRANCH_RULES.filter(
    (rule) => !rule.appliesToCategory || rule.appliesToCategory === category,
  );
}
