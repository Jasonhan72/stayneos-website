// Get User Bookings List API
// 路径: /functions/api/bookings/list.js

export async function onRequestGet(context) {
  const { request, env } = context;
  
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const userEmail = url.searchParams.get('userEmail');
    const status = url.searchParams.get('status');
    
    let query = `SELECT * FROM bookings WHERE 1=1`;
    const bindings = [];
    
    // 如果提供了 userId，按用户ID筛选
    if (userId) {
      query += ` AND user_id = ?`;
      bindings.push(userId);
    }
    
    // 如果提供了 userEmail，按邮箱筛选（用于未登录用户或通过邮箱关联）
    if (userEmail) {
      query += ` AND guest_email = ?`;
      bindings.push(userEmail);
    }
    
    // 如果提供了 status，按状态筛选
    if (status) {
      query += ` AND status = ?`;
      bindings.push(status);
    }
    
    // 按创建时间倒序排列
    query += ` ORDER BY created_at DESC`;
    
    const result = await env.DB.prepare(query).bind(...bindings).all();
    
    return new Response(
      JSON.stringify({
        bookings: result.results || [],
        count: result.results?.length || 0,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("获取预订列表错误:", error);
    return new Response(
      JSON.stringify({ message: "获取预订列表失败: " + error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
