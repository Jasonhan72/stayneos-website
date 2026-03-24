import type { NextRequest } from "next/server";

const AUTH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

export const AUTH_COOKIE_NAME = "stayneos_auth_token";

export function getAuthCookieOptions(request?: NextRequest) {
  if (!request) {
    return {
      domain: ".stayneos.com",
      path: "/",
      httpOnly: true as const,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: AUTH_COOKIE_MAX_AGE,
    };
  }

  const url = new URL(request.url);
  const isHttps = url.protocol === "https:";
  const isLocalhost = ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  const isStayneosDomain = url.hostname === "stayneos.com" || url.hostname.endsWith(".stayneos.com");

  return {
    path: "/",
    httpOnly: true as const,
    secure: isHttps,
    sameSite: "lax" as const,
    maxAge: AUTH_COOKIE_MAX_AGE,
    ...(!isLocalhost && isStayneosDomain ? { domain: ".stayneos.com" } : {}),
  };
}

export function getClearedAuthCookieOptions(request?: NextRequest) {
  return {
    ...getAuthCookieOptions(request),
    maxAge: 0,
  };
}
