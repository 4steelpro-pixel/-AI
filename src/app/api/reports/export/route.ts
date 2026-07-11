import { NextResponse } from "next/server";
import { z } from "zod";
import { reportSchema } from "@/lib/report/schema";
import { renderReportPdf } from "@/lib/report/pdf";
import { renderReportDocx } from "@/lib/report/docx";
import { uploadReportFile } from "@/lib/report/objectStorage";
import { updateReportObjectKey } from "@/lib/report/storage";

const exportRequestSchema = z.object({
  sessionId: z.string(),
  format: z.enum(["pdf", "docx"]),
  report: reportSchema,
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = exportRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректный запрос экспорта отчёта", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { sessionId, format, report } = parsed.data;

  let buffer: Buffer;
  let contentType: string;
  try {
    if (format === "pdf") {
      buffer = await renderReportPdf(report);
      contentType = "application/pdf";
    } else {
      buffer = await renderReportDocx(report);
      contentType =
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: "Не удалось сгенерировать файл отчёта",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }

  const objectKey = `reports/${sessionId}/report.${format}`;

  let url: string;
  try {
    url = await uploadReportFile(objectKey, buffer, contentType);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          "Не удалось загрузить файл в Object Storage. Проверьте STORAGE_* переменные окружения.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 502 },
    );
  }

  try {
    await updateReportObjectKey(sessionId, format, objectKey);
  } catch (error) {
    console.error("Не удалось обновить ссылку на файл в БД:", error);
  }

  return NextResponse.json({ url });
}
