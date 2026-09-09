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

  // Копию кладём в MinIO для истории, но файл отдаём клиенту напрямую,
  // чтобы скачивание не зависело от публичной доступности хранилища.
  try {
    await uploadReportFile(objectKey, buffer, contentType);
    try {
      await updateReportObjectKey(sessionId, format, objectKey);
    } catch (error) {
      console.error("Не удалось обновить ссылку на файл в БД:", error);
    }
  } catch (error) {
    console.error("Не удалось сохранить файл в MinIO:", error);
  }

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="profnavigator-report.${format}"`,
      "Content-Length": String(buffer.length),
      "Cache-Control": "private, no-store",
    },
  });
}
