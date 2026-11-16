"use client";

import { useEffect, useRef, useState } from "react";

import { useI18n } from "@/i18n/I18nProvider";
import { languageMeta, type Language } from "@/i18n/types";

/**
 * Compact language switcher (Arabic · English · Turkish).
 * The choice is persisted in a cookie so the server can render the correct
 * `lang`/`dir` attributes and copy.
 */
export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage, t } = useI18n();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const current = languageMeta[language];

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("common.language")}
        className={`group inline-flex items-center gap-2 rounded-full border border-obsidian-900/12 bg-white/80 px-3 py-1.5 text-sm font-medium text-obsidian-800 transition-all duration-300 hover:border-gold-400/60 hover:bg-white hover:shadow-[0_8px_24px_-14px_rgba(15,23,42,0.45)] ${
          open ? "border-gold-400/70 bg-white" : ""
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 text-gold-500 transition-transform duration-300 group-hover:rotate-12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18" />
        </svg>
        {!compact && (
          <span className="hidden sm:inline" dir={current.dir}>
            {current.nativeLabel}
          </span>
        )}
        <svg
          viewBox="0 0 24 24"
          className={`h-3.5 w-3.5 text-slate-mid transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t("common.language")}
          className="animate-fade-up absolute end-0 z-50 mt-2 w-44 overflow-hidden rounded-2xl border border-obsidian-900/10 bg-white p-1.5 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.45)]"
        >
          {(["ar", "en", "tr"] as Language[]).map((code) => {
            const meta = languageMeta[code];
            const isActive = code === language;
            return (
              <li key={code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    setLanguage(code);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm transition-colors duration-200 ${
                    isActive
                      ? "bg-gold-400/12 font-semibold text-obsidian-900"
                      : "text-obsidian-700 hover:bg-obsidian-900/5"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="text-base leading-none">{meta.flag}</span>
                    <span dir={meta.dir}>{meta.nativeLabel}</span>
                  </span>
                  {isActive && (
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4 text-gold-500"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      aria-hidden="true"
                    >
                      <path d="m5 13 4 4L19 7" />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
