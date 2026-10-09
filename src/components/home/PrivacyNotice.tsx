import Link from "next/link";
import { LockIcon } from "@/components/icons";

export function PrivacyNotice() {
  return (
    <section className="mt-24 w-full max-w-2xl">
      <div className="flex items-start gap-4 rounded-3xl border border-brand-surface/80 bg-white/75 p-6 text-left shadow-[0_12px_35px_rgba(1,112,132,0.06)] backdrop-blur-sm">
        <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-brand-surface text-brand">
          <LockIcon className="h-5 w-5" />
        </span>
        <p className="text-sm text-slate-600">
          Ответы используются для формирования отчёта и передаются в YandexGPT без имени и email.
          Данные не продаются и не используются для сторонней рекламы; хранение организовано на
          серверах в РФ в соответствии с 152-ФЗ.{" "}
          <Link href="/privacy" className="font-medium text-brand hover:text-brand-hover">
            Политика конфиденциальности
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
