export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userDb, getDb } from "@/lib/d1";

export async function POST(request: Request) {
  try {
    const db = getDb();
    
    // Support both JSON and form-urlencoded submissions
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

    // 验证必填字段
    if (!email || !password) {
      return NextResponse.json(
        { message: "请填写邮箱和密码" },
        { status: 400 }
      );
    }

    // 查找用户
    const user = await userDb.findByEmail(db, email);

    if (!user) {
      return NextResponse.json(
        { message: "邮箱或密码错误" },
        { status: 401 }
      );
    }

    // 验证密码
    if (!user.password) {
      return NextResponse.json(
        { message: "该账号未设置密码，请使用其他方式登录" },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "邮箱或密码错误" },
        { status: 401 }
      );
    }

    // 生成 JWT token
    const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
    if (!JWT_SECRET) throw new Error('JWT_SECRET or NEXTAUTH_SECRET environment variable is required');
    
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const isFormSubmit = contentType.includes("application/x-www-form-urlencoded");
    
    if (isFormSubmit) {
      // Native form submission → redirect to dashboard with cookie
      const baseUrl = process.env.NEXTAUTH_URL || "https://stayneos.com";
      const response = NextResponse.redirect(`${baseUrl}/dashboard`, 303);
      response.cookies.set('stayneos_auth_token', token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
      });
      return response;
    }
    
    const response = NextResponse.json(
      {
        message: "登录成功",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
      { status: 200 }
    );

    // Set auth cookie for middleware
    response.cookies.set('stayneos_auth_token', token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch {
    console.error("登录错误");
    return NextResponse.json(
      { message: "登录失败，请稍后重试" },
      { status: 500 }
    );
  }
}
