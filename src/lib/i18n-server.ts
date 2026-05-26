import { cookies, headers } from "next/headers";
import en from "../../messages/en";
import fr from "../../messages/fr";
import zh from "../../messages/zh";

export type ServerLocale = "en" | "fr" | "zh";

const translations = { en, fr, zh } as const;
const LOCALE_COOKIE_KEY = "stayneos_locale";
const LOCALE_HEADER_KEY = "x-locale";

function isSupportedLocale(value?: string | null): value is ServerLocale {
  return value === "en" || value === "fr" || value === "zh";
}

function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split(".");
  let value: unknown = obj;

  for (const key of keys) {
    if (value && typeof value === "object" && key in value) {
      value = (value as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }

  return typeof value === "string" ? value : undefined;
}

export async function resolveRequestLocale(): Promise<ServerLocale> {
  const headerStore = await headers();
  const headerLocale = headerStore.get(LOCALE_HEADER_KEY);
  if (isSupportedLocale(headerLocale)) {
    return headerLocale;
  }

  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE_KEY)?.value;
  if (isSupportedLocale(cookieLocale)) {
    return cookieLocale;
  }

  return "en";
}

export function getServerTranslation(locale: ServerLocale, key: string, fallback?: string): string {
  return getNestedValue(translations[locale] as Record<string, unknown>, key) ?? fallback ?? key;
}

export function getOgLocale(locale: ServerLocale): string {
  if (locale === "zh") return "zh_CN";
  if (locale === "fr") return "fr_CA";
  return "en_US";
}

export function getHtmlLang(locale: ServerLocale): string {
  if (locale === "zh") return "zh-CN";
  if (locale === "fr") return "fr-CA";
  return "en";
}
