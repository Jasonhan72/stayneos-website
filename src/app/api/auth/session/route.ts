import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { userDb, getDb } from "@/lib/d1";

export async function GET(request: Request) {
  try {
    const db = getDb();
    
    // 从 header 获取 token
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "未登录", user: null },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // 验证 token
    const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
    if (!JWT_SECRET) throw new Error('JWT_SECRET or NEXTAUTH_SECRET environment variable is required');
    
    const decoded = jwt.verify(
      token,
      JWT_SECRET
    ) as {
      userId: string;
    };

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
  } catch (error) {
    console.error("验证会话错误:", error);
    return NextResponse.json(
      { message: "会话已过期", user: null },
      { status: 401 }
    );
  }
}
