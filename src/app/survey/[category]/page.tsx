import { notFound } from "next/navigation";
import { SurveyFlow } from "@/components/survey/SurveyFlow";
import type { Category } from "@/lib/survey/types";

const VALID_CATEGORIES: Category[] = ["teen", "adult"];

export default async function SurveyPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  if (!VALID_CATEGORIES.includes(category as Category)) {
    notFound();
  }

  return <SurveyFlow category={category as Category} />;
}
