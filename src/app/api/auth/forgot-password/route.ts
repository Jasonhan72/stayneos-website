export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { userDb, getDb } from "@/lib/d1";

export async function POST(request: Request) {
  try {
    const db = getDb();
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ message: "请输入邮箱地址" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: "请输入有效的邮箱地址" }, { status: 400 });
    }

    // Always return success to prevent email enumeration
    const user = await userDb.findByEmail(db, email);

    if (user) {
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetExpiry = new Date(Date.now() + 3600000).toISOString(); // 1 hour

      // Store reset token in DB
      await db
        .prepare("UPDATE User SET resetToken = ?, resetTokenExpiry = ? WHERE id = ?")
        .bind(resetToken, resetExpiry, user.id)
        .run();

      // TODO: Send email via Resend when configured
      // For now, log the reset link
      const resetUrl = `${process.env.NEXTAUTH_URL || "https://stayneos.com"}/reset-password?token=${resetToken}`;
      console.log(`Password reset requested for ${email}: ${resetUrl}`);
    }

    return NextResponse.json({
      message: "如果该邮箱已注册，您将收到密码重置邮件",
      success: true,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ message: "操作失败，请稍后重试" }, { status: 500 });
  }
}
