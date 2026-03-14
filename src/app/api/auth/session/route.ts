export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { userDb, getDb } from "@/lib/d1";

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    
    // Get token from cookie (NextRequest) OR Authorization header
    const cookieToken = request.cookies.get("stayneos_auth_token")?.value;
    const authHeader = request.headers.get("authorization");
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
    const token = cookieToken || bearerToken;

    if (!token) {
      return NextResponse.json(
        { message: "未登录", user: null },
        { status: 401 }
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
      }
    }, { status: 200 });
  } catch {
    console.error("验证会话错误");
    return NextResponse.json(
      { message: "会话已过期", user: null },
      { status: 401 }
    );
  }
}
