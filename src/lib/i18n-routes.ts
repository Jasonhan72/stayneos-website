import type { Locale } from "@/lib/i18n";

const LOCALES = ["en", "fr", "zh"] as const;

export function getLocalePrefix(pathname: string): Locale | null {
  const firstSegment = pathname.split("/")[1];
  return LOCALES.includes(firstSegment as Locale) ? (firstSegment as Locale) : null;
}

export function stripLocalePrefix(pathname: string): string {
  const locale = getLocalePrefix(pathname);
  if (!locale) return pathname || "/";

  const stripped = pathname.slice(locale.length + 1);
  return stripped.startsWith("/") ? stripped || "/" : `/${stripped}`;
}

export function localizePath(pathname: string, locale: Locale): string {
  if (!pathname.startsWith("/")) return pathname;

  const normalized = stripLocalePrefix(pathname);
  if (locale === "en") return normalized;
  return normalized === "/" ? `/${locale}` : `/${locale}${normalized}`;
}
