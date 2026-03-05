import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(request: Request) {
  try {
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
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is required');
    const decoded = jwt.verify(
      token,
      JWT_SECRET
    ) as {
      userId: string;
    };

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "用户不存在", user: null },
        { status: 404 }
      );
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("验证会话错误:", error);
    return NextResponse.json(
      { message: "会话已过期", user: null },
      { status: 401 }
    );
  }
}
