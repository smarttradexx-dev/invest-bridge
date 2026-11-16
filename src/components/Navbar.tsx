"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { useI18n } from "@/i18n/I18nProvider";

import { LanguageSwitcher } from "./LanguageSwitcher";

const LINKS = [
  { href: "/#stores", key: "nav.stores" },
  { href: "/#how-it-works", key: "nav.howItWorks" },
  { href: "/#order", key: "nav.orderByLink" },
  { href: "/track", key: "nav.track" },
  { href: "/#faq", key: "nav.faq" },
] as const;

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="relative grid h-9 w-9 shrink-0 place-items-center">
        <svg viewBox="0 0 40 40" className="h-9 w-9" aria-hidden="true">
          <defs>
            <linearGradient id="aurex-gold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#E3CD84" />
              <stop offset="55%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#9A7A1F" />
            </linearGradient>
          </defs>
          <path
            d="M20 2.5 35 11v18L20 37.5 5 29V11L20 2.5Z"
            fill="none"
            stroke="url(#aurex-gold)"
            strokeWidth="1.6"
            opacity="0.9"
          />
          <path
            d="M13.2 27.5 20 11.5l6.8 16h-3.5l-1.3-3.3h-4.1L16.6 27.5h-3.4Zm5.6-6.2h2.3L20 18l-1.2 3.3Z"
            fill="url(#aurex-gold)"
          />
        </svg>
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-lg font-semibold tracking-[0.2em] text-obsidian-900">
            AUREX
          </span>
          <span className="mt-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.32em] text-gold-600">
            Global
          </span>
        </span>
      )}
    </span>
  );
}

export function Navbar() {
  const { t } = useI18n();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  // The mobile menu closes itself when the route changes: the open state is
  // tied to the path it was opened on, so a new pathname closes it without
  // needing an effect.
  const [menu, setMenu] = useState({ open: false, path: pathname });
  const menuOpen = menu.open && menu.path === pathname;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const setMenuOpen = (open: boolean) => setMenu({ open, path: pathname });

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-500 ${
        scrolled
          ? "border-b border-obsidian-900/8 bg-alabaster/85 backdrop-blur-xl shadow-[0_10px_40px_-30px_rgba(15,23,42,0.6)]"
          : "border-b border-transparent bg-alabaster/60 backdrop-blur-sm"
      }`}
    >
      <nav className="container-page flex h-[4.25rem] items-center justify-between gap-4">
        <Link href="/" aria-label="AUREX Global" className="shrink-0">
          <BrandMark />
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => (
            <li key={link.key}>
              <Link
                href={link.href}
                className="rounded-full px-3.5 py-2 text-sm font-medium text-obsidian-700 transition-colors duration-200 hover:bg-obsidian-900/5 hover:text-obsidian-900"
              >
                {t(link.key)}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2.5">
          <LanguageSwitcher />

          <Link
            href="/#order"
            className="btn btn-obsidian hidden px-5 py-2.5 text-sm sm:inline-flex"
          >
            {t("nav.quoteCta")}
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? t("nav.closeMenu") : t("nav.openMenu")}
            aria-expanded={menuOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-obsidian-900/12 bg-white text-obsidian-800 transition-colors hover:border-gold-400/60 lg:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden="true"
            >
              {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="animate-fade-up border-t border-obsidian-900/8 bg-alabaster/95 backdrop-blur-xl lg:hidden">
          <ul className="container-page flex flex-col py-3">
            {LINKS.map((link) => (
              <li key={link.key}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-xl px-3 py-3 text-sm font-medium text-obsidian-700 transition-colors hover:bg-obsidian-900/5 hover:text-obsidian-900"
                >
                  {t(link.key)}
                </Link>
              </li>
            ))}
            <li className="mt-2 sm:hidden">
              <Link
                href="/#order"
                onClick={() => setMenuOpen(false)}
                className="btn btn-gold w-full px-5 py-3 text-sm"
              >
                {t("nav.quoteCta")}
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
