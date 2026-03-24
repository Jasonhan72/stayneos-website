export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth/jwt";
import { userDb, getDb } from "@/lib/d1";
import { AUTH_COOKIE_NAME, getAuthCookieOptions } from "@/lib/auth/cookie";
import { getPublicBaseUrl } from '@/lib/config/env';

export async function POST(request: Request) {
  try {
    let db;
    try {
      db = getDb();
    } catch {
      console.error("Failed to get D1 database");
      return NextResponse.json({ message: "数据库连接失败" }, { status: 500 });
    }

    const contentType = request.headers.get("content-type") || "";
    let name: string, email: string, password: string;

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      const firstName = (formData.get("firstName") as string)?.trim() || "";
      const lastName = (formData.get("lastName") as string)?.trim() || "";
      name = (formData.get("name") as string)?.trim() || [firstName, lastName].filter(Boolean).join(" ");
      email = (formData.get("email") as string)?.trim() || "";
      password = (formData.get("password") as string) || "";
    } else {
      const body = await request.json();
      name = body.name || [body.firstName, body.lastName].filter(Boolean).join(" ");
      email = body.email;
      password = body.password;
    }

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Please fill in all required fields" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: "请输入有效的邮箱地址" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ message: "密码至少需要6位字符" }, { status: 400 });
    }

    const existingUser = await userDb.findByEmail(db, email);
    if (existingUser) {
      return NextResponse.json({ message: "该邮箱已被注册" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userDb.create(db, {
      id: crypto.randomUUID(),
      name,
      email,
      password: hashedPassword,
      role: "GUEST",
    });

    const token = await signToken({ userId: user.id, email: user.email, name: user.name, role: user.role });

    const isFormSubmit = contentType.includes("application/x-www-form-urlencoded");
    if (isFormSubmit) {
      const baseUrl = getPublicBaseUrl();
      const response = NextResponse.redirect(`${baseUrl}/dashboard`, 303);
      response.cookies.set(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
      return response;
    }

    const response = NextResponse.json(
      {
        message: "注册成功",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      },
      { status: 201 }
    );

    response.cookies.set(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
    return response;
  } catch {
    console.error("注册错误");
    return NextResponse.json({ message: "注册失败，请稍后重试" }, { status: 500 });
  }
}
