import type { NextRequest } from "next/server";

const AUTH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

export const AUTH_COOKIE_NAME = "stayneos_auth_token";

function resolveCookieDomain(hostname?: string): string | undefined {
  const target = hostname || "stayneos.com";
  const isLocalhost = ["localhost", "127.0.0.1", "::1"].includes(target);
  if (isLocalhost) return undefined;
  if (target === "stayneos.com" || target.endsWith(".stayneos.com")) return ".stayneos.com";
  return undefined;
}

export function getAuthCookieOptions(request?: NextRequest) {
  if (!request) {
    return {
      domain: resolveCookieDomain(),
      path: "/",
      httpOnly: true as const,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: AUTH_COOKIE_MAX_AGE,
    };
  }

  const url = new URL(request.url);
  const isHttps = url.protocol === "https:";
  const domain = resolveCookieDomain(url.hostname);

  return {
    path: "/",
    httpOnly: true as const,
    secure: isHttps,
    sameSite: "lax" as const,
    maxAge: AUTH_COOKIE_MAX_AGE,
    ...(domain ? { domain } : {}),
  };
}

export function getClearedAuthCookieOptions(request?: NextRequest) {
  return {
    ...getAuthCookieOptions(request),
    maxAge: 0,
  };
}
