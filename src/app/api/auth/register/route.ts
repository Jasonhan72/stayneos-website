import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { userDb, getDb } from "@/lib/d1";

export async function POST(request: Request) {
  try {
    console.log("Register API called");
    
    let db;
    try {
      db = getDb();
      console.log("D1 database connection established");
    } catch (dbError) {
      console.error("Failed to get D1 database:", dbError);
      return NextResponse.json(
        { message: "数据库连接失败" },
        { status: 500 }
      );
    }
    
    const body = await request.json();
    console.log("Request body:", { name: body.name, email: body.email });
    
    const { name, email, password } = body;

    // 验证必填字段
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "请填写所有必填字段" },
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
    console.log("Checking if email exists:", email);
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
    console.log("Creating user...");
    const user = await userDb.create(db, {
      id: crypto.randomUUID(),
      name,
      email,
      password: hashedPassword,
      role: "GUEST",
    });

    console.log("User created successfully:", user.id);

    return NextResponse.json(
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
  } catch (error) {
    console.error("注册错误:", error);
    const errorMessage = error instanceof Error ? error.message : "未知错误";
    return NextResponse.json(
      { message: "注册失败，请稍后重试", error: errorMessage },
      { status: 500 }
    );
  }
}
