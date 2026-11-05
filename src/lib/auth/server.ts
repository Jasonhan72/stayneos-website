// Server-side auth helpers (no next/headers cookies(), works with Request)
import { createHash } from "node:crypto";
import { isSessionActive } from "./edge-session";
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

  try { return tokenCookie ? decodeURIComponent(tokenCookie.split("=").slice(1).join("=")) : null; }
  catch { return null; }
}

async function validateTokenVersion(payload: Record<string, unknown>, token: string): Promise<boolean> {
  const userId = payload.userId;
  const tv = payload.tv ?? 0;
  if (typeof userId !== 'string' || !userId || !Number.isInteger(tv) || Number(tv) < 0 || typeof payload.exp !== 'number') return false;
  try {
    const { getDb } = await import("@/lib/d1");
    return await isSessionActive({ userId, tv: Number(tv), exp: payload.exp,
      tokenHash: createHash('sha256').update(token).digest('hex') }, getDb());
  } catch { return false; }
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
      if (payload && (await validateTokenVersion(payload, bearerToken))) {
        return payload as unknown as AuthPayload;
      }
    } catch {
      return null;
    }
    return null;
  }

  const cookieToken = getTokenFromCookieHeader(request.headers.get("cookie"));
  if (cookieToken) {
    try {
      const payload = await verifyToken(cookieToken);
      if (payload && (await validateTokenVersion(payload, cookieToken))) {
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
