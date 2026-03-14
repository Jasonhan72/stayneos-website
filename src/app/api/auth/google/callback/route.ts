import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { signToken } from "@/lib/auth/jwt";
import { userDb, accountDb, getDb } from "@/lib/d1";

export const dynamic = "force-dynamic";

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
  id_token?: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // Check for OAuth error
    if (error) {
      console.error("Google OAuth error from provider:", error);
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL || "https://stayneos.com"}/login?error=oauth_error&error_detail=${encodeURIComponent(error)}`
      );
    }

    // Verify required parameters
    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL || "https://stayneos.com"}/login?error=missing_params`
      );
    }

    // Verify state parameter via D1 (cookies unreliable in Cloudflare cross-origin redirects)
    const db = getDb();
    const stateRow = await db
      .prepare("SELECT id FROM OAuthState WHERE state = ? AND expiresAt > ?")
      .bind(state, new Date().toISOString())
      .first<{ id: string }>();

    if (!stateRow) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL || "https://stayneos.com"}/login?error=invalid_state`
      );
    }

    // Delete used state (single-use)
    await db.prepare("DELETE FROM OAuthState WHERE state = ?").bind(state).run();

    // Get environment variables
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const baseUrl = process.env.NEXTAUTH_URL || "https://stayneos.com";

    if (!clientId || !clientSecret) {
      console.error("Missing Google OAuth credentials");
      return NextResponse.redirect(`${baseUrl}/login?error=config_error`);
    }

    // Step 1: Exchange code for access token
    console.log("Exchanging code for token...");
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: `${baseUrl}/api/auth/google/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Google token exchange failed:", errorText);
      return NextResponse.redirect(`${baseUrl}/login?error=token_exchange_failed&detail=${encodeURIComponent(errorText.slice(0, 200))}`);
    }

    const tokenData: GoogleTokenResponse = await tokenResponse.json();
    console.log("Token received, fetching user info...");

    // Step 2: Get user info from Google
    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );

    if (!userInfoResponse.ok) {
      const errorText = await userInfoResponse.text();
      console.error("Failed to fetch Google user info:", errorText);
      return NextResponse.redirect(`${baseUrl}/login?error=user_info_failed&detail=${encodeURIComponent(errorText.slice(0, 200))}`);
    }

    const googleUser: GoogleUserInfo = await userInfoResponse.json();
    console.log("User info received:", googleUser.email, googleUser.name);

    if (!googleUser.verified_email) {
      return NextResponse.redirect(`${baseUrl}/login?error=email_not_verified`);
    }

    // Step 3: Handle user in database (reuse db from state check)
    console.log("Step 3: Handling user in database...");

    // Check if account already exists
    console.log("Checking for existing account with providerAccountId:", googleUser.id);
    const existingAccount = await accountDb.findByProviderAccountId(
      db,
      "google",
      googleUser.id
    );

    let user;
    let userId;

    if (existingAccount) {
      // User already has Google account linked
      console.log("Existing account found, userId:", existingAccount.userId);
      user = await userDb.findById(db, existingAccount.userId);
      if (!user) {
        console.error("User not found for existing Google account:", existingAccount.userId);
        return NextResponse.redirect(`${baseUrl}/login?error=user_not_found`);
      }
      console.log("Existing user found:", user.email, user.name);
      userId = user.id;
    } else {
      // Check if user exists by email
      console.log("No existing account, checking by email:", googleUser.email);
      const existingUser = await userDb.findByEmail(db, googleUser.email);

      if (existingUser) {
        // Link Google account to existing user
        console.log("Existing user found by email, linking Google account...");
        userId = existingUser.id;
        user = existingUser;

        // Create account record
        await accountDb.create(db, {
          userId: existingUser.id,
          type: "oauth",
          provider: "google",
          providerAccountId: googleUser.id,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: tokenData.expires_in ?
            Math.floor(Date.now() / 1000) + tokenData.expires_in : null,
          token_type: tokenData.token_type,
          scope: tokenData.scope,
          id_token: tokenData.id_token,
        });
        console.log("Account linked successfully");
      } else {
        // Create new user
        console.log("Creating new user...");
        userId = crypto.randomUUID();
        user = await userDb.create(db, {
          id: userId,
          email: googleUser.email,
          name: googleUser.name,
          avatar: googleUser.picture,
          role: "GUEST",
        });
        console.log("New user created:", user.email, user.id);

        // Create account record
        await accountDb.create(db, {
          userId: userId,
          type: "oauth",
          provider: "google",
          providerAccountId: googleUser.id,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: tokenData.expires_in ?
            Math.floor(Date.now() / 1000) + tokenData.expires_in : null,
          token_type: tokenData.token_type,
          scope: tokenData.scope,
          id_token: tokenData.id_token,
        });
        console.log("Account created successfully");
      }
    }

    // Step 4: Generate JWT token (using jose for Cloudflare Workers compatibility)
    console.log("Step 4: Generating JWT token for user:", user.id, user.email);
    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    console.log("JWT token generated successfully");

    // Step 5: Set auth cookie and redirect directly to dashboard
    console.log("Step 5: Setting auth cookie and redirecting to dashboard...");
    const response = NextResponse.redirect(`${baseUrl}/dashboard`, 303);

    // Clear the oauth state cookie
    response.cookies.delete("oauth_state");

    // Set the main auth cookie for middleware (same as login/register)
    response.cookies.set("stayneos_auth_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/"
    });

    return response;

  } catch (err) {
    console.error("Google OAuth callback error:", err);
    const errorMessage = err instanceof Error ? err.message : "unknown_error";
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL || "https://stayneos.com"}/login?error=callback_failed&error_detail=${encodeURIComponent(errorMessage)}`
    );
  }
}