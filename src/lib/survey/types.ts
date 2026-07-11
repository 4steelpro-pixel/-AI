export type Category = "teen" | "adult";

export type QuestionType = "single" | "multi" | "scale-group" | "ranking" | "text";

export interface SelectOption {
  code: string;
  label: string;
}

export interface ScaleItem {
  key: string;
  label: string;
}

export interface Question {
  key: string;
  label: string;
  hint?: string;
  type: QuestionType;
  options?: SelectOption[];
  scaleItems?: ScaleItem[];
  scaleMax?: number;
  optional?: boolean;
}

export interface QuestionSeries {
  id: string;
  title: string;
  questions: Question[];
}

export type AnswerValue = string | string[] | Record<string, number>;

export type Answers = Record<string, AnswerValue>;
