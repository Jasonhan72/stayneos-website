// Cloudflare Pages Function - Properties API (compat-safe)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

function normalizeProperty(row) {
  return {
    id: row.id,
    title: row.title || row.name || "",
    slug: row.slug || row.id,
    address: row.address || "",
    city: row.city || "Toronto",
    neighborhood: row.neighborhood || "",
    bedrooms: row.bedrooms ?? 0,
    bathrooms: row.bathrooms ?? 0,
    priceMonthly: row.priceMonthly ?? row.price_monthly ?? row.base_price ?? 0,
    currency: row.currency || "CAD",
    description: row.description || "",
    images: row.images || null,
    status: row.status || "PUBLISHED",
    createdAt: row.createdAt || row.created_at || null,
    updatedAt: row.updatedAt || row.updated_at || null,
  };
}

async function queryProperties(env) {
  const attempts = [
    "SELECT * FROM Property WHERE status = 'PUBLISHED' ORDER BY createdAt DESC",
    "SELECT * FROM Property WHERE status = 'PUBLISHED' ORDER BY created_at DESC",
    "SELECT * FROM properties WHERE status = 'active' ORDER BY created_at DESC",
    "SELECT * FROM properties ORDER BY created_at DESC",
  ];

  for (const sql of attempts) {
    try {
      const result = await env.DB.prepare(sql).all();
      return result.results || [];
    } catch {
      // try next schema variant
    }
  }

  return [];
}

export async function onRequestGet(context) {
  const { env } = context;

  try {
    const rows = await queryProperties(env);
    const properties = rows.map(normalizeProperty);

    return new Response(JSON.stringify({ properties }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Properties API error:", error);
    return new Response(JSON.stringify({ message: "Failed to fetch properties" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
}
