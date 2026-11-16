"use client";

import { useEffect, useRef, useState } from "react";

import { useI18n } from "@/i18n/I18nProvider";

/**
 * Live countdown to the next Thursday shipment cutoff.
 * Computes the target in Turkish time (UTC+3) so every customer sees the
 * same deadline regardless of their device timezone.
 */
export function AnnouncementBar() {
  const { t, language } = useI18n();
  const [remaining, setRemaining] = useState<number | null>(null);
  const [cutoff, setCutoff] = useState<Date | null>(null);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    const compute = () => {
      const now = new Date();
      const hour = 11; // 14:00 Turkey time (UTC+3)
      const utcDay = now.getUTCDay();
      const daysUntilThursday = (4 - utcDay + 7) % 7;

      const target = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hour, 0, 0),
      );
      target.setUTCDate(target.getUTCDate() + daysUntilThursday);
      if (target.getTime() <= now.getTime()) {
        target.setUTCDate(target.getUTCDate() + 7);
      }

      setCutoff(target);
      setRemaining(Math.max(0, target.getTime() - now.getTime()));
    };

    compute();
    const tick = () => {
      setRemaining((prev) => (prev === null ? prev : Math.max(0, prev - 1000)));
    };
    const id = window.setInterval(tick, 1000);
    frame.current = id;
    return () => window.clearInterval(id);
  }, []);

  if (remaining === null) {
    return (
      <div className="bg-obsidian-900 text-alabaster" style={{ height: "var(--header-height)" }} />
    );
  }

  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (value: number) => String(value).padStart(2, "0");

  const units: { value: string; label: string }[] = [
    { value: pad(days), label: t("announcement.days") },
    { value: pad(hours), label: t("announcement.hours") },
    { value: pad(minutes), label: t("announcement.minutes") },
    { value: pad(seconds), label: t("announcement.seconds") },
  ];

  const cutoffLabel = cutoff
    ? new Intl.DateTimeFormat(
        language === "ar" ? "ar-SY" : language === "tr" ? "tr-TR" : "en-GB",
        {
          weekday: "long",
          day: "numeric",
          month: "long",
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Europe/Istanbul",
        },
      ).format(cutoff)
    : "";

  return (
    <div
      className="relative z-50 overflow-hidden bg-obsidian-900 text-alabaster"
      role="status"
      aria-live="off"
    >
      <div className="hairline absolute inset-x-0 bottom-0 h-px" />
      <div className="container-page flex min-h-[var(--header-height)] flex-col items-center justify-center gap-2 py-2.5 md:flex-row md:gap-6 md:py-0">
        <div className="flex items-center gap-2.5 text-center">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-400 opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-gold-400" />
          </span>
          <p className="text-[0.72rem] font-medium tracking-wide text-alabaster/85 sm:text-sm">
            {t("announcement.timeLeft")}
          </p>
        </div>

        <div
          className="flex items-center gap-1.5 sm:gap-2.5"
          dir="ltr"
          aria-label={t("announcement.timeLeft")}
        >
          {units.map((unit, index) => (
            <div key={unit.label} className="flex items-center gap-1.5 sm:gap-2.5">
              {index > 0 && (
                <span className="text-gold-400/70 text-lg font-light leading-none">:</span>
              )}
              <span className="flex items-baseline gap-1 rounded-lg border border-gold-400/25 bg-obsidian-800/70 px-2 py-1 backdrop-blur-sm">
                <span className="font-mono text-sm font-semibold tabular-nums text-gold-300 sm:text-base">
                  {unit.value}
                </span>
                <span className="text-[0.6rem] font-medium uppercase tracking-wider text-alabaster/60">
                  {unit.label}
                </span>
              </span>
            </div>
          ))}
        </div>

        <p className="hidden text-[0.72rem] text-alabaster/55 lg:block">
          {cutoffLabel ? `${t("announcement.cutoffNote")} · ${cutoffLabel}` : t("announcement.cutoffNote")}
        </p>
      </div>
    </div>
  );
}
