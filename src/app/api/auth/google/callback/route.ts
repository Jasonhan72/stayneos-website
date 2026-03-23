import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { signToken } from "@/lib/auth/jwt";
import { userDb, accountDb, getDb } from "@/lib/d1";

export const dynamic = "force-dynamic";
const DEFAULT_REDIRECT = "/dashboard";

function sanitizeRedirect(redirect: string | undefined) {
  if (!redirect || !redirect.startsWith("/") || redirect.startsWith("//")) {
    return DEFAULT_REDIRECT;
  }
  return redirect;
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

async function hmacSign(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyOAuthState(cookie: string | undefined, nonce: string, secret: string): Promise<boolean> {
  if (!cookie) return false;
  const parts = cookie.split(':');
  if (parts.length !== 3) return false;
  
  const [storedNonce, expiresStr, signature] = parts;
  const expires = parseInt(expiresStr);
  
  // Check expiry
  if (Date.now() > expires) return false;
  
  // Check nonce matches
  if (storedNonce !== nonce) return false;
  
  // Verify HMAC
  const expectedSig = await hmacSign(`${storedNonce}:${expiresStr}`, secret);
  return signature === expectedSig;
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
  const baseUrl = process.env.NEXTAUTH_URL || "https://stayneos.com";
  const jwtSecret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || "fallback-secret";
  
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      return buildLoginRedirect(baseUrl, "oauth_error");
    }

    if (!code || !state) {
      return buildLoginRedirect(baseUrl, "missing_params");
    }

    // Parse state
    let parsedState: { nonce: string; redirect?: string };
    try {
      parsedState = JSON.parse(state);
    } catch {
      return buildLoginRedirect(baseUrl, "invalid_state");
    }

    if (!parsedState?.nonce) {
      return buildLoginRedirect(baseUrl, "invalid_state");
    }

    // Verify state via HMAC cookie
    const oauthCookie = request.cookies.get("oauth_state")?.value;
    const isValid = await verifyOAuthState(oauthCookie, parsedState.nonce, jwtSecret);
    
    if (!isValid) {
      return buildLoginRedirect(baseUrl, "invalid_state", parsedState.redirect);
    }

    // Get credentials
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return buildLoginRedirect(baseUrl, "config_error", parsedState.redirect);
    }

    // Exchange code for token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: `${baseUrl}/api/auth/google/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      return buildLoginRedirect(baseUrl, "token_exchange_failed", parsedState.redirect);
    }

    const tokenData: GoogleTokenResponse = await tokenResponse.json();

    // Get user info
    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userInfoResponse.ok) {
      return buildLoginRedirect(baseUrl, "user_info_failed", parsedState.redirect);
    }

    const googleUser: GoogleUserInfo = await userInfoResponse.json();

    if (!googleUser.verified_email) {
      return buildLoginRedirect(baseUrl, "email_not_verified", parsedState.redirect);
    }

    // Handle user in database
    const db = getDb();
    
    // Log for debugging
    console.log("Google OAuth callback - User info:", {
      email: googleUser.email,
      googleId: googleUser.id,
      name: googleUser.name
    });
    
    let existingAccount;
    try {
      existingAccount = await accountDb.findByProviderAccountId(db, "google", googleUser.id);
      console.log("Existing account check result:", existingAccount ? "found" : "not found");
    } catch (err) {
      console.error("Error checking existing account:", err);
      return buildLoginRedirect(baseUrl, "db_error", parsedState.redirect);
    }

    let user;
    let userId;

    if (existingAccount) {
      try {
        user = await userDb.findById(db, existingAccount.userId);
        console.log("Found existing user:", user?.email);
      } catch (err) {
        console.error("Error finding user by ID:", err);
        return buildLoginRedirect(baseUrl, "db_error", parsedState.redirect);
      }
      
      if (!user) {
        console.error("User not found for existing Google account:", existingAccount.userId);
        return buildLoginRedirect(baseUrl, "user_not_found", parsedState.redirect);
      }
      userId = user.id;
    } else {
      console.log("No existing account, checking by email:", googleUser.email);
      let existingUser;
      try {
        existingUser = await userDb.findByEmail(db, googleUser.email);
        console.log("Existing user by email:", existingUser ? "found" : "not found");
      } catch (err) {
        console.error("Error finding user by email:", err);
        return buildLoginRedirect(baseUrl, "db_error", parsedState.redirect);
      }

      if (existingUser) {
        console.log("Linking Google account to existing user:", existingUser.email);
        userId = existingUser.id;
        user = existingUser;
        try {
          await accountDb.create(db, {
            userId: existingUser.id,
            type: "oauth",
            provider: "google",
            providerAccountId: googleUser.id,
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            expires_at: tokenData.expires_in ? Math.floor(Date.now() / 1000) + tokenData.expires_in : null,
            token_type: tokenData.token_type,
            scope: tokenData.scope,
            id_token: tokenData.id_token,
          });
          console.log("Account linked successfully");
        } catch (err) {
          console.error("Error linking account:", err);
          return buildLoginRedirect(baseUrl, "db_error", parsedState.redirect);
        }
      } else {
        console.log("Creating new user for:", googleUser.email);
        userId = crypto.randomUUID();
        try {
          user = await userDb.create(db, {
            id: userId,
            email: googleUser.email,
            name: googleUser.name,
            avatar: googleUser.picture,
            role: "GUEST",
          });
          console.log("New user created:", user.email, user.id);
        } catch (err) {
          console.error("Error creating user:", err);
          return buildLoginRedirect(baseUrl, "db_error", parsedState.redirect);
        }
        
        try {
          await accountDb.create(db, {
            userId: userId,
            type: "oauth",
            provider: "google",
            providerAccountId: googleUser.id,
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            expires_at: tokenData.expires_in ? Math.floor(Date.now() / 1000) + tokenData.expires_in : null,
            token_type: tokenData.token_type,
            scope: tokenData.scope,
            id_token: tokenData.id_token,
          });
          console.log("Account created successfully");
        } catch (err) {
          console.error("Error creating account:", err);
          // Try to delete the user we just created
          try {
            await db.prepare("DELETE FROM User WHERE id = ?").bind(userId).run();
          } catch {}
          return buildLoginRedirect(baseUrl, "db_error", parsedState.redirect);
        }
      }
    }

    // Generate JWT
    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Set cookie and redirect to dashboard
    // UserContext will read cookie and sync to localStorage
    const response = NextResponse.redirect(`${baseUrl}${sanitizeRedirect(parsedState.redirect)}`, 303);
    response.cookies.delete("oauth_state");
    response.cookies.set("stayneos_auth_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    // 返回具体错误信息以便调试
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("Error details:", errorMsg);
    
    // 如果是数据库错误，返回db_error
    if (errorMsg.includes("D1") || errorMsg.includes("database") || errorMsg.includes("SQL")) {
      return buildLoginRedirect(baseUrl, "db_error");
    }
    // 如果是JWT错误
    if (errorMsg.includes("JWT") || errorMsg.includes("token") || errorMsg.includes("sign")) {
      return buildLoginRedirect(baseUrl, "jwt_error");
    }
    
    return buildLoginRedirect(baseUrl, "callback_failed");
  }
}
