// Email Test API - 用于测试邮件系统
// 路径: /functions/api/test/email.js

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const { to } = await request.json();
    
    if (!to) {
      return new Response(
        JSON.stringify({ error: "请提供收件人邮箱地址" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 检查 RESEND_API_KEY 是否配置
    if (!env.RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ 
          error: "RESEND_API_KEY 未配置",
          message: "请在 Cloudflare Dashboard 中设置 RESEND_API_KEY 密钥"
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // 发送测试邮件
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'StayNeos <hello@stayneos.com>',
        to,
        subject: 'StayNeos 邮件系统测试',
        html: `
          <h2>StayNeos 邮件系统测试</h2>
          <p>这是一封测试邮件，用于验证邮件系统是否正常工作。</p>
          <p>如果您收到这封邮件，说明邮件系统已正确配置！</p>
          <p>测试时间: ${new Date().toLocaleString('zh-CN')}</p>
          <hr>
          <p>StayNeos 团队</p>
        `,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "测试邮件已发送",
          emailId: result.id 
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } else {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "发送失败",
          details: errorText,
          status: response.status 
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// 检查邮件配置状态
export async function onRequestGet(context) {
  const { env } = context;
  
  const config = {
    resendApiKeyConfigured: !!env.RESEND_API_KEY,
    resendFromEmail: env.RESEND_FROM_EMAIL || 'hello@stayneos.com',
    timestamp: new Date().toISOString(),
  };
  
  return new Response(
    JSON.stringify(config),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
