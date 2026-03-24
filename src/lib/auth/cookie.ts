import type { NextRequest } from "next/server";
import { getPublicBaseUrl } from "@/lib/config/env";

const AUTH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

export const AUTH_COOKIE_NAME = "stayneos_auth_token";

function resolveCookieDomain(hostname?: string): string | undefined {
  const baseHostname = new URL(getPublicBaseUrl()).hostname;
  const target = hostname || baseHostname;
  if (["localhost", "127.0.0.1", "::1"].includes(target)) return undefined;
  return `.${baseHostname}`;
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
