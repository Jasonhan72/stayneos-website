export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth/jwt";
import { userDb, getDb } from "@/lib/d1";
import { detectDevice, getIpFromRequest } from "@/lib/account-settings";
import { hashSessionToken } from "@/lib/auth/account";
import { AUTH_COOKIE_NAME, getAuthCookieOptions } from "@/lib/auth/cookie";
import { getPublicBaseUrl } from '@/lib/config/env';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { validateCsrf } from '@/lib/security/csrf';
import { sanitizeEmail } from '@/lib/security/sanitize';
import { apiError } from '@/lib/api/response';
import { getDevUserByEmail } from '@/lib/auth/dev-user-store';

export async function POST(request: Request) {
  try {
    const rate = checkRateLimit(request, 'auth:login', { limit: 15, windowMs: 60_000 });
    if (!rate.allowed) return apiError('Too many login attempts', 429, 'RATE_LIMITED');

    if (!validateCsrf(request)) return apiError('Invalid CSRF token', 403, 'CSRF_INVALID');

    let db;
    let useDevStore = false;
    try {
      db = getDb();
    } catch {
      useDevStore = process.env.NODE_ENV !== 'production';
      if (!useDevStore) throw new Error('DB unavailable');
    }

    const contentType = request.headers.get("content-type") || "";
    let email: string, password: string;

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      email = sanitizeEmail((formData.get("email") as string)?.trim() || "");
      password = (formData.get("password") as string) || "";
    } else {
      const body = await request.json();
      email = sanitizeEmail(body.email || '');
      password = body.password;
    }

    if (!email || !password) {
      return NextResponse.json({ message: "请填写邮箱和密码" }, { status: 400 });
    }

    const user = useDevStore ? getDevUserByEmail(email) : await userDb.findByEmail(db!, email);
    if (!user) {
      return NextResponse.json({ message: "邮箱或密码错误" }, { status: 401 });
    }

    if (!user.password) {
      return NextResponse.json({ message: "该账号未设置密码，请使用其他方式登录" }, { status: 401 });
    }

    const deletionStatus = (user as typeof user & { deletionStatus?: string | null }).deletionStatus ?? 'active';
    const deletionRequestedAt = (user as typeof user & { deletionRequestedAt?: string | null }).deletionRequestedAt ?? null;
    const deletionScheduledAt = (user as typeof user & { deletionScheduledAt?: string | null }).deletionScheduledAt ?? null;

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ message: "邮箱或密码错误" }, { status: 401 });
    }

    const token = await signToken({ userId: user.id, email: user.email, role: user.role });

    if (!useDevStore) {
      const now = new Date().toISOString();
      await db!.prepare(`
        INSERT INTO user_sessions (id, user_id, token_hash, device, ip, user_agent, location, last_active_at, created_at, revoked_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)
      `).bind(
        crypto.randomUUID(),
        user.id,
        hashSessionToken(token),
        detectDevice(request.headers.get('user-agent')),
        getIpFromRequest(request.headers),
        request.headers.get('user-agent'),
        request.headers.get('cf-ipcountry') || null,
        now,
        now,
      ).run();
    }

    const isFormSubmit = contentType.includes("application/x-www-form-urlencoded");
    if (isFormSubmit) {
      const baseUrl = getPublicBaseUrl();
      const response = NextResponse.redirect(`${baseUrl}/`, 303);
      response.cookies.set(AUTH_COOKIE_NAME, token, getAuthCookieOptions(request));
      return response;
    }

    const response = NextResponse.json(
      {
        message: deletionStatus === 'pending_deletion' ? '账号处于删除冷静期，已为你恢复登录。' : '登录成功',
        pendingDeletionNotice: deletionStatus === 'pending_deletion'
          ? {
              status: deletionStatus,
              deletionRequestedAt,
              deletionScheduledAt,
              recoverable: true,
            }
          : null,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          deletionStatus,
          deletionRequestedAt,
          deletionScheduledAt,
        },
      },
      { status: 200 }
    );

    response.cookies.set(AUTH_COOKIE_NAME, token, getAuthCookieOptions(request));
    return response;
  } catch {
    if (process.env.NODE_ENV !== 'production') console.error("登录错误");
    return apiError('登录失败，请稍后重试', 500, 'LOGIN_FAILED');
  }
}
