export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, getClearedAuthCookieOptions } from "@/lib/auth/cookie";

export async function POST() {
  const response = NextResponse.json({ message: "已登出", success: true });
  response.cookies.set(AUTH_COOKIE_NAME, "", getClearedAuthCookieOptions());
  return response;
}

export async function GET() {
  const response = NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL || "https://stayneos.com"));
  response.cookies.set(AUTH_COOKIE_NAME, "", getClearedAuthCookieOptions());
  return response;
}
