import Image from "next/image";
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
      <p className="mt-2 max-w-xl text-lg text-slate-500">
        Анализирует рынок труда из открытых источников по доходности и
        перспективам.
      </p>


      <HeroIllustration />

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <a href="/register" className="rounded-full border border-brand px-5 py-3 text-sm font-medium text-brand">Регистрация</a>
        <a href="/login" className="rounded-full bg-brand px-5 py-3 text-sm font-medium text-white">Войти в аккаунт</a>
        <a href="/account" className="rounded-full border border-brand px-5 py-3 text-sm font-medium text-brand">Личный кабинет</a>
      </div>


      <StartAnalysisButton />

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
