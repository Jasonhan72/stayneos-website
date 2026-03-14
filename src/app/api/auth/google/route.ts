export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/d1";

export async function GET() {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const baseUrl = process.env.NEXTAUTH_URL || "https://stayneos.com";
    
    if (!clientId) {
      return NextResponse.json(
        { message: "Google OAuth configuration error" },
        { status: 500 }
      );
    }

    // Generate state and store in D1 (cookies unreliable in Cloudflare cross-origin redirects)
    const state = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 600000).toISOString(); // 10 min

    const db = getDb();
    await db
      .prepare("INSERT INTO OAuthState (id, state, expiresAt) VALUES (?, ?, ?)")
      .bind(crypto.randomUUID(), state, expiresAt)
      .run();
    
    // Build Google OAuth URL
    const googleOAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    googleOAuthUrl.searchParams.set("client_id", clientId);
    googleOAuthUrl.searchParams.set("redirect_uri", `${baseUrl}/api/auth/google/callback`);
    googleOAuthUrl.searchParams.set("response_type", "code");
    googleOAuthUrl.searchParams.set("scope", "openid email profile");
    googleOAuthUrl.searchParams.set("state", state);
    googleOAuthUrl.searchParams.set("prompt", "consent");
    googleOAuthUrl.searchParams.set("access_type", "offline");
    
    return NextResponse.redirect(googleOAuthUrl.toString());
  } catch {
    console.error("Google OAuth error");
    return NextResponse.json(
      { message: "OAuth initialization failed" },
      { status: 500 }
    );
  }
}