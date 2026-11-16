"use client";

import { useState } from "react";

import { useI18n } from "@/i18n/I18nProvider";

/**
 * FAQ accordion with smooth expand/collapse.
 */
export function FAQ() {
  const { t } = useI18n();
  const [open, setOpen] = useState<string | null>("q1");

  const items = ["q1", "q2", "q3", "q4", "q5", "q6"] as const;

  return (
    <section id="faq" className="relative scroll-mt-28 bg-mist py-20 lg:py-28">
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-gold-600">
              {t("faq.eyebrow")}
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-obsidian-900 sm:text-4xl">
              {t("faq.title")}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-obsidian-600">
              {t("faq.subtitle")}
            </p>
          </div>

          <div className="lg:col-span-8">
            <ul className="space-y-3">
              {items.map((item) => {
                const isOpen = open === item;
                return (
                  <li
                    key={item}
                    className={`overflow-hidden rounded-2xl border bg-white transition-all duration-300 ${
                      isOpen
                        ? "border-gold-400/45 shadow-[0_18px_44px_-30px_rgba(212,175,55,0.95)]"
                        : "border-obsidian-900/8 hover:border-gold-400/30"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : item)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start sm:px-6 sm:py-5"
                    >
                      <span className="flex items-start gap-3.5">
                        <span
                          className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-[0.6rem] font-bold transition-colors duration-300 ${
                            isOpen
                              ? "bg-gold-400 text-obsidian-950"
                              : "bg-obsidian-900/6 text-slate-mid"
                          }`}
                        >
                          {item.slice(1)}
                        </span>
                        <span className="text-sm font-semibold text-obsidian-900 sm:text-[0.95rem]">
                          {t(`faq.items.${item}.q`)}
                        </span>
                      </span>

                      <span
                        className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border transition-all duration-300 ${
                          isOpen
                            ? "rotate-45 border-gold-400 bg-gold-400/10 text-gold-600"
                            : "border-obsidian-900/12 text-slate-mid"
                        }`}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-3.5 w-3.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          aria-hidden="true"
                        >
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </span>
                    </button>

                    <div
                      className="grid transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]"
                      style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                    >
                      <div className="overflow-hidden">
                        <p className="px-5 pb-5 ps-[3.35rem] text-sm leading-relaxed text-obsidian-600 sm:px-6 sm:pb-6 sm:ps-[3.6rem]">
                          {t(`faq.items.${item}.a`)}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
