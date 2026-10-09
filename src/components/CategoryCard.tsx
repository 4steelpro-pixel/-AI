import Link from "next/link";
import type { ComponentType } from "react";

type CategoryCardProps = {
  href: string;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
};

export function CategoryCard({ href, title, description, icon: Icon }: CategoryCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 rounded-3xl border border-brand-surface/80 bg-white/75 p-7 text-left shadow-[0_12px_35px_rgba(1,112,132,0.07)] backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_16px_40px_rgba(1,112,132,0.11)] sm:p-8"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-surface/70 text-brand">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="text-xl font-semibold text-slate-800">{title}</h3>
      <p className="text-slate-500">{description}</p>
      <span className="mt-2 inline-flex items-center gap-1 font-medium text-brand transition-colors group-hover:text-brand-hover">
        Выбрать
        <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}
