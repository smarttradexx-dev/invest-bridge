import { getServerDictionary } from "@/i18n/server";
import { translate } from "@/i18n";

import { Reveal } from "./Reveal";

export async function Hero() {
  const { dictionary } = await getServerDictionary();
  const t = (path: string, values?: Record<string, string | number>) =>
    translate(dictionary, path, values);

  const stats = [
    { value: "5", label: t("hero.stats.stores") },
    { value: "1×", label: t("hero.stats.batch") },
    { value: "12", label: t("hero.stats.cities") },
    { value: "7/7", label: t("hero.stats.support") },
  ];

  const breakdown = [
    { label: t("hero.card.product"), value: "$74.90" },
    { label: t("hero.card.shipping"), value: "$8.50" },
    { label: t("hero.card.service"), value: "$8.99" },
  ];

  return (
    <section className="relative overflow-hidden bg-obsidian-950 text-alabaster">
      <div className="glow-obsidian absolute inset-0" aria-hidden="true" />
      <div className="grain absolute inset-0" aria-hidden="true" />

      <div className="container-page relative grid items-center gap-14 py-16 lg:grid-cols-12 lg:gap-10 lg:py-24">
        {/* ---------------------------- copy ---------------------------- */}
        <div className="lg:col-span-7">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/10 px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-gold-300">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
              {t("hero.eyebrow")}
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-6 font-display text-[2.1rem] font-semibold leading-[1.18] tracking-tight text-alabaster sm:text-5xl lg:text-[3.55rem]">
              {t("hero.title")}{" "}
              <span className="text-gradient-gold">{t("hero.titleHighlight")}</span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-alabaster/65 sm:text-lg">
              {t("hero.subtitle")}
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a href="#order" className="btn btn-gold px-7 py-3.5 text-sm sm:text-base">
                {t("hero.primaryCta")}
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 rtl:-scale-x-100"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
              <a
                href="/track"
                className="btn btn-outline-gold px-7 py-3.5 text-sm sm:text-base"
              >
                {t("hero.secondaryCta")}
              </a>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <dl className="mt-12 grid max-w-xl grid-cols-2 gap-x-6 gap-y-7 border-t border-alabaster/12 pt-8 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="font-display text-2xl font-semibold text-gold-300">
                    {stat.value}
                  </dt>
                  <dd className="mt-1 text-[0.72rem] leading-snug text-alabaster/50">
                    {stat.label}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        {/* ------------------------ quote preview ------------------------ */}
        <div className="lg:col-span-5">
          <Reveal delay={200}>
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div
                className="absolute -inset-6 rounded-[2.5rem] bg-gold-400/10 blur-2xl"
                aria-hidden="true"
              />

              <div className="card-luxe-dark relative overflow-hidden p-6 sm:p-7">
                <div className="hairline absolute inset-x-0 top-0 h-px" aria-hidden="true" />

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gold-400/80">
                      {t("hero.card.title")}
                    </p>
                    <p className="mt-2 text-sm font-medium text-alabaster/85">
                      Classic Men&apos;s Kaftan
                    </p>
                    <p className="text-xs text-alabaster/45">Trendyol · Size L · Black</p>
                  </div>

                  <div className="relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl border border-alabaster/10 bg-white/95">
                    <svg viewBox="0 0 48 48" className="h-12 w-12" aria-hidden="true">
                      <path
                        d="M17 8h14l3 6-4 2v24H18V16l-4-2 3-6Z"
                        fill="#0F172A"
                        opacity=".88"
                      />
                      <path d="M17 8h14l3 6-4 2v24H18V16l-4-2 3-6Z" fill="none" stroke="#D4AF37" strokeWidth="1.4" />
                    </svg>
                  </div>
                </div>

                <dl className="mt-7 space-y-3.5 border-t border-alabaster/10 pt-6">
                  {breakdown.map((row) => (
                    <div key={row.label} className="flex items-center justify-between text-sm">
                      <dt className="text-alabaster/55">{row.label}</dt>
                      <dd className="font-medium tabular-nums text-alabaster/90">{row.value}</dd>
                    </div>
                  ))}

                  <div className="flex items-center justify-between border-t border-dashed border-alabaster/15 pt-4">
                    <dt className="text-sm font-semibold text-alabaster">{t("hero.card.total")}</dt>
                    <dd className="font-display text-2xl font-semibold text-gold-300">$92.39</dd>
                  </div>
                </dl>

                <div className="mt-6 flex items-center gap-2.5 rounded-xl bg-gold-400/10 px-3.5 py-2.5 text-xs text-gold-200">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <rect x="2.5" y="5" width="19" height="15" rx="2" />
                    <path d="M2.5 9.5h19M8 3v4M16 3v4" />
                  </svg>
                  {t("hero.card.weekly")}
                </div>

                <p className="mt-4 text-[0.7rem] leading-relaxed text-alabaster/40">
                  {t("hero.card.disclaimer")}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* bottom fade into the next section */}
      <div
        className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-alabaster to-transparent"
        aria-hidden="true"
      />
    </section>
  );
}
