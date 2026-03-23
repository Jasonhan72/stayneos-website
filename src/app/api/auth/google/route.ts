export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getAuthSecret, getPublicBaseUrl } from "@/lib/config/env";

const DEFAULT_REDIRECT = "/dashboard";

function sanitizeRedirect(redirect: string | null) {
  if (!redirect || !redirect.startsWith("/") || redirect.startsWith("//")) {
    return DEFAULT_REDIRECT;
  }
  return redirect;
}

async function hmacSign(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}



function getCookieOptions(request: NextRequest) {
  const url = new URL(request.url);
  const isHttps = url.protocol === "https:";
  const isLocalhost = ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  const isStayneosDomain = url.hostname === "stayneos.com" || url.hostname.endsWith(".stayneos.com");

  return {
    httpOnly: true as const,
    secure: isHttps,
    sameSite: "lax" as const,
    maxAge: 600, // 10 min
    path: "/",
    ...(!isLocalhost && isStayneosDomain ? { domain: ".stayneos.com" } : {}),
  };
}
export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const baseUrl = getPublicBaseUrl();
    const jwtSecret = getAuthSecret();
    const redirect = sanitizeRedirect(new URL(request.url).searchParams.get("redirect"));
    
    if (!clientId) {
      return NextResponse.json(
        { message: "Google OAuth configuration error" },
        { status: 500 }
      );
    }

    // Generate state with HMAC signature (no D1 dependency)
    const nonce = crypto.randomUUID();
    const expires = Date.now() + 600000; // 10 min
    const stateData = `${nonce}:${expires}`;
    const signature = await hmacSign(stateData, jwtSecret);
    const signedState = `${stateData}:${signature}`;
    
    const state = JSON.stringify({ nonce, redirect });
    
    // Build Google OAuth URL
    const googleOAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    googleOAuthUrl.searchParams.set("client_id", clientId);
    googleOAuthUrl.searchParams.set("redirect_uri", `${baseUrl}/api/auth/google/callback`);
    googleOAuthUrl.searchParams.set("response_type", "code");
    googleOAuthUrl.searchParams.set("scope", "openid email profile");
    googleOAuthUrl.searchParams.set("state", state);
    googleOAuthUrl.searchParams.set("prompt", "consent");
    googleOAuthUrl.searchParams.set("access_type", "offline");
    
    const response = NextResponse.redirect(googleOAuthUrl.toString());
    
    // Store signed state in cookie for verification on callback
    response.cookies.set("oauth_state", signedState, getCookieOptions(request));
    
    return response;
  } catch (err) {
    console.error("Google OAuth error:", err);
    return NextResponse.json(
      { message: "OAuth initialization failed" },
      { status: 500 }
    );
  }
}
