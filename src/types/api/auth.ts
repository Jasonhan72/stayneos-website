/**
 * Auth API 共享类型
 */

import type { User } from '../user';

// NOTE: AuthResponse is defined in ../user.ts (shared with auth system).
// This file exports API-specific auth types only.

/** 登录请求体 */
export interface LoginRequestBody {
  email: string;
  password: string;
}

/** 注册请求体 */
export interface RegisterRequestBody {
  email: string;
  password: string;
  name?: string;
}

/** 会话检查 GET /api/auth/session 返回 */
export interface SessionResponse {
  user: User | null;
  authenticated: boolean;
}

/** POST /api/auth/logout 返回 */
export interface LogoutResponse {
  success: boolean;
}
