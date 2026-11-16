import { getServerDictionary } from "@/i18n/server";
import { translate } from "@/i18n";
import { listStores } from "@/lib/stores";

import { Reveal } from "./Reveal";
import { StoreLogo } from "./StoreLogo";

export async function StoreDirectory() {
  const { dictionary, language } = await getServerDictionary();
  const t = (path: string) => translate(dictionary, path);
  const stores = listStores(true);

  const nameFor = (store: {
    name: string;
    name_ar: string | null;
    name_tr: string | null;
  }) => {
    if (language === "ar" && store.name_ar) return store.name_ar;
    if (language === "tr" && store.name_tr) return store.name_tr;
    return store.name;
  };

  const taglineFor = (store: {
    tagline: string;
    tagline_ar: string | null;
    tagline_tr: string | null;
  }) => {
    if (language === "ar" && store.tagline_ar) return store.tagline_ar;
    if (language === "tr" && store.tagline_tr) return store.tagline_tr;
    return store.tagline;
  };

  return (
    <section id="stores" className="relative scroll-mt-28 py-20 lg:py-28">
      <div className="container-page">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-gold-600">
              {t("stores.eyebrow")}
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-obsidian-900 sm:text-4xl">
              {t("stores.title")}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-obsidian-600">
              {t("stores.subtitle")}
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {stores.map((store, index) => (
            <Reveal key={store.id} delay={index * 70}>
              <a
                href={store.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card-luxe ring-gold-hover group relative flex h-full flex-col overflow-hidden p-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400"
              >
                <span
                  className="absolute inset-x-0 top-0 h-1 opacity-70 transition-opacity duration-500 group-hover:opacity-100"
                  style={{ background: `linear-gradient(90deg, transparent, ${store.accent}, transparent)` }}
                  aria-hidden="true"
                />

                <div className="flex items-start justify-between gap-4">
                  <StoreLogo
                    logo={store.logo}
                    name={store.name}
                    accent={store.accent}
                    className="scale-[1.05] origin-start"
                  />
                  <span className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-obsidian-900/10 text-slate-mid transition-all duration-300 group-hover:border-gold-400/60 group-hover:bg-gold-400/10 group-hover:text-gold-600">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4 rtl:-scale-x-100"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.9"
                      aria-hidden="true"
                    >
                      <path d="M7 17 17 7M8 7h9v9" />
                    </svg>
                  </span>
                </div>

                <h3 className="mt-5 text-base font-semibold text-obsidian-900">
                  {nameFor(store)}
                  <span className="ms-2 align-middle text-[0.65rem] font-medium uppercase tracking-wider text-slate-mid/70">
                    {store.domain}
                  </span>
                </h3>

                <p className="mt-2 flex-1 text-sm leading-relaxed text-obsidian-600">
                  {taglineFor(store)}
                </p>

                <span className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-gold-600 transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                  {t("stores.visit")}
                  <span className="text-[0.6rem] opacity-60">
                    ({t("stores.openInNewTab")})
                  </span>
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
