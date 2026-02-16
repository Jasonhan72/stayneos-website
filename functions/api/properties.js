// Cloudflare Pages Function - Properties API with CORS
// 路径: /functions/api/properties.js

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const propertyId = url.searchParams.get("id");

  try {
    // If specific property requested
    if (propertyId) {
      const property = await env.DB.prepare(
        `SELECT p.*, 
          (SELECT json_group_array(name) FROM property_amenities pa 
           JOIN amenities a ON pa.amenity_id = a.id 
           WHERE pa.property_id = p.id) as amenities
         FROM properties p WHERE p.id = ?`
      ).bind(propertyId).first();

      if (!property) {
        return new Response(
          JSON.stringify({ message: "Property not found" }),
          { 
            status: 404, 
            headers: { 
              "Content-Type": "application/json",
              ...corsHeaders
            } 
          }
        );
      }

      // Parse amenities from JSON string
      if (property.amenities) {
        try {
          property.amenities = JSON.parse(property.amenities);
        } catch {
          property.amenities = [];
        }
      }

      return new Response(
        JSON.stringify({ property }),
        { 
          status: 200, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          } 
        }
      );
    }

    // Get all properties
    const { results } = await env.DB.prepare(
      `SELECT p.*, 
        (SELECT json_group_array(name) FROM property_amenities pa 
         JOIN amenities a ON pa.amenity_id = a.id 
         WHERE pa.property_id = p.id) as amenities
       FROM properties p WHERE p.status = 'active'`
    ).all();

    // Parse amenities for each property
    const properties = results.map(p => {
      if (p.amenities) {
        try {
          p.amenities = JSON.parse(p.amenities);
        } catch {
          p.amenities = [];
        }
      }
      return p;
    });

    return new Response(
      JSON.stringify({ properties }),
      { 
        status: 200, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        } 
      }
    );
  } catch (error) {
    console.error("Properties API error:", error);
    return new Response(
      JSON.stringify({ message: "Failed to fetch properties" }),
      { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        } 
      }
    );
  }
}
