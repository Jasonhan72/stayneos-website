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

/**
 * Get the current user from a Request (works in API routes / middleware).
 * Checks Authorization header first, then cookie.
 */
export async function getCurrentUserFromRequest(request: Request): Promise<AuthPayload | null> {
  const authHeader = request.headers.get("authorization");

  if (authHeader?.startsWith("Bearer ")) {
    const bearerToken = authHeader.slice(7).trim();
    try {
      const payload = await verifyToken(bearerToken);
      if (payload) {
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
      if (payload) {
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
