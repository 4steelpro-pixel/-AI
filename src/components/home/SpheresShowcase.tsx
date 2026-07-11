import {
  CreativityIcon,
  EngineeringIcon,
  MedicineIcon,
  ProductionIcon,
  SecurityIcon,
  ServiceIcon,
  TechIcon,
} from "@/components/icons";

const SPHERES = [
  { icon: TechIcon, label: "IT" },
  { icon: MedicineIcon, label: "Медицина" },
  { icon: EngineeringIcon, label: "Инженерия" },
  { icon: CreativityIcon, label: "Творчество" },
  { icon: ProductionIcon, label: "Рабочие специальности" },
  { icon: SecurityIcon, label: "Госслужба и безопасность" },
  { icon: ServiceIcon, label: "Сервис" },
];

export function SpheresShowcase() {
  return (
    <section className="mt-24 w-full max-w-4xl">
      <h2 className="text-2xl font-semibold text-slate-800 sm:text-3xl">Все сферы, а не только IT</h2>
      <p className="mt-2 text-slate-500">
        Мы рассматриваем профессии из всех областей — а не только цифровые.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        {SPHERES.map((sphere) => (
          <div
            key={sphere.label}
            className="flex w-32 flex-col items-center gap-2 rounded-xl p-4 text-center"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-surface text-brand">
              <sphere.icon className="h-6 w-6" />
            </span>
            <span className="text-sm text-slate-600">{sphere.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
