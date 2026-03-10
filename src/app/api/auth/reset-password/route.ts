export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/d1";

interface UserRow {
  id: string;
  resetTokenExpiry: string | null;
}

export async function POST(request: Request) {
  try {
    const db = getDb();
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json({ message: "缺少必要参数" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ message: "密码至少需要6位字符" }, { status: 400 });
    }

    // Find user by reset token
    const user = await db
      .prepare("SELECT id, resetTokenExpiry FROM User WHERE resetToken = ?")
      .bind(token)
      .first<UserRow>();

    if (!user) {
      return NextResponse.json({ message: "无效的重置链接" }, { status: 400 });
    }

    // Check expiry
    if (user.resetTokenExpiry && new Date(user.resetTokenExpiry) < new Date()) {
      return NextResponse.json({ message: "重置链接已过期，请重新申请" }, { status: 400 });
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(password, 10);
    await db
      .prepare("UPDATE User SET password = ?, resetToken = NULL, resetTokenExpiry = NULL, updatedAt = ? WHERE id = ?")
      .bind(hashedPassword, new Date().toISOString(), user.id)
      .run();

    return NextResponse.json({ message: "密码已重置，请使用新密码登录", success: true });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ message: "密码重置失败，请稍后重试" }, { status: 500 });
  }
}
