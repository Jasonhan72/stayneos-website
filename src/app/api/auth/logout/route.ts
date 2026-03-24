export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, getClearedAuthCookieOptions } from "@/lib/auth/cookie";
import { getPublicBaseUrl } from "@/lib/config/env";

export async function POST() {
  const response = NextResponse.json({ message: "已登出", success: true });
  response.cookies.set(AUTH_COOKIE_NAME, "", getClearedAuthCookieOptions());
  return response;
}

export async function GET() {
  const response = NextResponse.redirect(new URL("/login", getPublicBaseUrl()));
  response.cookies.set(AUTH_COOKIE_NAME, "", getClearedAuthCookieOptions());
  return response;
}
