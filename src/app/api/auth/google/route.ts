export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Get environment variables
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const baseUrl = process.env.NEXTAUTH_URL || "https://stayneos.com";
    
    if (!clientId) {
      console.error("Missing GOOGLE_CLIENT_ID");
      return NextResponse.json(
        { message: "Google OAuth configuration error" },
        { status: 500 }
      );
    }

    // Generate state parameter for CSRF protection
    const state = crypto.randomUUID();
    
    // Build Google OAuth URL
    const googleOAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    googleOAuthUrl.searchParams.set("client_id", clientId);
    googleOAuthUrl.searchParams.set("redirect_uri", `${baseUrl}/api/auth/google/callback`);
    googleOAuthUrl.searchParams.set("response_type", "code");
    googleOAuthUrl.searchParams.set("scope", "openid email profile");
    googleOAuthUrl.searchParams.set("state", state);
    
    // Create response with redirect
    const response = NextResponse.redirect(googleOAuthUrl.toString());
    
    // Set state in httpOnly cookie for verification
    response.cookies.set("oauth_state", state, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 600, // 10 minutes
      path: "/"
    });

    return response;
  } catch (error) {
    console.error("Google OAuth error:", error);
    return NextResponse.json(
      { message: "OAuth initialization failed" },
      { status: 500 }
    );
  }
}