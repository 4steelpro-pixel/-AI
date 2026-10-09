import Link from "next/link";
import { CategoryCard } from "@/components/CategoryCard";
import { StartAnalysisButton } from "@/components/StartAnalysisButton";
import { Footer } from "@/components/Footer";
import { AdultIcon, TeenIcon } from "@/components/icons";
import { HeroIllustration } from "@/components/home/HeroIllustration";
import { HowItWorks } from "@/components/home/HowItWorks";
import { KeyAdvantages } from "@/components/home/KeyAdvantages";
import { ReportPreview } from "@/components/home/ReportPreview";

import { TrustSection } from "@/components/home/TrustSection";
import { PrivacyNotice } from "@/components/home/PrivacyNotice";
import { Faq } from "@/components/home/Faq";
import { SpheresShowcase } from "@/components/home/SpheresShowcase";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center bg-[#f3fbf8] px-4 pb-20 text-center sm:px-6 sm:pb-28">
      <nav
        aria-label="Основная навигация"
        className="flex w-full max-w-5xl items-center justify-between gap-2 py-5 text-xs sm:text-sm"
      >
        <Link href="/" className="font-semibold text-slate-800">
          ПрофНавигатор <span className="text-brand">AI</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/register" className="text-slate-500 transition-colors hover:text-brand">
            Регистрация
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-brand/25 bg-white/70 px-3 py-2 font-medium text-brand transition-colors hover:bg-white sm:px-4"
          >
            Войти
          </Link>
        </div>
      </nav>

      <h1 className="mt-12 text-3xl font-semibold tracking-tight text-slate-800 sm:mt-16 sm:text-5xl">
        ПрофНавигатор AI
      </h1>
      <p className="mt-4 max-w-xl text-lg text-slate-500">
        ИИ помогает определить наиболее подходящие профессии на ближайшие 5
        лет с учетом ваших способностей, опыта, региона проживания и рынка
        труда.
      </p>
      <p className="mt-2 max-w-xl text-lg text-slate-500">
        Анализирует рынок труда из открытых источников по доходности и
        перспективам.
      </p>


      <HeroIllustration />

      <StartAnalysisButton />
      <Link
        href="/example-report"
        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 underline decoration-brand/40 underline-offset-4 transition-colors hover:text-brand"
      >
        Посмотреть пример отчёта
        <span aria-hidden="true">→</span>
      </Link>

      <div
        id="categories"
        className="mt-20 grid w-full max-w-3xl gap-6 sm:grid-cols-2"
      >
        <CategoryCard
          href="/survey/teen"
          title="Для подростков 13–17 лет"
          description="Определим склонности, интересные предметы и направления обучения."
          icon={TeenIcon}
        />
        <CategoryCard
          href="/survey/adult"
          title="Для взрослых"
          description="Учтём опыт, навыки и причины смены профессии, подберём плавный переход."
          icon={AdultIcon}
        />
      </div>

      <HowItWorks />
      <KeyAdvantages />
      <ReportPreview />

      <TrustSection />
      <PrivacyNotice />
      <Faq />
      <SpheresShowcase />
      <Footer />
    </main>
  );
}
