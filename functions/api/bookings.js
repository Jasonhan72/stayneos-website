// Unified Bookings API to avoid /api/bookings 500
// 路径: /functions/api/bookings.js

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function onRequestGet(context) {
  const { request, env } = context;
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const userId = url.searchParams.get("userId");

    let query = "SELECT * FROM bookings WHERE 1=1";
    const binds = [];

    if (userId) {
      query += " AND user_id = ?";
      binds.push(userId);
    }

    if (status && status !== "all") {
      query += " AND status = ?";
      binds.push(status);
    }

    query += " ORDER BY created_at DESC";

    const result = await env.DB.prepare(query).bind(...binds).all();
    return new Response(JSON.stringify({ bookings: result.results || [] }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("/api/bookings 错误:", error);
    return new Response(JSON.stringify({ message: "获取预订失败" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
}
