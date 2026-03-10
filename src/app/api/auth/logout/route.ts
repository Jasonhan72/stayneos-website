export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "已登出", success: true });

  // Clear auth cookie
  response.cookies.set("stayneos_auth_token", "", {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
  });

  return response;
}

export async function GET() {
  const response = NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL || "https://stayneos.com"));

  response.cookies.set("stayneos_auth_token", "", {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
  });

  return response;
}
