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
      className="group flex flex-col gap-3 rounded-2xl border border-brand-surface bg-brand-surface/60 p-8 text-left transition-colors hover:bg-brand-surface"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-brand">
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
