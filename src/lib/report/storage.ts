import { getPool } from "@/lib/db/client";
import type { AnalysisRequest } from "@/lib/survey/payloadSchema";
import type { CareerReport } from "./schema";

type AnswerRow = {
  questionKey: string;
  questionText?: string;
  answer: unknown;
  answerType: "choice" | "multi_choice" | "ranking" | "free_text";
};

function flattenAnswers(request: AnalysisRequest): AnswerRow[] {
  const rows: AnswerRow[] = [];

  const pushScalar = (key: string, value: string | undefined) => {
    if (value) rows.push({ questionKey: key, answer: value, answerType: "choice" });
  };
  const pushArray = (key: string, value: string[]) => {
    if (value.length) rows.push({ questionKey: key, answer: value, answerType: "multi_choice" });
  };

  pushScalar("geo.country", request.geo.country);
  pushScalar("geo.region", request.geo.region);
  pushScalar("geo.settlementType", request.geo.settlementType);
  pushArray("profileCommon.interests", request.profileCommon.interests);
  pushArray("profileCommon.thinkingStyle", request.profileCommon.thinkingStyle);
  pushScalar("profileCommon.workFormatPreference", request.profileCommon.workFormatPreference);
  rows.push({
    questionKey: "profileCommon.valuesRanking",
    answer: request.profileCommon.valuesRanking,
    answerType: "ranking",
  });
  pushScalar("profileCommon.relocationReadiness", request.profileCommon.relocationReadiness);

  if (request.teenSpecific) {
    const t = request.teenSpecific;
    pushArray("teenSpecific.favoriteSubjects", t.favoriteSubjects);
    rows.push({
      questionKey: "teenSpecific.confidenceLevels",
      answer: t.confidenceLevels,
      answerType: "choice",
    });
    pushScalar("teenSpecific.successExperience", t.successExperience);
    pushScalar("teenSpecific.studyAttitude", t.studyAttitude);
    pushScalar("teenSpecific.languagePlans", t.languagePlans);
  }

  if (request.adultSpecific) {
    const a = request.adultSpecific;
    pushScalar("adultSpecific.currentProfession", a.currentProfession);
    pushScalar("adultSpecific.yearsOfExperience", a.yearsOfExperience);
    pushArray("adultSpecific.likedAboutCurrentJob", a.likedAboutCurrentJob);
    pushArray("adultSpecific.dislikedAboutCurrentJob", a.dislikedAboutCurrentJob);
    pushArray("adultSpecific.reasonForChange", a.reasonForChange);
    pushScalar("adultSpecific.reasonForChangeComment", a.reasonForChangeComment);
    pushScalar("adultSpecific.educationLevel", a.educationLevel);
    pushScalar("adultSpecific.certifications", a.certifications);
    pushScalar("adultSpecific.retrainingReadiness.timeframe", a.retrainingReadiness.timeframe);
    pushArray("adultSpecific.retrainingReadiness.format", a.retrainingReadiness.format);
    pushScalar("adultSpecific.financialCushionCategory", a.financialCushionCategory);
    pushScalar("adultSpecific.familyLoad", a.familyLoad);
  }

  request.aiDialogue.forEach((entry, index) => {
    rows.push({
      questionKey: `aiDialogue.${index}`,
      questionText: entry.question,
      answer: entry.answer,
      answerType: "free_text",
    });
  });

  return rows;
}

export async function saveReport(
  request: AnalysisRequest,
  report: CareerReport,
): Promise<void> {
  if (!process.env.DATABASE_URL) {
    return;
  }

  const client = await getPool().connect();
  try {
    await client.query("begin");

    await client.query(
      `insert into sessions (id, category, geo, status, completed_at)
       values ($1, $2, $3, 'completed', now())
       on conflict (id) do update set status = 'completed', completed_at = now()`,
      [request.meta.sessionId, request.meta.category, JSON.stringify(request.geo)],
    );

    for (const row of flattenAnswers(request)) {
      await client.query(
        `insert into answers (session_id, question_key, question_text, answer, answer_type)
         values ($1, $2, $3, $4, $5)`,
        [
          request.meta.sessionId,
          row.questionKey,
          row.questionText ?? null,
          JSON.stringify(row.answer),
          row.answerType,
        ],
      );
    }

    await client.query(
      "insert into reports (session_id, raw_llm_response) values ($1, $2)",
      [request.meta.sessionId, JSON.stringify(report)],
    );

    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export async function updateReportObjectKey(
  sessionId: string,
  format: "pdf" | "docx",
  objectKey: string,
): Promise<void> {
  if (!process.env.DATABASE_URL) {
    return;
  }

  const column = format === "pdf" ? "pdf_object_key" : "docx_object_key";
  await getPool().query(
    `update reports set ${column} = $1
     where session_id = $2
     and id = (select id from reports where session_id = $2 order by created_at desc limit 1)`,
    [objectKey, sessionId],
  );
}
