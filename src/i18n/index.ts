import EN_TRANSLATIONS from "./locales/en.json";

export const DEFAULT_APP_LOCALE = "en";
export const SYSTEM_UI_LANGUAGE = "system";

export const APP_LOCALES = [
  "en",
  "be-BY",
  "ru-RU",
  "uk-UA",
  "pl-PL",
  "de-DE",
] as const;

export type AppLocale = (typeof APP_LOCALES)[number];
export type UiLanguagePreference = typeof SYSTEM_UI_LANGUAGE | AppLocale;
export type TranslationCatalog = typeof EN_TRANSLATIONS;
export type TranslationKey = keyof TranslationCatalog;
export type TranslationValues = Record<string, string | number>;

type LocaleDefinition = {
  code: AppLocale;
  dateLocale: string;
  labelKey: TranslationKey;
  aliases: readonly string[];
  searchKeywords: readonly string[];
};

const LOCALE_DEFINITIONS: Record<AppLocale, LocaleDefinition> = {
  en: {
    code: "en",
    dateLocale: "en-US",
    labelKey: "locale.en",
    aliases: ["en", "en-us", "en-gb"],
    searchKeywords: ["english", "en"],
  },
  "be-BY": {
    code: "be-BY",
    dateLocale: "be-BY",
    labelKey: "locale.beBY",
    aliases: ["be", "be-by"],
    searchKeywords: ["belarusian", "беларуская", "be", "be-by"],
  },
  "ru-RU": {
    code: "ru-RU",
    dateLocale: "ru-RU",
    labelKey: "locale.ruRU",
    aliases: ["ru", "ru-ru"],
    searchKeywords: ["russian", "russkiy", "русский", "ru", "ru-ru"],
  },
  "uk-UA": {
    code: "uk-UA",
    dateLocale: "uk-UA",
    labelKey: "locale.ukUA",
    aliases: ["uk", "uk-ua"],
    searchKeywords: ["ukrainian", "українська", "uk", "uk-ua"],
  },
  "pl-PL": {
    code: "pl-PL",
    dateLocale: "pl-PL",
    labelKey: "locale.plPL",
    aliases: ["pl", "pl-pl"],
    searchKeywords: ["polish", "polski", "polska", "pl", "pl-pl"],
  },
  "de-DE": {
    code: "de-DE",
    dateLocale: "de-DE",
    labelKey: "locale.deDE",
    aliases: ["de", "de-de"],
    searchKeywords: ["german", "deutsch", "de", "de-de"],
  },
};

const NORMALIZED_LOCALE_LOOKUP = new Map<string, AppLocale>();
for (const locale of APP_LOCALES) {
  const definition = LOCALE_DEFINITIONS[locale];
  NORMALIZED_LOCALE_LOOKUP.set(locale.toLowerCase(), locale);
  for (const alias of definition.aliases) {
    NORMALIZED_LOCALE_LOOKUP.set(alias, locale);
  }
}

const LOCALE_MODULES = import.meta.glob("./locales/*.json", {
  eager: true,
  import: "default",
}) as Record<string, TranslationCatalog>;
const TRANSLATIONS: Partial<
  Record<AppLocale, Partial<Record<TranslationKey, string>>>
> = buildTranslations();

export const APP_LOCALE_DEFINITIONS = APP_LOCALES.map(
  (locale) => LOCALE_DEFINITIONS[locale],
);
export { EN_TRANSLATIONS };

function buildTranslations() {
  const translations: Partial<
    Record<AppLocale, Partial<Record<TranslationKey, string>>>
  > = {
    en: EN_TRANSLATIONS,
  };

  for (const [path, catalog] of Object.entries(LOCALE_MODULES)) {
    const match = path.match(/\/([^/]+)\.json$/);
    if (!match) continue;

    const locale = normalizeLocaleCode(match[1]);
    if (!locale || locale === "en") continue;

    translations[locale] = catalog;
  }

  return translations;
}

export function interpolate(
  template: string,
  values: TranslationValues = {},
): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    const value = values[key];
    return value === undefined ? match : String(value);
  });
}

export function translate(
  locale: AppLocale,
  key: TranslationKey,
  values?: TranslationValues,
): string {
  const template = TRANSLATIONS[locale]?.[key] ?? EN_TRANSLATIONS[key];
  return interpolate(template, values);
}

export function createTranslator(locale: AppLocale = DEFAULT_APP_LOCALE) {
  return (key: TranslationKey, values?: TranslationValues) =>
    translate(locale, key, values);
}

function normalizeLocaleCode(value: string): AppLocale | null {
  const normalized = value.trim().replace(/_/g, "-").toLowerCase();
  if (!normalized) return null;

  const exactMatch = NORMALIZED_LOCALE_LOOKUP.get(normalized);
  if (exactMatch) return exactMatch;

  const languageMatches = APP_LOCALES.filter((locale) =>
    locale.toLowerCase().startsWith(`${normalized}-`),
  );
  return languageMatches.length === 1 ? languageMatches[0] : null;
}

export function resolveEffectiveLocale(
  preference: unknown,
  languagePreferences: readonly string[] = getBrowserLanguagePreferences(),
): AppLocale {
  const normalizedPreference = normalizeUiLanguagePreference(preference);
  if (normalizedPreference && normalizedPreference !== SYSTEM_UI_LANGUAGE) {
    return normalizedPreference;
  }

  for (const language of languagePreferences) {
    const locale = normalizeLocaleCode(language);
    if (locale) return locale;
  }

  return DEFAULT_APP_LOCALE;
}

export function normalizeUiLanguagePreference(
  value: unknown,
): UiLanguagePreference | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const lower = trimmed.toLowerCase();
  if (lower === SYSTEM_UI_LANGUAGE || lower === "auto")
    return SYSTEM_UI_LANGUAGE;
  return normalizeLocaleCode(trimmed);
}

export function getBrowserLanguagePreferences(): string[] {
  if (typeof navigator === "undefined") return [];
  const languages = Array.isArray(navigator.languages)
    ? navigator.languages
    : [];
  if (languages.length > 0) return [...languages];
  return navigator.language ? [navigator.language] : [];
}

export function localeDisplayName(
  locale: AppLocale,
  displayLocale: AppLocale = locale,
): string {
  return translate(displayLocale, LOCALE_DEFINITIONS[locale].labelKey);
}
