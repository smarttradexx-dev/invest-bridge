import { getServerDictionary } from "@/i18n/server";
import { translate } from "@/i18n";

import { Reveal } from "./Reveal";

export async function HowItWorks() {
  const { dictionary } = await getServerDictionary();
  const t = (path: string) => translate(dictionary, path);

  const steps = [
    { key: "one", icon: "M6 7h12l1 13H5L6 7Z M9 7a3 3 0 0 1 6 0" },
    { key: "two", icon: "M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.1 1.1 M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.1-1.1" },
    { key: "three", icon: "M12 3v18M7 7h10M7 11h10M7 15h6" },
    { key: "four", icon: "M3 8h11v8H3zM14 11h4l3 3v2h-7zM7 19a1.8 1.8 0 1 0 0-3.6A1.8 1.8 0 0 0 7 19Zm11 0a1.8 1.8 0 1 0 0-3.6A1.8 1.8 0 0 0 18 19Z" },
  ];

  return (
    <section
      id="how-it-works"
      className="relative scroll-mt-28 overflow-hidden bg-obsidian-950 py-20 text-alabaster lg:py-28"
    >
      <div className="glow-obsidian absolute inset-0" aria-hidden="true" />

      <div className="container-page relative">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-gold-400">
              {t("howItWorks.eyebrow")}
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {t("howItWorks.title")}
            </h2>
            <p className="mt-4 text-base text-alabaster/60">{t("howItWorks.subtitle")}</p>
          </div>
        </Reveal>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {steps.map((step, index) => (
            <Reveal key={step.key} delay={index * 90}>
              <div className="group relative">
                <div className="flex items-center gap-4">
                  <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-gold-400/25 bg-obsidian-900 text-gold-300 transition-all duration-400 group-hover:border-gold-400/60 group-hover:bg-gold-400/10">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d={step.icon} />
                    </svg>
                    <span className="absolute -top-1.5 -end-1.5 grid h-6 w-6 place-items-center rounded-full bg-gold-400 text-[0.65rem] font-bold text-obsidian-950">
                      {index + 1}
                    </span>
                  </span>
                  {index < steps.length - 1 && (
                    <span
                      className="hidden h-px flex-1 bg-gradient-to-r from-gold-400/40 to-transparent lg:block"
                      aria-hidden="true"
                    />
                  )}
                </div>

                <h3 className="mt-5 text-base font-semibold text-alabaster">
                  {t(`howItWorks.steps.${step.key}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-alabaster/55">
                  {t(`howItWorks.steps.${step.key}.body`)}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
