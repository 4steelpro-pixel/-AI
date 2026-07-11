import type { ReactNode } from "react";
import type { AnswerValue, Question } from "@/lib/survey/types";

type QuestionFieldProps = {
  question: Question;
  value: AnswerValue | undefined;
  onChange: (key: string, value: AnswerValue) => void;
};

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "border-brand bg-brand text-white"
          : "border-brand-surface bg-white text-slate-600 hover:border-brand"
      }`}
    >
      {children}
    </button>
  );
}

export function QuestionField({ question, value, onChange }: QuestionFieldProps) {
  const label = (
    <label className="block text-base font-medium text-slate-800">
      {question.label}
      {question.optional ? (
        <span className="ml-2 text-sm font-normal text-slate-400">
          (необязательно)
        </span>
      ) : null}
    </label>
  );

  if (question.type === "text") {
    const textValue = typeof value === "string" ? value : "";
    return (
      <div className="flex flex-col gap-2">
        {label}
        {question.hint ? (
          <p className="text-sm text-slate-400">{question.hint}</p>
        ) : null}
        <textarea
          rows={3}
          value={textValue}
          onChange={(e) => onChange(question.key, e.target.value)}
          className="rounded-xl border border-brand-surface bg-white p-3 text-slate-700 outline-none focus:border-brand"
        />
      </div>
    );
  }

  if (question.type === "single") {
    const selected = typeof value === "string" ? value : "";
    return (
      <div className="flex flex-col gap-2">
        {label}
        {question.hint ? (
          <p className="text-sm text-slate-400">{question.hint}</p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          {question.options?.map((option) => (
            <Chip
              key={option.code}
              active={selected === option.code}
              onClick={() => onChange(question.key, option.code)}
            >
              {option.label}
            </Chip>
          ))}
        </div>
      </div>
    );
  }

  if (question.type === "multi") {
    const selected = Array.isArray(value) ? (value as string[]) : [];
    return (
      <div className="flex flex-col gap-2">
        {label}
        {question.hint ? (
          <p className="text-sm text-slate-400">{question.hint}</p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          {question.options?.map((option) => {
            const active = selected.includes(option.code);
            return (
              <Chip
                key={option.code}
                active={active}
                onClick={() =>
                  onChange(
                    question.key,
                    active
                      ? selected.filter((code) => code !== option.code)
                      : [...selected, option.code],
                  )
                }
              >
                {option.label}
              </Chip>
            );
          })}
        </div>
      </div>
    );
  }

  if (question.type === "scale-group") {
    const scaleValue =
      value && typeof value === "object" && !Array.isArray(value)
        ? (value as Record<string, number>)
        : {};
    const max = question.scaleMax ?? 5;
    return (
      <div className="flex flex-col gap-3">
        {label}
        {question.hint ? (
          <p className="text-sm text-slate-400">{question.hint}</p>
        ) : null}
        {question.scaleItems?.map((item) => (
          <div key={item.key} className="flex items-center justify-between gap-4">
            <span className="text-sm text-slate-600">{item.label}</span>
            <div className="flex gap-1">
              {Array.from({ length: max }, (_, i) => i + 1).map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() =>
                    onChange(question.key, { ...scaleValue, [item.key]: score })
                  }
                  className={`h-8 w-8 rounded-full border text-sm font-medium transition-colors ${
                    scaleValue[item.key] === score
                      ? "border-brand bg-brand text-white"
                      : "border-brand-surface bg-white text-slate-500 hover:border-brand"
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (question.type === "ranking") {
    const order =
      Array.isArray(value) && (value as string[]).length > 0
        ? (value as string[])
        : (question.options?.map((o) => o.code) ?? []);
    const labelByCode = new Map(question.options?.map((o) => [o.code, o.label]));

    function move(index: number, direction: -1 | 1) {
      const next = [...order];
      const target = index + direction;
      if (target < 0 || target >= next.length) return;
      [next[index], next[target]] = [next[target], next[index]];
      onChange(question.key, next);
    }

    return (
      <div className="flex flex-col gap-2">
        {label}
        {question.hint ? (
          <p className="text-sm text-slate-400">{question.hint}</p>
        ) : null}
        <ol className="flex flex-col gap-2">
          {order.map((code, index) => (
            <li
              key={code}
              className="flex items-center justify-between gap-3 rounded-xl border border-brand-surface bg-white px-4 py-2"
            >
              <span className="text-sm text-slate-700">
                <span className="mr-2 text-slate-400">{index + 1}.</span>
                {labelByCode.get(code) ?? code}
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  aria-label="Повысить приоритет"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className="h-7 w-7 rounded-full text-brand disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  aria-label="Понизить приоритет"
                  onClick={() => move(index, 1)}
                  disabled={index === order.length - 1}
                  className="h-7 w-7 rounded-full text-brand disabled:opacity-30"
                >
                  ↓
                </button>
              </div>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  return null;
}
