import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { signToken } from "@/lib/auth/jwt";
import { userDb, accountDb, getDb } from "@/lib/d1";

export const dynamic = "force-dynamic";
const DEFAULT_REDIRECT = "/dashboard";

interface OAuthStatePayload {
  nonce: string;
  redirect?: string;
}

function sanitizeRedirect(redirect: string | undefined) {
  if (!redirect || !redirect.startsWith("/") || redirect.startsWith("//")) {
    return DEFAULT_REDIRECT;
  }
  return redirect;
}

function parseOAuthState(state: string | null) {
  if (!state) return null;
  try {
    const parsed = JSON.parse(state) as OAuthStatePayload;
    return parsed?.nonce ? parsed : null;
  } catch {
    return null;
  }
}

function buildLoginRedirect(baseUrl: string, errorCode: string, redirect?: string) {
  const loginUrl = new URL("/login", baseUrl);
  loginUrl.searchParams.set("error", errorCode);
  const safeRedirect = sanitizeRedirect(redirect);
  if (safeRedirect !== DEFAULT_REDIRECT) {
    loginUrl.searchParams.set("redirect", safeRedirect);
  }
  return NextResponse.redirect(loginUrl.toString());
}

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
    const baseUrl = process.env.NEXTAUTH_URL || "https://stayneos.com";
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const parsedState = parseOAuthState(state);

    // Check for OAuth error
    if (error) {
      console.error("Google OAuth error from provider:", error);
      return buildLoginRedirect(baseUrl, "oauth_error", parsedState?.redirect);
    }

    // Verify required parameters
    if (!code || !state) {
      return buildLoginRedirect(baseUrl, "missing_params", parsedState?.redirect);
    }

    if (!parsedState?.nonce) {
      return buildLoginRedirect(baseUrl, "invalid_state");
    }

    // Verify state parameter via D1 (cookies unreliable in Cloudflare cross-origin redirects)
    const db = getDb();
    const stateRow = await db
      .prepare("SELECT id FROM OAuthState WHERE state = ? AND expiresAt > ?")
      .bind(parsedState.nonce, new Date().toISOString())
      .first<{ id: string }>();

    if (!stateRow) {
      return buildLoginRedirect(baseUrl, "invalid_state", parsedState.redirect);
    }

    // Delete used state (single-use)
    await db.prepare("DELETE FROM OAuthState WHERE state = ?").bind(parsedState.nonce).run();

    // Get environment variables
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error("Missing Google OAuth credentials");
      return buildLoginRedirect(baseUrl, "config_error", parsedState.redirect);
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
      return buildLoginRedirect(baseUrl, "token_exchange_failed", parsedState.redirect);
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
      return buildLoginRedirect(baseUrl, "user_info_failed", parsedState.redirect);
    }

    const googleUser: GoogleUserInfo = await userInfoResponse.json();
    console.log("User info received:", googleUser.email, googleUser.name);

    if (!googleUser.verified_email) {
      return buildLoginRedirect(baseUrl, "email_not_verified", parsedState.redirect);
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
        return buildLoginRedirect(baseUrl, "user_not_found", parsedState.redirect);
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

    // Step 5: Set auth cookie and redirect to requested path
    console.log("Step 5: Setting auth cookie and redirecting...");
    const response = NextResponse.redirect(`${baseUrl}${sanitizeRedirect(parsedState.redirect)}`, 303);

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
    return buildLoginRedirect(
      process.env.NEXTAUTH_URL || "https://stayneos.com",
      "callback_failed"
    );
  }
}