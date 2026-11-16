import { cookies } from "next/headers";

import { getDictionary, translate } from "./index";
import { defaultLanguage, isLanguage, languageMeta, type Language } from "./types";

export const LANGUAGE_COOKIE = "aurex_lang";

/**
 * Resolve the active language on the server.
 * Cookie first (set by the language switcher), then the Accept-Language
 * header, then the Arabic default.
 */
export async function resolveLanguage(): Promise<Language> {
  const store = await cookies();
  const fromCookie = store.get(LANGUAGE_COOKIE)?.value;
  if (isLanguage(fromCookie)) return fromCookie;

  const header = (await headersAcceptLanguage()) ?? "";
  const preferred = header
    .split(",")
    .map((part) => part.split(";")[0]?.trim().toLowerCase())
    .filter(Boolean);

  for (const candidate of preferred) {
    const base = candidate.split("-")[0];
    if (isLanguage(base)) return base as Language;
  }
  return defaultLanguage;
}

async function headersAcceptLanguage(): Promise<string | undefined> {
  const { headers } = await import("next/headers");
  const h = await headers();
  return h.get("accept-language") ?? undefined;
}

export async function getServerDictionary() {
  const language = await resolveLanguage();
  return {
    language,
    dir: languageMeta[language].dir,
    dictionary: getDictionary(language),
  };
}

/** Bound translate function for server components. */
export async function getServerT() {
  const { dictionary } = await getServerDictionary();
  return (path: string, values?: Record<string, string | number>) =>
    translate(dictionary, path, values);
}
