// Cloudflare Pages Function - Session API with D1
// 路径: /functions/api/auth/session.js

export async function onRequestGet(context) {
  const { request, env } = context;
  
  try {
    // 从 header 获取 token
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ message: "未登录", user: null }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.substring(7);

    // 验证 token
    const decoded = await verifyJWT(token, env.JWT_SECRET || "stayneos-secret-key");
    
    if (!decoded) {
      return new Response(
        JSON.stringify({ message: "会话已过期", user: null }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // 查找用户
    const user = await env.DB.prepare(
      "SELECT id, name, email, role, created_at FROM users WHERE id = ?"
    ).bind(decoded.userId).first();

    if (!user) {
      return new Response(
        JSON.stringify({ message: "用户不存在", user: null }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.created_at,
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("验证会话错误:", error);
    return new Response(
      JSON.stringify({ message: "会话已过期", user: null }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
}

// 验证 JWT
async function verifyJWT(token, secret) {
  try {
    const [headerB64, payloadB64, signatureB64] = token.split(".");
    
    if (!headerB64 || !payloadB64 || !signatureB64) {
      return null;
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(`${headerB64}.${payloadB64}`);
    
    const signature = Uint8Array.from(atob(signatureB64.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
    
    const isValid = await crypto.subtle.verify(
      "HMAC",
      await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["verify"]
      ),
      signature,
      data
    );

    if (!isValid) {
      return null;
    }

    const payload = JSON.parse(atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/")));
    
    // 检查是否过期
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch (error) {
    return null;
  }
}
