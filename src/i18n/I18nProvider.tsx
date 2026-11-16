"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { getDictionary, translate } from "./index";
import {
  defaultLanguage,
  isLanguage,
  languageMeta,
  type DictPath,
  type Language,
  type TranslateValues,
} from "./types";

const STORAGE_KEY = "aurex_lang";
export const LANGUAGE_COOKIE = "aurex_lang";

interface I18nContextValue {
  language: Language;
  dir: "rtl" | "ltr";
  locale: string;
  t: (path: DictPath | string, values?: TranslateValues) => string;
  setLanguage: (language: Language) => void;
  languages: Language[];
  languageMeta: typeof languageMeta;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  initialLanguage,
  children,
}: {
  initialLanguage: Language;
  children: ReactNode;
}) {
  const router = useRouter();
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  const setLanguage = useCallback(
    (next: Language) => {
      if (!isLanguage(next) || next === language) return;
      setLanguageState(next);

      // Persist for the server-rendered pass (html lang/dir + SSR copy).
      const maxAge = 60 * 60 * 24 * 365;
      document.cookie = `${LANGUAGE_COOKIE}=${next}; path=/; max-age=${maxAge}; samesite=lax`;
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* storage unavailable — cookie is the source of truth */
      }

      // Re-render server components with the new locale.
      router.refresh();
    },
    [language, router],
  );

  const value = useMemo<I18nContextValue>(() => {
    const dictionary = getDictionary(language);
    const meta = languageMeta[language];
    return {
      language,
      dir: meta.dir,
      locale: meta.locale,
      languages: ["ar", "en", "tr"],
      languageMeta,
      t: (path, values) => translate(dictionary, path, values),
      setLanguage,
    };
  }, [language, setLanguage]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used inside <I18nProvider>");
  }
  return ctx;
}

/** Convenience hook for components that only need the dictionary. */
export function useDictionary() {
  const { language } = useI18n();
  return useMemo(() => getDictionary(language), [language]);
}

export { defaultLanguage };
