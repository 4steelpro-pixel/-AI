import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://profnav-ai.ru"),
  title: {
    default: "ПрофНавигатор AI — профориентация с помощью ИИ",
    template: "%s | ПрофНавигатор AI",
  },
  description:
    "Профориентация с помощью ИИ: тест на профессию онлайн, подбор профессий по интересам и способностям, анализ рынка труда и зарплат в вашем регионе, риск автоматизации на 5 лет. Для подростков и взрослых.",
  keywords: [
    "профориентация",
    "профориентация с помощью ИИ",
    "тест на профессию",
    "тест на профориентацию",
    "как выбрать профессию",
    "подбор профессии",
    "профессии будущего",
    "профориентация для подростков",
    "профориентация для взрослых",
    "смена профессии",
    "какая профессия мне подходит",
    "выбор профессии онлайн",
    "профтест",
    "профориентационный тест",
    "рынок труда",
    "востребованные профессии",
    "профессии с высокой зарплатой",
    "риск автоматизации профессий",
  ],
  applicationName: "ПрофНавигатор AI",
  authors: [{ name: "ПрофНавигатор AI" }],
  creator: "ПрофНавигатор AI",
  publisher: "ПрофНавигатор AI",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "https://profnav-ai.ru",
    siteName: "ПрофНавигатор AI",
    title: "ПрофНавигатор AI — профориентация с помощью ИИ",
    description:
      "Тест на профессию онлайн с помощью ИИ: подбор профессий по интересам и способностям, анализ рынка труда и зарплат в вашем регионе. Для подростков и взрослых.",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "ПрофНавигатор AI — профориентация с помощью ИИ",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "ПрофНавигатор AI — профориентация с помощью ИИ",
    description:
      "Тест на профессию онлайн с помощью ИИ: подбор профессий по интересам и способностям, анализ рынка труда и зарплат в вашем регионе.",
    images: ["/logo.png"],
  },
  alternates: {
    canonical: "https://profnav-ai.ru",
  },
  icons: {
    icon: "/logo.png",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-slate-700">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Обработка ChunkLoadError (устаревшие chunk после HMR-обновления)
              window.addEventListener('error', function (event) {
                if (event.message && event.message.includes('ChunkLoadError')) {
                  console.warn('ChunkLoadError detected, reloading page...');
                  window.location.reload();
                }
              });
            `,
          }}
        />
      </body>
    </html>
  );
}
