import { getServerDictionary } from "@/i18n/server";
import { translate } from "@/i18n";
import { SYRIAN_CITIES } from "@/lib/types";

import { Reveal } from "./Reveal";

export async function CityCoverage() {
  const { dictionary, language } = await getServerDictionary();
  const t = (path: string) => translate(dictionary, path);

  const cityName = (city: (typeof SYRIAN_CITIES)[number]) =>
    language === "ar" ? city.ar : language === "tr" ? city.tr : city.en;

  return (
    <section id="cities" className="relative scroll-mt-28 py-20 lg:py-24">
      <div className="container-page">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-gold-600">
              {t("cities.eyebrow")}
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-obsidian-900 sm:text-4xl">
              {t("cities.title")}
            </h2>
            <p className="mt-4 text-base text-obsidian-600">{t("cities.subtitle")}</p>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-2.5">
            {SYRIAN_CITIES.map((city) => (
              <span
                key={city.code}
                className="rounded-full border border-obsidian-900/10 bg-white px-4 py-2 text-sm font-medium text-obsidian-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-gold-400/50 hover:text-obsidian-900 hover:shadow-[0_10px_24px_-16px_rgba(212,175,55,0.9)]"
              >
                {cityName(city)}
              </span>
            ))}
            <span className="rounded-full bg-obsidian-900 px-4 py-2 text-sm font-medium text-gold-300">
              {t("cities.more")}
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
