import Link from "next/link";

type CategoryCardProps = {
  href: string;
  title: string;
  description: string;
};

export function CategoryCard({ href, title, description }: CategoryCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 rounded-2xl border border-brand-surface bg-brand-surface/60 p-8 text-left transition-colors hover:bg-brand-surface"
    >
      <h3 className="text-xl font-semibold text-slate-800">{title}</h3>
      <p className="text-slate-500">{description}</p>
      <span className="mt-2 inline-flex items-center gap-1 font-medium text-brand transition-colors group-hover:text-brand-hover">
        Выбрать
        <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}
