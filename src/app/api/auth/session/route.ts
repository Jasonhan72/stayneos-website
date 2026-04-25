export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { userDb, getDb } from "@/lib/d1";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookie";

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
