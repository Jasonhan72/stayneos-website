export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { userDb, getDb } from "@/lib/d1";

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

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
      // Generate reset token — store only the hash
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenHash = hashToken(resetToken);
      const resetExpiry = new Date(Date.now() + 3600000).toISOString(); // 1 hour

      await db
        .prepare("UPDATE User SET resetToken = ?, resetTokenExpiry = ? WHERE id = ?")
        .bind(resetTokenHash, resetExpiry, user.id)
        .run();

      // TODO: Send email via Resend with resetToken (plain) in the link
      // DO NOT log the token or URL
    }

    return NextResponse.json({
      message: "如果该邮箱已注册，您将收到密码重置邮件",
      success: true,
    });
  } catch {
    console.error("Forgot password error");
    return NextResponse.json({ message: "操作失败，请稍后重试" }, { status: 500 });
  }
}
