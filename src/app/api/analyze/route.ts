import { NextResponse } from "next/server";
import { analysisRequestSchema } from "@/lib/survey/payloadSchema";
import { reportSchema } from "@/lib/report/schema";
import { requestCareerAnalysis } from "@/lib/report/yandexgpt";
import { saveReport } from "@/lib/report/storage";
import { logEvent } from "@/lib/analytics/events";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsedRequest = analysisRequestSchema.safeParse(body);

  if (!parsedRequest.success) {
    return NextResponse.json(
      { error: "Некорректный формат данных анкеты", details: parsedRequest.error.flatten() },
      { status: 400 },
    );
  }

  let rawReport: unknown;
  try {
    rawReport = await requestCareerAnalysis(parsedRequest.data);
  } catch (error) {
    await logEvent("analysis_failed", parsedRequest.data.meta.sessionId, {
      reason: "yandexgpt_error",
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        error:
          "Не удалось получить ответ от YandexGPT. Проверьте YC_FOLDER_ID / YC_SERVICE_ACCOUNT_SECRET и повторите запрос.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 502 },
    );
  }

  const parsedReport = reportSchema.safeParse(rawReport);
  if (!parsedReport.success) {
    await logEvent("analysis_failed", parsedRequest.data.meta.sessionId, {
      reason: "invalid_report_schema",
    });
    return NextResponse.json(
      {
        error: "YandexGPT вернул ответ, не соответствующий ожидаемой схеме отчёта",
        details: parsedReport.error.flatten(),
      },
      { status: 502 },
    );
  }

  try {
    await saveReport(parsedRequest.data, parsedReport.data);
  } catch (error) {
    console.error("Не удалось сохранить отчёт в БД:", error);
  }

  return NextResponse.json({ report: parsedReport.data });
}
