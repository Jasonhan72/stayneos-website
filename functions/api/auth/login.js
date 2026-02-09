// Cloudflare Pages Function - Login API with D1
// 路径: /functions/api/auth/login.js

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const body = await request.json();
    const { email, password } = body;

    // 验证必填字段
    if (!email || !password) {
      return new Response(
        JSON.stringify({ message: "请填写邮箱和密码" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 查找用户
    const user = await env.DB.prepare(
      "SELECT id, name, email, password, role, created_at FROM users WHERE email = ?"
    ).bind(email).first();

    if (!user) {
      return new Response(
        JSON.stringify({ message: "邮箱或密码错误" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // 验证密码
    const hashedPassword = await hashPassword(password);
    if (hashedPassword !== user.password) {
      return new Response(
        JSON.stringify({ message: "邮箱或密码错误" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // 生成 JWT token
    const token = await generateJWT(
      { userId: user.id, email: user.email, role: user.role },
      env.JWT_SECRET || "stayneos-secret-key"
    );

    return new Response(
      JSON.stringify({
        message: "登录成功",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.created_at,
        },
        token,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("登录错误:", error);
    return new Response(
      JSON.stringify({ message: "登录失败，请稍后重试" }),
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

// 生成 JWT
async function generateJWT(payload, secret) {
  const header = { alg: "HS256", typ: "JWT" };
  const encoder = new TextEncoder();
  
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, "");
  const payloadB64 = btoa(JSON.stringify({
    ...payload,
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7天过期
    iat: Math.floor(Date.now() / 1000),
  })).replace(/=/g, "");
  
  const data = encoder.encode(`${headerB64}.${payloadB64}`);
  const signature = await crypto.subtle.sign(
    "HMAC",
    await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    ),
    data
  );
  
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/=/g, "");
  return `${headerB64}.${payloadB64}.${signatureB64}`;
}
