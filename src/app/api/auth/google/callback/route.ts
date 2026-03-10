import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
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
      console.error("Google OAuth error:", error);
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL || "https://stayneos.com"}/login?error=oauth_error`
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
      return NextResponse.redirect(`${baseUrl}/login?error=token_exchange_failed`);
    }
    
    const tokenData: GoogleTokenResponse = await tokenResponse.json();
    
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
      console.error("Failed to fetch Google user info");
      return NextResponse.redirect(`${baseUrl}/login?error=user_info_failed`);
    }
    
    const googleUser: GoogleUserInfo = await userInfoResponse.json();
    
    if (!googleUser.verified_email) {
      return NextResponse.redirect(`${baseUrl}/login?error=email_not_verified`);
    }
    
    // Step 3: Handle user in database (reuse db from state check)
    
    // Check if account already exists
    const existingAccount = await accountDb.findByProviderAccountId(
      db,
      "google",
      googleUser.id
    );
    
    let user;
    let userId;
    
    if (existingAccount) {
      // User already has Google account linked
      user = await userDb.findById(db, existingAccount.userId);
      if (!user) {
        console.error("User not found for existing Google account");
        return NextResponse.redirect(`${baseUrl}/login?error=user_not_found`);
      }
      userId = user.id;
    } else {
      // Check if user exists by email
      const existingUser = await userDb.findByEmail(db, googleUser.email);
      
      if (existingUser) {
        // Link Google account to existing user
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
      } else {
        // Create new user
        userId = crypto.randomUUID();
        user = await userDb.create(db, {
          id: userId,
          email: googleUser.email,
          name: googleUser.name,
          avatar: googleUser.picture,
          role: "GUEST",
        });
        
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
      }
    }
    
    // Step 4: Generate JWT token (same as login route)
    const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET or NEXTAUTH_SECRET environment variable is required');
    }
    
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    
    // Step 5: Set auth cookie and redirect directly to dashboard
    const response = NextResponse.redirect(`${baseUrl}/dashboard`);
    
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
    
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL || "https://stayneos.com"}/login?error=callback_failed`
    );
  }
}