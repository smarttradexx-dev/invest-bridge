import type { Language } from "./types";

/**
 * Locale-aware formatting helpers.
 * Prices are always quoted in USD, so the currency format is fixed to keep
 * the number identical across the three languages.
 */

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatUSD(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return "—";
  return usdFormatter.format(amount);
}

export function formatNumber(amount: number | null | undefined, locale = "en-US"): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return "—";
  return new Intl.NumberFormat(locale).format(amount);
}

export function formatDate(
  iso: string | null | undefined,
  language: Language = "en",
): string {
  if (!iso) return "—";
  const date = new Date(iso.includes("T") ? iso : `${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return "—";
  const locale = language === "ar" ? "ar-SY" : language === "tr" ? "tr-TR" : "en-GB";
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Europe/Istanbul",
  }).format(date);
}

export function formatDateTime(
  iso: string | null | undefined,
  language: Language = "en",
): string {
  if (!iso) return "—";
  const date = new Date(iso.includes("T") ? iso : `${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return "—";
  const locale = language === "ar" ? "ar-SY" : language === "tr" ? "tr-TR" : "en-GB";
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Istanbul",
  }).format(date);
}

/** Strip everything but digits — used to build wa.me links. */
export function normalizePhone(raw: string): string {
  return (raw ?? "").replace(/\D/g, "");
}

/** Last 4 digits, used to lightly identify a customer in the admin UI. */
export function maskPhone(raw: string): string {
  const digits = normalizePhone(raw);
  if (digits.length < 4) return raw;
  return `••• ${digits.slice(-4)}`;
}
