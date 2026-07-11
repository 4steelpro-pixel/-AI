import Image from "next/image";
import { CategoryCard } from "@/components/CategoryCard";
import { StartAnalysisButton } from "@/components/StartAnalysisButton";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center bg-white px-6 py-20 text-center sm:py-28">
      <Image
        src="/logo.png"
        alt="ПрофНавигатор AI"
        width={180}
        height={180}
        priority
        unoptimized
      />

      <h1 className="mt-8 text-4xl font-semibold tracking-tight text-slate-800 sm:text-5xl">
        ПрофНавигатор AI
      </h1>
      <p className="mt-4 max-w-xl text-lg text-slate-500">
        ИИ помогает определить наиболее подходящие профессии на ближайшие 5
        лет с учетом ваших способностей, опыта, региона проживания и рынка
        труда.
      </p>

      <StartAnalysisButton />

      <div
        id="categories"
        className="mt-20 grid w-full max-w-3xl gap-6 sm:grid-cols-2"
      >
        <CategoryCard
          href="/survey/teen"
          title="Для подростков 13–17 лет"
          description="Определим склонности, интересные предметы и направления обучения."
        />
        <CategoryCard
          href="/survey/adult"
          title="Для взрослых"
          description="Учтём опыт, навыки и причины смены профессии, подберём плавный переход."
        />
      </div>
    </main>
  );
}
