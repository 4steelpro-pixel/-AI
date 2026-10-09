import { NextResponse } from "next/server";
import { analysisRequestSchema } from "@/lib/survey/payloadSchema";
import { reportSchema } from "@/lib/report/schema";
import { requestCareerAnalysis } from "@/lib/report/yandexgpt";
import { saveReport } from "@/lib/report/storage";
import { logEvent } from "@/lib/analytics/events";
import { checkTestAccess } from "@/lib/billing/access";
import { PERSONAL_DATA_CONSENT_VERSION } from "@/lib/privacy/constants";
import { getPool } from "@/lib/db/client";

export async function POST(request: Request) {
  // Проверяем доступ к тесту до обращения к YandexGPT.
  // При включённой оплате отчёт формируется только для пользователей
  // с подтверждённым платежом — это исключает обход оплаты через прямой запрос к API.
  const access = await checkTestAccess(request);
  if (!access.allowed) {
    return NextResponse.json(
      {
        error: "Для получения отчёта необходима оплата доступа.",
        requirePayment: access.requirePayment,
      },
      { status: 402 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsedRequest = analysisRequestSchema.safeParse(body);

  if (!parsedRequest.success) {
    return NextResponse.json(
      { error: "Некорректный формат данных анкеты", details: parsedRequest.error.flatten() },
      { status: 400 },
    );
  }

  if (parsedRequest.data.meta.consent.documentVersion !== PERSONAL_DATA_CONSENT_VERSION) {
    return NextResponse.json(
      { error: "Необходимо подтвердить актуальную редакцию согласия" },
      { status: 400 },
    );
  }

  if (process.env.DATABASE_URL) {
    await getPool().query(
      `insert into consent_records
         (session_id, user_id, consent_type, document_version, decision, subject_age_group, source)
       values ($1, $2, 'personal_data', $3, 'granted', $4, 'survey')
       on conflict (session_id, consent_type, document_version)
         where session_id is not null and consent_type = 'personal_data'
       do update set decision = 'granted', subject_age_group = excluded.subject_age_group,
                     user_id = coalesce(excluded.user_id, consent_records.user_id), granted_at = now()`,
      [
        parsedRequest.data.meta.sessionId,
        access.userId,
        PERSONAL_DATA_CONSENT_VERSION,
        parsedRequest.data.meta.consent.subjectAgeGroup,
      ],
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
    await saveReport(parsedRequest.data, parsedReport.data, access.userId, access.email);
  } catch (error) {
    console.error("Не удалось сохранить отчёт в БД:", error);
  }

  return NextResponse.json({ report: parsedReport.data });
}
