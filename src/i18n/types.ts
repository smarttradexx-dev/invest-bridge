/**
 * Dictionary contract.
 *
 * `en` is the source of truth; `ar` and `tr` are checked against it at
 * compile time (`satisfies Dictionary`), so a missing or renamed key is a
 * build error rather than a runtime "undefined" in the UI.
 */

export const languages = ["ar", "en", "tr"] as const;
export type Language = (typeof languages)[number];

export const defaultLanguage: Language = "ar";

export const languageMeta: Record<
  Language,
  { label: string; nativeLabel: string; dir: "rtl" | "ltr"; locale: string; flag: string }
> = {
  ar: { label: "Arabic", nativeLabel: "العربية", dir: "rtl", locale: "ar-SY", flag: "🇸🇾" },
  en: { label: "English", nativeLabel: "English", dir: "ltr", locale: "en-US", flag: "🇬🇧" },
  tr: { label: "Turkish", nativeLabel: "Türkçe", dir: "ltr", locale: "tr-TR", flag: "🇹🇷" },
};

export const isLanguage = (value: unknown): value is Language =>
  typeof value === "string" && (languages as readonly string[]).includes(value);

/** Dot-path type derived from the English dictionary. */
export type Leaves<T> = T extends string
  ? never
  : {
      [K in keyof T & string]: T[K] extends string
        ? K
        : T[K] extends number
          ? K
          : `${K}.${Leaves<T[K]>}`;
    }[keyof T & string];

export type Dict = typeof import("./dictionaries/en").default;
export type DictPath = Leaves<Dict>;

export type TranslateValues = Record<string, string | number>;
