import type { Metadata, Viewport } from "next";
import { Cairo, Inter, Playfair_Display } from "next/font/google";

import { I18nProvider } from "@/i18n/I18nProvider";
import { resolveLanguage } from "@/i18n/server";
import { languageMeta } from "@/i18n/types";
import { ensureSeeded } from "@/lib/bootstrap";

import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://aurex.global"),
  title: {
    default: "AUREX Global — Personal shopper & order-by-link from Turkey to Syria",
    template: "%s · AUREX Global",
  },
  description:
    "Paste any product link from Trendyol, Shein, Zara, AliExpress or LC Waikiki and get one all-inclusive price. Personal shopping concierge shipping every Thursday from Turkey to Syria.",
  keywords: [
    "personal shopper Syria",
    "order by link Turkey",
    "Trendyol Syria",
    "Shein Turkey",
    "AliExpress shipping Syria",
    "AUREX Global",
  ],
  openGraph: {
    title: "AUREX Global",
    description:
      "Personal shopper & order-by-link concierge. Turkish and global brands, delivered every Thursday to Syria.",
    type: "website",
    locale: "ar_SY",
    alternateLocale: ["en_US", "tr_TR"],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0F172A",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Guarantees the schema, the five flagship stores and the admin account
  // exist on first request — the app is usable straight after `npm install`.
  ensureSeeded();

  const language = await resolveLanguage();
  const { dir } = languageMeta[language];

  return (
    <html
      lang={language}
      dir={dir}
      className={`${cairo.variable} ${inter.variable} ${playfair.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Marks the document as JS-capable so scroll-reveal sections can
            start hidden. Without JS every section stays visible. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-alabaster text-obsidian-900">
        <I18nProvider initialLanguage={language}>{children}</I18nProvider>
      </body>
    </html>
  );
}
