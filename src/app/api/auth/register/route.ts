export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userDb, getDb } from "@/lib/d1";

export async function POST(request: Request) {
  try {
    
    let db;
    try {
      db = getDb();
    } catch (dbError) {
      console.error("Failed to get D1 database:", dbError);
      return NextResponse.json(
        { message: "数据库连接失败" },
        { status: 500 }
      );
    }
    
    // Support both JSON and form-urlencoded submissions
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

    // 验证必填字段
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Please fill in all required fields" },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "请输入有效的邮箱地址" },
        { status: 400 }
      );
    }

    // 验证密码强度
    if (password.length < 6) {
      return NextResponse.json(
        { message: "密码至少需要6位字符" },
        { status: 400 }
      );
    }

    // 检查邮箱是否已存在
    const existingUser = await userDb.findByEmail(db, email);

    if (existingUser) {
      return NextResponse.json(
        { message: "该邮箱已被注册" },
        { status: 409 }
      );
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await userDb.create(db, {
      id: crypto.randomUUID(),
      name,
      email,
      password: hashedPassword,
      role: "GUEST",
    });


    // Generate JWT token
    const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
    if (!JWT_SECRET) throw new Error('JWT_SECRET or NEXTAUTH_SECRET environment variable is required');

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const isFormSubmit = contentType.includes("application/x-www-form-urlencoded");
    
    if (isFormSubmit) {
      // Native form submission → redirect to dashboard with cookie
      const baseUrl = process.env.NEXTAUTH_URL || "https://stayneos.com";
      const response = NextResponse.redirect(`${baseUrl}/dashboard`);
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
        message: "注册成功",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
        token,
      },
      { status: 201 }
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
  } catch (error) {
    console.error("注册错误:", error);
    
    return NextResponse.json(
      { message: "注册失败，请稍后重试" },
      { status: 500 }
    );
  }
}
