import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface TitleRequest {
  type?: string;
  location?: { city?: string; neighborhood?: string; address?: string };
  basics?: { bedrooms?: number; bathrooms?: number; sqft?: number };
  amenities?: string[];
}

function fallbackSuggestions(body: TitleRequest): string[] {
  const city = body.location?.city || "Toronto";
  const nb = body.location?.neighborhood ? ` in ${body.location.neighborhood}` : "";
  const type = body.type || "apartment";
  const beds = body.basics?.bedrooms;
  const bedsStr = beds && beds > 0 ? `${beds}-bed ` : "";
  return [
    `Bright ${bedsStr}${type}${nb}, ${city}`,
    `Modern ${type}${nb} — move-in ready`,
    `Stylish furnished ${bedsStr}${type} in ${city}${nb}`,
  ];
}

export async function POST(req: NextRequest) {
  let body: TitleRequest = {};
  try {
    body = (await req.json()) as TitleRequest;
  } catch {
    /* ignore */
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY || "";
  if (!anthropicKey) {
    return NextResponse.json({
      suggestions: fallbackSuggestions(body),
      warnings: ["ANTHROPIC_API_KEY not set — returned heuristic titles."],
    });
  }

  const prompt = `Generate 3 short, catchy rental listing titles (max 60 characters each) for the property below.
Return ONLY a JSON array of 3 strings, no markdown, no commentary.

Property:
- type: ${body.type || "apartment"}
- city: ${body.location?.city || ""}
- neighborhood: ${body.location?.neighborhood || ""}
- bedrooms: ${body.basics?.bedrooms ?? ""}
- bathrooms: ${body.basics?.bathrooms ?? ""}
- sqft: ${body.basics?.sqft ?? ""}
- amenities: ${(body.amenities || []).slice(0, 8).join(", ")}`;

  try {
    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 256,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!aiRes.ok) {
      return NextResponse.json({
        suggestions: fallbackSuggestions(body),
        warnings: [`AI failed (HTTP ${aiRes.status})`],
      });
    }
    const data = (await aiRes.json()) as { content?: Array<{ text?: string }> };
    const text = data.content?.[0]?.text || "";
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) {
      return NextResponse.json({
        suggestions: fallbackSuggestions(body),
        warnings: ["AI returned no JSON array."],
      });
    }
    const arr = JSON.parse(match[0]) as unknown;
    if (Array.isArray(arr)) {
      const suggestions = arr
        .map((x) => String(x).slice(0, 60))
        .filter((s) => s.length > 0)
        .slice(0, 3);
      if (suggestions.length === 0) {
        return NextResponse.json({ suggestions: fallbackSuggestions(body) });
      }
      return NextResponse.json({ suggestions });
    }
    return NextResponse.json({ suggestions: fallbackSuggestions(body) });
  } catch (err) {
    return NextResponse.json({
      suggestions: fallbackSuggestions(body),
      warnings: [
        `AI error: ${err instanceof Error ? err.message : "unknown"}`,
      ],
    });
  }
}
