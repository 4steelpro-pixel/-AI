import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-24 w-full border-t border-brand-surface py-10 text-center text-sm text-slate-400">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 px-6">
        <p>ПрофНавигатор AI — сервис профориентации с помощью ИИ</p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/privacy" className="hover:text-brand">
            Политика конфиденциальности
          </Link>
          <a href="mailto:support@profnavigator.ai" className="hover:text-brand">
            support@profnavigator.ai
          </a>
        </div>
        <p>© {new Date().getFullYear()} ПрофНавигатор AI</p>
      </div>
    </footer>
  );
}
