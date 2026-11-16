import { getServerDictionary } from "@/i18n/server";
import { translate } from "@/i18n";

import { Reveal } from "./Reveal";

export async function PricingSection() {
  const { dictionary } = await getServerDictionary();
  const t = (path: string) => translate(dictionary, path);

  const items = [
    {
      key: "product",
      accent: "#D4AF37",
      icon: "M6 7h12l1 13H5L6 7Z M9 7a3 3 0 0 1 6 0",
      sample: "$74.90",
    },
    {
      key: "shipping",
      accent: "#0EA5A4",
      icon: "M3 8h11v8H3zM14 11h4l3 3v2h-7zM7 19a1.8 1.8 0 1 0 0-3.6A1.8 1.8 0 0 0 7 19Zm11 0a1.8 1.8 0 1 0 0-3.6A1.8 1.8 0 0 0 18 19Z",
      sample: "$8.50",
    },
    {
      key: "service",
      accent: "#6366F1",
      icon: "M12 3l2.4 5.1 5.6.8-4 4 .9 5.6-4.9-2.6-4.9 2.6.9-5.6-4-4 5.6-.8L12 3Z",
      sample: "$8.99",
    },
  ];

  return (
    <section id="pricing" className="relative scroll-mt-28 py-20 lg:py-28">
      <div className="container-page">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <div>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-gold-600">
                {t("pricing.eyebrow")}
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-obsidian-900 sm:text-4xl">
                {t("pricing.title")}
              </h2>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-obsidian-600">
                {t("pricing.subtitle")}
              </p>

              <a
                href="#order"
                className="btn btn-obsidian mt-8 px-7 py-3.5 text-sm sm:text-base"
              >
                {t("pricing.cta")}
              </a>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="card-luxe overflow-hidden p-6 sm:p-8">
              <ul className="space-y-5">
                {items.map((item) => (
                  <li key={item.key} className="flex items-start gap-4">
                    <span
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white"
                      style={{ background: item.accent }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d={item.icon} />
                      </svg>
                    </span>

                    <div className="flex-1">
                      <div className="flex items-baseline justify-between gap-4">
                        <h3 className="text-sm font-semibold text-obsidian-900">
                          {t(`pricing.items.${item.key}.title`)}
                        </h3>
                        <span className="font-mono text-sm font-semibold tabular-nums text-obsidian-900">
                          {item.sample}
                        </span>
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-obsidian-600">
                        {t(`pricing.items.${item.key}.body`)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-7 flex items-center justify-between rounded-2xl bg-obsidian-900 px-5 py-4">
                <span className="text-sm font-semibold text-alabaster">
                  {t("hero.card.total")}
                </span>
                <span className="font-display text-2xl font-semibold text-gold-300">
                  $92.39
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
