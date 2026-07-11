import Link from "next/link";
import { LockIcon } from "@/components/icons";

export function PrivacyNotice() {
  return (
    <section className="mt-24 w-full max-w-2xl">
      <div className="flex items-start gap-4 rounded-2xl border border-brand-surface bg-white p-6 text-left">
        <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-brand-surface text-brand">
          <LockIcon className="h-5 w-5" />
        </span>
        <p className="text-sm text-slate-600">
          Ваши ответы используются только для анализа и не передаются третьим лицам. Хранение
          данных — на серверах в РФ (152-ФЗ).{" "}
          <Link href="/privacy" className="font-medium text-brand hover:text-brand-hover">
            Политика конфиденциальности
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
