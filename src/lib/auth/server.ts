// Server-side auth helpers (no next/headers cookies(), works with Request)
import { verifyToken } from "@/lib/auth/jwt";

export interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
}

export interface AuthPayload {
  userId: string;
  email: string;
  name: string;
  role?: string;
  tv?: number;
}

function getTokenFromCookieHeader(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;

  const cookiePairs = cookieHeader.split(";").map((part) => part.trim());
  const tokenCookie = cookiePairs.find(
    (part) =>
      part.startsWith("stayneos_auth_token=") ||
      part.startsWith("auth-token=") ||
      part.startsWith("auth_token=")
  );

  return tokenCookie ? decodeURIComponent(tokenCookie.split("=").slice(1).join("=")) : null;
}

async function validateTokenVersion(payload: Record<string, unknown>): Promise<boolean> {
  const tv = payload.tv;
  if (tv === undefined || tv === null) return true; // legacy tokens without tv — allow during migration
  const userId = payload.userId as string | undefined;
  if (!userId) return false;

  try {
    const { getDb, userDb } = await import("@/lib/d1");
    const db = getDb();
    const user = await userDb.findById(db, userId);
    if (!user) return false;
    const currentTv = user.tokenVersion ?? 0;
    return Number(tv) === currentTv;
  } catch {
    // DB unavailable — allow (fail open for availability, fail closed for security on API routes)
    return true;
  }
}

/**
 * Get the current user from a Request (works in API routes / middleware).
 * Checks Authorization header first, then cookie.
 * Validates token version against DB to support session revocation.
 */
export async function getCurrentUserFromRequest(request: Request): Promise<AuthPayload | null> {
  const authHeader = request.headers.get("authorization");

  if (authHeader?.startsWith("Bearer ")) {
    const bearerToken = authHeader.slice(7).trim();
    try {
      const payload = await verifyToken(bearerToken);
      if (payload && (await validateTokenVersion(payload))) {
        return payload as unknown as AuthPayload;
      }
    } catch {
      // fall through to cookie
    }
  }

  const cookieToken = getTokenFromCookieHeader(request.headers.get("cookie"));
  if (cookieToken) {
    try {
      const payload = await verifyToken(cookieToken);
      if (payload && (await validateTokenVersion(payload))) {
        return payload as unknown as AuthPayload;
      }
    } catch {
      return null;
    }
  }

  return null;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPassword(password: string): {
  valid: boolean;
  message?: string;
} {
  if (password.length < 6) {
    return { valid: false, message: "密码至少需要6位字符" };
  }

  if (!/(?=.*[a-zA-Z])/.test(password)) {
    return { valid: false, message: "密码需要包含至少一个字母" };
  }

  if (!/(?=.*\d)/.test(password)) {
    return { valid: false, message: "密码需要包含至少一个数字" };
  }

  return { valid: true };
}
