// Cloudflare Pages Function - Register API with D1
// 路径: /functions/api/auth/register.js

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // 验证必填字段
    if (!name || !email || !password) {
      return new Response(
        JSON.stringify({ message: "请填写所有必填字段" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ message: "请输入有效的邮箱地址" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 验证密码强度
    if (password.length < 6) {
      return new Response(
        JSON.stringify({ message: "密码至少需要6位字符" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 检查邮箱是否已存在
    const existingUser = await env.DB.prepare(
      "SELECT id FROM users WHERE email = ?"
    ).bind(email).first();

    if (existingUser) {
      return new Response(
        JSON.stringify({ message: "该邮箱已被注册" }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }

    // 生成用户ID和哈希密码
    const userId = crypto.randomUUID();
    const hashedPassword = await hashPassword(password);

    // 插入用户数据
    await env.DB.prepare(
      `INSERT INTO users (id, name, email, password, role, created_at) 
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(userId, name, email, hashedPassword, "GUEST", new Date().toISOString()).run();

    return new Response(
      JSON.stringify({
        message: "注册成功",
        user: {
          id: userId,
          name,
          email,
          role: "GUEST",
          createdAt: new Date().toISOString(),
        },
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("注册错误:", error);
    return new Response(
      JSON.stringify({ message: "注册失败: " + error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// 简单密码哈希
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "stayneos-salt-2026");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}
