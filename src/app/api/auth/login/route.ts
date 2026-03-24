export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth/jwt";
import { userDb, getDb } from "@/lib/d1";
import { AUTH_COOKIE_NAME, getAuthCookieOptions } from "@/lib/auth/cookie";
import { getPublicBaseUrl } from '@/lib/config/env';

export async function POST(request: Request) {
  try {
    const db = getDb();

    const contentType = request.headers.get("content-type") || "";
    let email: string, password: string;

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      email = (formData.get("email") as string)?.trim() || "";
      password = (formData.get("password") as string) || "";
    } else {
      const body = await request.json();
      email = body.email;
      password = body.password;
    }

    if (!email || !password) {
      return NextResponse.json({ message: "请填写邮箱和密码" }, { status: 400 });
    }

    const user = await userDb.findByEmail(db, email);
    if (!user) {
      return NextResponse.json({ message: "邮箱或密码错误" }, { status: 401 });
    }

    if (!user.password) {
      return NextResponse.json({ message: "该账号未设置密码，请使用其他方式登录" }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ message: "邮箱或密码错误" }, { status: 401 });
    }

    const token = await signToken({ userId: user.id, email: user.email, role: user.role });

    const isFormSubmit = contentType.includes("application/x-www-form-urlencoded");
    if (isFormSubmit) {
      const baseUrl = getPublicBaseUrl();
      const response = NextResponse.redirect(`${baseUrl}/dashboard`, 303);
      response.cookies.set(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
      return response;
    }

    const response = NextResponse.json(
      {
        message: "登录成功",
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      },
      { status: 200 }
    );

    response.cookies.set(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
    return response;
  } catch {
    if (process.env.NODE_ENV !== 'production') console.error("登录错误");
    return NextResponse.json({ message: "登录失败，请稍后重试" }, { status: 500 });
  }
}
