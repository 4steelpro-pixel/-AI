"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ProgressBar } from "./ProgressBar";
import { QuestionField } from "./QuestionField";
import { ReportView } from "./ReportView";
import { Modal } from "@/components/Modal";
import { getBaseSeries } from "@/lib/survey/questions";
import { getApplicableRules } from "@/lib/survey/branchRules";
import { buildAnalysisPayload } from "@/lib/survey/payload";
import { trackEvent } from "@/lib/analytics/track";
import type { Answers, AnswerValue, Category, Question, QuestionSeries } from "@/lib/survey/types";
import type { CareerReport } from "@/lib/report/schema";

const CATEGORY_TITLE: Record<Category, string> = {
  teen: "Для подростков 13–17 лет",
  adult: "Для взрослых",
};

function isAnswered(question: Question, value: AnswerValue | undefined): boolean {
  if (question.optional) return true;
  if (question.type === "ranking") return true;
  if (question.type === "text") {
    return typeof value === "string" && value.trim().length > 0;
  }
  if (question.type === "single") {
    return typeof value === "string" && value.length > 0;
  }
  if (question.type === "multi") {
    return Array.isArray(value) && value.length > 0;
  }
  if (question.type === "scale-group") {
    if (!value || typeof value !== "object" || Array.isArray(value)) return false;
    const scored = value as Record<string, number>;
    return (question.scaleItems ?? []).every((item) => typeof scored[item.key] === "number");
  }
  return false;
}

function createSessionId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function SurveyFlow({ category }: { category: Category }) {
  const [sessionId] = useState(createSessionId);
  const [series, setSeries] = useState<QuestionSeries[]>(() => getBaseSeries(category));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [phase, setPhase] = useState<"questions" | "review" | "report">("questions");
  const [appliedRuleIds, setAppliedRuleIds] = useState<Set<string>>(() => new Set());
  const branchRules = useMemo(() => getApplicableRules(category), [category]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [report, setReport] = useState<CareerReport | null>(null);
  const [exporting, setExporting] = useState<"pdf" | "docx" | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [accessChecked, setAccessChecked] = useState(false);

  useEffect(() => {
    trackEvent("survey_started", sessionId, { category });
  }, [sessionId, category]);

  // Проверяем доступ к тесту (если оплата обязательна — только после оплаты)
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    fetch("/api/billing/access", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((data) => {
        // Доступ открыт (в т.ч. когда оплата не требуется — токен не нужен)
        if (data.ok && data.allowed) {
          setAccessChecked(true);
          return;
        }
        // Оплата требуется, но доступа нет — на страницу оплаты
        if (data.requirePayment) {
          window.location.href = `/billing?category=${category}`;
          return;
        }
        // Оплата не требуется, но нужна авторизация
        if (!token) {
          window.location.href = "/login";
          return;
        }
        window.location.href = `/billing?category=${category}`;
      })
      .catch(() => {
        window.location.href = `/billing?category=${category}`;
      });
  }, [category]);


  const currentSeries = series[currentIndex];

  const totalSteps = series.length + 1; // +1 for the review step
  const stepLabel =
    phase === "questions"
      ? `Шаг ${currentIndex + 1} из ${totalSteps}: ${currentSeries?.title ?? ""}`
      : phase === "review"
        ? `Шаг ${totalSteps} из ${totalSteps}: проверка ответов`
        : "Отчёт готов";
  const progressCurrent = phase === "questions" ? currentIndex + 1 : totalSteps;

  function handleChange(key: string, value: AnswerValue) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  const canProceed = useMemo(() => {
    if (!currentSeries) return false;
    return currentSeries.questions.every((q) => isAnswered(q, answers[q.key]));
  }, [currentSeries, answers]);

  function goNext() {
    const matchedRules = branchRules.filter(
      (rule) =>
        !appliedRuleIds.has(rule.id) &&
        rule.afterSeriesId === currentSeries.id &&
        rule.condition(answers),
    );
    if (matchedRules.length > 0) {
      setSeries((prev) => {
        const next = [...prev];
        next.splice(currentIndex + 1, 0, ...matchedRules.map((rule) => rule.buildSeries(answers)));
        return next;
      });
      setAppliedRuleIds((prev) => {
        const nextSet = new Set(prev);
        matchedRules.forEach((rule) => nextSet.add(rule.id));
        return nextSet;
      });
    }

    trackEvent("survey_series_completed", sessionId, {
      seriesId: currentSeries.id,
      index: currentIndex,
    });

    if (currentIndex + 1 >= series.length) {
      trackEvent("survey_review_reached", sessionId, { category });
      setPhase("review");
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  function goBack() {
    if (currentIndex === 0) return;
    setCurrentIndex((i) => i - 1);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);
    trackEvent("survey_submitted", sessionId, { category });
    const payload = buildAnalysisPayload(category, sessionId, answers);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? `status ${res.status}`);
      }
      setReport(data.report as CareerReport);
      setPhase("report");
      trackEvent("survey_completed", sessionId, { category });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Не удалось получить отчёт. Попробуйте ещё раз.";
      setSubmitError(message);
      trackEvent("survey_submit_failed", sessionId, { category, message });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleExport(format: "pdf" | "docx") {
    if (!report) return;
    setExporting(format);
    setExportError(null);
    try {
      const res = await fetch("/api/reports/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, format, report }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? `status ${res.status}`);
      }
      window.open(data.url, "_blank");
      trackEvent("report_exported", sessionId, { format });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Не удалось подготовить файл. Попробуйте ещё раз.";
      setExportError(message);
      trackEvent("report_export_failed", sessionId, { format, message });
    } finally {
      setExporting(null);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-sm text-slate-400 hover:text-brand">
          ← На главную
        </Link>
        <span className="text-sm font-medium text-brand">{CATEGORY_TITLE[category]}</span>
      </div>

      <ProgressBar current={progressCurrent} total={totalSteps} label={stepLabel} />

      {phase === "questions" && currentSeries ? (
        <div className="flex flex-col gap-8">
          <h2 className="text-2xl font-semibold text-slate-800">{currentSeries.title}</h2>
          <div className="flex flex-col gap-8">
            {currentSeries.questions.map((question) => (
              <QuestionField
                key={question.key}
                question={question}
                value={answers[question.key]}
                onChange={handleChange}
              />
            ))}
          </div>
          <div className="flex justify-between">
            <button
              type="button"
              onClick={goBack}
              disabled={currentIndex === 0}
              className="rounded-full border border-brand-surface px-6 py-3 font-medium text-slate-600 disabled:opacity-30"
            >
              Назад
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={!canProceed}
              className="rounded-full bg-brand px-8 py-3 font-medium text-white transition-colors hover:bg-brand-hover disabled:opacity-40"
            >
              Далее
            </button>
          </div>
        </div>
      ) : null}

      {phase === "review" ? (
        <div className="flex flex-col gap-8">
          <h2 className="text-2xl font-semibold text-slate-800">Проверьте ваши ответы</h2>
          <p className="text-slate-500">
            Здесь можно отредактировать любой ответ перед отправкой на анализ.
          </p>
          <div className="flex flex-col gap-10">
            {series.map((s) => (
              <div key={s.id} className="flex flex-col gap-6">
                <h3 className="text-lg font-semibold text-brand-hover">{s.title}</h3>
                {s.questions.map((question) => (
                  <QuestionField
                    key={question.key}
                    question={question}
                    value={answers[question.key]}
                    onChange={handleChange}
                  />
                ))}
              </div>
            ))}
          </div>

          {submitError ? (
            <p className="rounded-xl bg-brand-surface p-4 text-sm text-brand-hover">
              {submitError}
            </p>
          ) : null}

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setPhase("questions")}
              className="rounded-full border border-brand-surface px-6 py-3 font-medium text-slate-600"
            >
              Назад к вопросам
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-full bg-brand px-8 py-3 font-medium text-white transition-colors hover:bg-brand-hover disabled:opacity-40"
            >
              {submitting ? "Отправка..." : "Получить отчёт"}
            </button>
          </div>
        </div>
      ) : null}

      {phase === "report" && report ? (
        <div className="flex flex-col gap-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-slate-800">Ваш отчёт</h2>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleExport("pdf")}
                disabled={exporting !== null}
                className="rounded-full border border-brand px-5 py-2 text-sm font-medium text-brand transition-colors hover:bg-brand-surface disabled:opacity-40"
              >
                {exporting === "pdf" ? "Готовим PDF..." : "Скачать PDF"}
              </button>
              <button
                type="button"
                onClick={() => handleExport("docx")}
                disabled={exporting !== null}
                className="rounded-full border border-brand px-5 py-2 text-sm font-medium text-brand transition-colors hover:bg-brand-surface disabled:opacity-40"
              >
                {exporting === "docx" ? "Готовим DOCX..." : "Скачать DOCX"}
              </button>
            </div>
          </div>
          {exportError ? (
            <p className="rounded-xl bg-brand-surface p-4 text-sm text-brand-hover">
              {exportError}
            </p>
          ) : null}
          <ReportView report={report} />
        </div>
      ) : null}

      <Modal open={submitting}>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-surface border-t-brand" />
          <p className="text-lg font-medium text-slate-800">
            Мы отправили данные для анализа искусственному интеллекту, дождитесь
            результата
          </p>
        </div>
      </Modal>
    </main>
  );
}
