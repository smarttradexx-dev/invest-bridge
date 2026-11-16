import ar from "./dictionaries/ar";
import en from "./dictionaries/en";
import tr from "./dictionaries/tr";
import {
  defaultLanguage,
  isLanguage,
  languageMeta,
  languages,
  type Dict,
  type Language,
} from "./types";

export * from "./types";
export { defaultLanguage, isLanguage, languageMeta, languages };

const dictionaries: Record<Language, Dict> = { ar, en, tr };

export function getDictionary(language: Language): Dict {
  return dictionaries[language] ?? dictionaries[defaultLanguage];
}

/**
 * Resolve a dot-path ("hero.title") inside a dictionary.
 * Falls back to the English string, then to the raw path, so a missing
 * translation degrades gracefully instead of rendering "undefined".
 */
export function translate(
  dictionary: Dict,
  path: string,
  values?: Record<string, string | number>,
): string {
  const resolve = (source: Dict): unknown =>
    path
      .split(".")
      .reduce<unknown>(
        (acc, key) =>
          acc && typeof acc === "object" && key in (acc as Record<string, unknown>)
            ? (acc as Record<string, unknown>)[key]
            : undefined,
        source,
      );

  const resolved = resolve(dictionary);
  let text =
    typeof resolved === "string"
      ? resolved
      : (() => {
          const fallback = resolve(en);
          return typeof fallback === "string" ? fallback : path;
        })();

  if (values) {
    for (const [key, replacement] of Object.entries(values)) {
      text = text.replaceAll(`{${key}}`, String(replacement));
    }
  }
  return text;
}
