import { verifyRequestAuth } from "@/lib/auth/admin-api";
import { NextRequest, NextResponse } from "next/server";
import { validateCsrf } from '@/lib/security/csrf';
import type { ListingDraft } from "@/types/listing-draft";

export const dynamic = "force-dynamic";

function fallback(draft: ListingDraft): { en: string; zh: string; fr: string } {
  const city = draft.location?.city || "Toronto";
  const nb = draft.location?.neighborhood ? ` in ${draft.location.neighborhood}` : "";
  const type = draft.type || "apartment";
  const beds = draft.basics?.bedrooms ?? "—";
  const baths = draft.basics?.bathrooms ?? "—";
  const ams = (draft.amenities || []).slice(0, 6).join(", ");
  const en = `Comfortable ${type}${nb} in ${city} with ${beds} bedroom(s) and ${baths} bathroom(s). ${ams ? `Features include ${ams}. ` : ""}A great base for medium and long-term stays.`;
  const zh = `位于${city}${draft.location?.neighborhood ? `（${draft.location.neighborhood}）` : ""}的舒适${type}，${beds} 卧 ${baths} 卫。${ams ? `配备 ${ams}。` : ""}适合中长期入住。`;
  const fr = `${type} confortable${nb} à ${city}, avec ${beds} chambre(s) et ${baths} salle(s) de bain. ${ams ? `Comprend ${ams}. ` : ""}Une excellente base pour les séjours de moyenne et longue durée.`;
  return { en, zh, fr };
}

export async function POST(req: NextRequest) {
  if (!validateCsrf(req)) return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
  const user = await verifyRequestAuth(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let draft: ListingDraft = { step: 0 };
  try {
    draft = (await req.json()) as ListingDraft;
  } catch {
    /* ignore */
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY || "";
  if (!anthropicKey) {
    return NextResponse.json({
      ...fallback(draft),
      warnings: ["ANTHROPIC_API_KEY not set — using heuristic description."],
    });
  }

  const prompt = `Write a warm, factual rental listing description (about 120-180 words) in English, Simplified Chinese, and French, based on this data.
Return ONLY valid JSON: {"en": "...", "zh": "...", "fr": "..."} — no markdown.

Listing:
- type: ${draft.type || "apartment"}
- city: ${draft.location?.city || ""}
- neighborhood: ${draft.location?.neighborhood || ""}
- bedrooms: ${draft.basics?.bedrooms ?? ""}
- bathrooms: ${draft.basics?.bathrooms ?? ""}
- sqft: ${draft.basics?.sqft ?? ""}
- maxGuests: ${draft.basics?.maxGuests ?? ""}
- amenities: ${(draft.amenities || []).join(", ")}
- priceMonthly: ${draft.pricing?.priceMonthly ?? ""}
- minStayDays: ${draft.pricing?.minStayDays ?? ""}`;

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
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!aiRes.ok) {
      return NextResponse.json({
        ...fallback(draft),
        warnings: [`AI failed (HTTP ${aiRes.status})`],
      });
    }
    const data = (await aiRes.json()) as { content?: Array<{ text?: string }> };
    const text = data.content?.[0]?.text || "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      return NextResponse.json({
        ...fallback(draft),
        warnings: ["AI returned no JSON."],
      });
    }
    const parsed = JSON.parse(match[0]) as { en?: string; zh?: string; fr?: string };
    return NextResponse.json({
      en: String(parsed.en || fallback(draft).en),
      zh: String(parsed.zh || fallback(draft).zh),
      fr: String(parsed.fr || fallback(draft).fr),
    });
  } catch (err) {
    return NextResponse.json({
      ...fallback(draft),
      warnings: [`AI error: ${err instanceof Error ? err.message : "unknown"}`],
    });
  }
}
