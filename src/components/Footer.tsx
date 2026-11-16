import Link from "next/link";

import { getServerDictionary, getServerT } from "@/i18n/server";
import { getSettings } from "@/lib/db";
import { SYRIAN_CITIES } from "@/lib/types";

import { BrandMark } from "./Navbar";

export async function Footer() {
  const t = await getServerT();
  const { language } = await getServerDictionary();
  const settings = getSettings();
  const whatsapp = settings.contact_whatsapp ?? "905000000000";
  const email = settings.contact_email ?? "concierge@aurex.global";

  const cityName = (city: (typeof SYRIAN_CITIES)[number]) =>
    language === "ar" ? city.ar : language === "tr" ? city.tr : city.en;

  const exploreLinks = [
    { href: "/#stores", label: t("nav.stores") },
    { href: "/#how-it-works", label: t("nav.howItWorks") },
    { href: "/#order", label: t("nav.orderByLink") },
    { href: "/#pricing", label: t("pricing.eyebrow") },
  ];
  const supportLinks = [
    { href: "/track", label: t("nav.track") },
    { href: "/#faq", label: t("nav.faq") },
    { href: "/#cities", label: t("cities.eyebrow") },
    { href: `https://wa.me/${whatsapp}`, label: t("nav.contact"), external: true },
  ];

  return (
    <footer className="relative mt-24 overflow-hidden bg-obsidian-950 text-alabaster">
      <div className="glow-obsidian absolute inset-0" aria-hidden="true" />
      <div className="hairline absolute inset-x-0 top-0 h-px" aria-hidden="true" />

      <div className="container-page relative py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="[&_span]:text-alabaster [&_.font-display]:text-alabaster">
              <BrandMark />
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-alabaster/60">
              {t("footer.tagline")}
            </p>

            <div className="mt-7 space-y-3">
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 text-sm text-alabaster/75 transition-colors hover:text-gold-300"
              >
                <span className="grid h-9 w-9 place-items-center rounded-full border border-gold-400/25 bg-gold-400/10 text-gold-300 transition-colors group-hover:bg-gold-400/20">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.6-6.1c-.3-.1-1.7-.8-2-.9s-.5-.1-.7.1-.7.9-.9 1.1-.3.2-.6.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.4 0-.5l-.9-2.1c-.2-.6-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.9.4A3.5 3.5 0 0 0 5.6 11c0 1.4 1.1 2.8 1.3 3a11 11 0 0 0 4.2 3.7c1.5.6 2.1.7 2.9.6a2.8 2.8 0 0 0 1.9-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.1-.3-.2-.6-.4Z" />
                  </svg>
                </span>
                <span dir="ltr">+{whatsapp}</span>
              </a>

              <a
                href={`mailto:${email}`}
                className="group flex items-center gap-3 text-sm text-alabaster/75 transition-colors hover:text-gold-300"
              >
                <span className="grid h-9 w-9 place-items-center rounded-full border border-gold-400/25 bg-gold-400/10 text-gold-300 transition-colors group-hover:bg-gold-400/20">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="m3 7 9 6 9-6" />
                  </svg>
                </span>
                <span dir="ltr">{email}</span>
              </a>

              <p className="flex items-center gap-3 text-sm text-alabaster/60">
                <span className="grid h-9 w-9 place-items-center rounded-full border border-gold-400/25 bg-gold-400/10 text-gold-300">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                    <path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z" />
                    <circle cx="12" cy="10" r="2.5" />
                  </svg>
                </span>
                {t("contact.address")}
              </p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
              {t("footer.explore")}
            </h3>
            <ul className="mt-5 space-y-3">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-alabaster/65 transition-colors hover:text-gold-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
              {t("footer.support")}
            </h3>
            <ul className="mt-5 space-y-3">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-alabaster/65 transition-colors hover:text-gold-300"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-alabaster/65 transition-colors hover:text-gold-300"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
              {t("footer.contactTitle")}
            </h3>
            <div className="mt-5 rounded-2xl border border-gold-400/18 bg-obsidian-900/60 p-5">
              <p className="text-sm text-alabaster/70">{t("footer.hours")}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {SYRIAN_CITIES.slice(0, 8).map((city) => (
                  <span
                    key={city.code}
                    className="rounded-full border border-alabaster/12 px-2.5 py-1 text-[0.7rem] text-alabaster/60"
                  >
                    {cityName(city)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-alabaster/10 pt-7 text-center md:flex-row md:text-start">
          <p className="text-xs text-alabaster/45">
            © {new Date().getFullYear()} AUREX Global. {t("footer.rights")}
          </p>
          <p className="text-xs text-alabaster/45">{t("footer.madeIn")}</p>
        </div>
      </div>
    </footer>
  );
}
