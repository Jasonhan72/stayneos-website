export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { userDb, getDb } from "@/lib/d1";
import { AUTH_COOKIE_NAME, getClearedAuthCookieOptions } from "@/lib/auth/cookie";
import { hashSessionToken } from "@/lib/account-auth";

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    
    // Single auth mechanism: HttpOnly cookie only
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { message: "未登录", user: null },
        { status: 200 }
      );
    }

    // 验证 token (using jose for Cloudflare Workers compatibility)
    const decoded = await verifyToken(token) as {
      userId: string;
    } | null;
    
    if (!decoded) {
      return NextResponse.json(
        { message: "Token 无效或已过期", user: null },
        { status: 401 }
      );
    }

    const session = await db
      .prepare(`SELECT id, revoked_at FROM user_sessions WHERE token_hash = ? LIMIT 1`)
      .bind(hashSessionToken(token))
      .first<{ id: string; revoked_at: string | null }>();

    if (session?.revoked_at) {
      const response = NextResponse.json(
        { message: "Session revoked", user: null },
        { status: 401 }
      );
      response.cookies.set(AUTH_COOKIE_NAME, '', getClearedAuthCookieOptions(request));
      return response;
    }

    if (session?.id) {
      await db.prepare(`UPDATE user_sessions SET last_active_at = ? WHERE id = ?`).bind(new Date().toISOString(), session.id).run();
    }

    // 查找用户
    const user = await userDb.findById(db, decoded.userId);

    if (!user) {
      return NextResponse.json(
        { message: "用户不存在", user: null },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: (user as typeof user & { phone?: string | null }).phone ?? null,
        address: (user as typeof user & { address?: string | null }).address ?? null,
        deletionRequestedAt: (user as typeof user & { deletionRequestedAt?: string | null }).deletionRequestedAt ?? null,
        deletionScheduledAt: (user as typeof user & { deletionScheduledAt?: string | null }).deletionScheduledAt ?? null,
        deletionStatus: (user as typeof user & { deletionStatus?: string | null }).deletionStatus ?? 'active',
      }
    }, { status: 200 });
  } catch {
    if (process.env.NODE_ENV !== 'production') console.error("验证会话错误");
    return NextResponse.json(
      { message: "会话已过期", user: null },
      { status: 401 }
    );
  }
}
