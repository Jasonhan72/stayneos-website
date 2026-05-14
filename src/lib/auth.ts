// Barrel re-export — single entry point for all auth utilities.
// Prefer importing from @/lib/auth or @/lib/auth/<module> directly.

// JWT
export { signToken, verifyToken } from "@/lib/auth/jwt";

// Server-side request auth
export {
  getCurrentUserFromRequest,
  isValidEmail,
  isValidPassword,
} from "@/lib/auth/server";
export type { AuthPayload, User } from "@/lib/auth/server";

// Cookies (Next.js Route Handlers)
export {
  AUTH_COOKIE_NAME,
  getAuthCookieOptions,
  getClearedAuthCookieOptions,
} from "@/lib/auth/cookie";

// Account helpers
export {
  requireAccountUser,
  hashSessionToken,
  getTokenFromRequest,
} from "@/lib/auth/account";
export type { AuthenticatedAccountRequest } from "@/lib/auth/account";

// Admin
export { verifyAdmin, requireAdmin, getCurrentUser } from "@/lib/auth/admin";
export type { AdminPayload } from "@/lib/auth/admin";

// Admin API helpers
export {
  verifyRequestAuth,
  requireAdmin as requireAdminApi,
} from "@/lib/auth/admin-api";

// Dev user store
export { addDevUser, getDevUserByEmail } from "@/lib/auth/dev-user-store";
