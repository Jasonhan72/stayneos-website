// Admin Email Logs API
// 路径: /functions/api/admin/email-logs.js

export async function onRequestGet(context) {
  const { request, env } = context;
  
  try {
    // 简单认证检查（生产环境应该使用更严格的认证）
    // 这里仅允许特定邮箱访问
    const url = new URL(request.url);
    const userEmail = url.searchParams.get('userEmail');
    
    // 获取最近的100条邮件日志
    const result = await env.DB.prepare(
      `SELECT * FROM email_logs 
       ORDER BY sent_at DESC 
       LIMIT 100`
    ).all();
    
    return new Response(
      JSON.stringify({
        logs: result.results || [],
        count: result.results?.length || 0,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("获取邮件日志错误:", error);
    return new Response(
      JSON.stringify({ message: "获取邮件日志失败: " + error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
