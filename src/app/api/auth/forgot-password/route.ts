export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { userDb, getDb } from "@/lib/d1";
import { sendEmail } from "@/lib/email";
import { getBaseUrl } from "@/lib/config/env";
import { checkRateLimit } from '@/lib/security/rate-limit';
import { validateCsrf } from '@/lib/security/csrf';

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function buildResetEmailHtml(resetUrl: string, name?: string | null): string {
  const greeting = name ? `Hi ${name},` : "Hi there,";
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;color:#111">
      <h2 style="margin:0 0 16px;font-weight:600">Reset your NEOS password</h2>
      <p style="line-height:1.6">${greeting}</p>
      <p style="line-height:1.6">We received a request to reset the password on your NEOS account. Click the button below to choose a new one. The link expires in 1 hour.</p>
      <p style="text-align:center;margin:28px 0">
        <a href="${resetUrl}" style="display:inline-block;background:#111;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:500">Reset password</a>
      </p>
      <p style="line-height:1.6;font-size:14px;color:#555">If the button doesn't work, copy and paste this link into your browser:<br><span style="word-break:break-all;color:#333">${resetUrl}</span></p>
      <p style="line-height:1.6;font-size:14px;color:#555">If you didn't request this, you can safely ignore this email — your password won't change.</p>
      <hr style="margin:32px 0;border:none;border-top:1px solid #eee">
      <p style="font-size:12px;color:#999;margin:0">NEOS · hello@stayneos.com · <a href="https://www.stayneos.com" style="color:#999">www.stayneos.com</a></p>
    </div>
  `;
}

export async function POST(request: Request) {
  // Rate limit: max 3 attempts per minute per IP (prevents enumeration / abuse)
  const rate = checkRateLimit(request, 'auth:forgot-password', { limit: 3, windowMs: 60_000 });
  if (!rate.allowed) return NextResponse.json({ message: '请求过于频繁，请稍后再试' }, { status: 429 });

  if (!validateCsrf(request)) return NextResponse.json({ message: 'Invalid CSRF token' }, { status: 403 });

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

    // Always return success to prevent email enumeration — the user-facing
    // response must not depend on whether the email actually exists.
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

      // Send the reset email. Failures are logged but never leak back to the
      // caller (that would break enumeration protection). The plain token
      // never hits our logs — only the URL-safe payload inside the email.
      const baseUrl = getBaseUrl();
      const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;
      try {
        await sendEmail({
          to: [user.email],
          subject: "Reset your NEOS password",
          html: buildResetEmailHtml(resetUrl, user.name),
        });
      } catch {
        // sendEmail already logs internally; swallow to avoid enumeration leak.
      }
    }

    return NextResponse.json({
      message: "如果该邮箱已注册，您将收到密码重置邮件",
      success: true,
    });
  } catch {
    if (process.env.NODE_ENV !== 'production') console.error("Forgot password error");
    return NextResponse.json({ message: "操作失败，请稍后重试" }, { status: 500 });
  }
}
