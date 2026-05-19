export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { userDb, getDb } from "@/lib/d1";

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromRequest(request);
    if (!currentUser?.email) {
      return NextResponse.json({ message: "Please log in first" }, { status: 401 });
    }

    const db = getDb();
    const user = await userDb.findByEmail(db, currentUser.email);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters" }, { status: 400 });
    }

    if (!/(?=.*[a-zA-Z])/.test(newPassword)) {
      return NextResponse.json({ message: "Password must contain at least one letter" }, { status: 400 });
    }

    if (!/(?=.*\d)/.test(newPassword)) {
      return NextResponse.json({ message: "Password must contain at least one number" }, { status: 400 });
    }

    // If user already has a password, require current password
    if (user.password) {
      if (!currentPassword) {
        return NextResponse.json({ message: "Current password is required" }, { status: 400 });
      }
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return NextResponse.json({ message: "Current password is incorrect" }, { status: 400 });
      }
    }

    // Hash and save new password — also invalidate all existing sessions
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db
      .prepare("UPDATE User SET password = ?, token_version = token_version + 1, updatedAt = ? WHERE id = ?")
      .bind(hashedPassword, new Date().toISOString(), user.id)
      .run();

    return NextResponse.json({
      message: user.password ? "Password updated successfully" : "Password set successfully",
      success: true,
      hadPassword: !!user.password,
    });
  } catch {
    if (process.env.NODE_ENV !== 'production') console.error("Set password error");
    return NextResponse.json({ message: "Failed to set password, please try again later" }, { status: 500 });
  }
}
