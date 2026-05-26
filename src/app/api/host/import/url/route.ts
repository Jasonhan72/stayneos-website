import { verifyRequestAuth } from "@/lib/auth/admin-api";
import { NextRequest, NextResponse } from "next/server";
import { validateCsrf } from '@/lib/security/csrf';

export const dynamic = "force-dynamic";

interface ExtractedDraft {
  title?: string;
  address?: string;
  city?: string;
  neighborhood?: string;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  priceMonthly?: number;
  description?: string;
  amenities?: string[];
  minStayDays?: number;
  images?: string[];
}

function safeNumber(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export async function POST(req: NextRequest) {
  if (!validateCsrf(req)) return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
  const user = await verifyRequestAuth(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let url = "";
  try {
    const body = (await req.json()) as { url?: string };
    url = String(body?.url || "").trim();
  } catch {
    /* ignore */
  }

  if (!url) {
    return NextResponse.json({ error: "URL required" }, { status: 400 });
  }
  // Validate URL: must be http/https only (prevent SSRF via file:// etc.)
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return NextResponse.json({ error: 'Only http/https URLs are supported' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  const warnings: string[] = [];

  // ── Step 1: fetch page text via Jina Reader ────────────────────────────────
  // We send hints to Jina to focus on main content and strip nav/header/footer
  // (the StreetEasy nav alone is ~15k chars and pushes the real listing data
  // out of the truncation window if we don't filter it).
  const jinaKey = process.env.JINA_API_KEY || "";
  const jinaUrl = `https://r.jina.ai/${url}`;
  let pageText = "";
  try {
    const jinaHeaders: Record<string, string> = {
      "X-Target-Selector": "main, [role=main], article, #site-content, .listingDetails, .listing-details",
      "X-Remove-Selector": "nav, header, footer, aside, script, style, .nav, .footer, .header, .menu, .breadcrumbs, .ad, .ads",
      "X-Return-Format": "markdown",
    };
    if (jinaKey) jinaHeaders["Authorization"] = `Bearer ${jinaKey}`;
    const jinaRes = await fetch(jinaUrl, { headers: jinaHeaders });
    if (!jinaRes.ok) {
      warnings.push(`Failed to fetch page (HTTP ${jinaRes.status})`);
    } else {
      pageText = await jinaRes.text();
    }
  } catch (err) {
    warnings.push(
      `Page fetch error: ${err instanceof Error ? err.message : "unknown"}`,
    );
  }

  // 30k chars is plenty for a single listing page and well within Haiku's
  // 200k context window. Keeps cost reasonable while not losing data.
  const truncated = pageText.slice(0, 30000);

  // ── Step 2: extract structured data with Claude ────────────────────────────
  const anthropicKey = process.env.ANTHROPIC_API_KEY || "";
  let draft: ExtractedDraft = {};

  if (!anthropicKey) {
    warnings.push(
      "ANTHROPIC_API_KEY not configured — returning empty draft. Set it in .env.local or the runtime env.",
    );
  } else if (!truncated) {
    warnings.push("No page content to analyze.");
  } else {
    try {
      const prompt = `You are extracting rental property information from a real estate listing page (Airbnb / StreetEasy / Realtor / Zillow / Booking / Kijiji etc).

Return ONLY valid JSON (no markdown fences, no commentary). Use these fields and OMIT any you genuinely cannot find. Be aggressive: if the page clearly shows a price like "$7,425 for rent" or "2 beds", you MUST include it. Numbers must be plain integers/decimals (no $, no commas).

{
  "title": string,                 // listing title or address line
  "address": string,               // street address, e.g. "180 Water Street #1607"
  "city": string,                  // e.g. "Manhattan" / "Toronto"
  "neighborhood": string,          // e.g. "Financial District"
  "bedrooms": number,              // 0 for studio
  "bathrooms": number,             // decimals allowed (1.5)
  "sqft": number,                  // square feet of the unit
  "priceMonthly": number,          // monthly rent in the page's currency, integer
  "description": string,           // the 'About' / overview text, 1-3 paragraphs, plain text
  "amenities": string[],           // building + unit amenities, short phrases, max 30
  "minStayDays": number,           // lease length min, e.g. 30 for monthly, 365 for 12-month
  "images": string[]               // direct image URLs (https://...), max 14
}

Extraction rules:
- Pull the FULL 'About' / description text, not just the first sentence.
- For amenities, include both building amenities (gym, doorman, roof deck...) and unit features (washer/dryer, dishwasher, hardwood floors...).
- Extract image URLs that look like real listing photos (e.g. photos.zillowstatic.com, *.airbnb.com, /listing/...). Skip logos, icons, ads, tracking pixels.
- If the page lists "2 beds" => bedrooms=2. "5 rooms" is NOT bedrooms.
- For lease terms like "13-month lease", set minStayDays=395 (13*30). For monthly listings, 30.

Webpage content:
${truncated}`;

      const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5",
          max_tokens: 4096,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!aiRes.ok) {
        const errText = await aiRes.text().catch(() => "");
        warnings.push(`AI extraction failed (HTTP ${aiRes.status}): ${errText.slice(0, 200)}`);
      } else {
        const aiData = (await aiRes.json()) as {
          content?: Array<{ text?: string }>;
        };
        const text = aiData.content?.[0]?.text || "{}";
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
          try {
            draft = JSON.parse(match[0]) as ExtractedDraft;
          } catch {
            warnings.push("AI returned non-JSON content; ignoring.");
          }
        }
      }
    } catch (err) {
      warnings.push(
        `AI extraction error: ${err instanceof Error ? err.message : "unknown"}`,
      );
    }
  }

  // ── Step 3: shape into ListingDraft fragment ───────────────────────────────
  const bedrooms = safeNumber(draft.bedrooms);
  const result = {
    type: "apartment",
    location: {
      address: String(draft.address || ""),
      city: String(draft.city || "Toronto"),
      neighborhood: String(draft.neighborhood || ""),
    },
    basics: {
      bedrooms,
      bathrooms: safeNumber(draft.bathrooms),
      sqft: safeNumber(draft.sqft),
      maxGuests: bedrooms ? bedrooms * 2 : 2,
    },
    amenities: Array.isArray(draft.amenities)
      ? draft.amenities.filter((a) => typeof a === "string").slice(0, 30)
      : [],
    title: String(draft.title || ""),
    description: String(draft.description || ""),
    pricing: {
      priceMonthly: safeNumber(draft.priceMonthly),
      minStayDays: safeNumber(draft.minStayDays) || 30,
    },
    importedImages: Array.isArray(draft.images)
      ? draft.images.filter((i) => typeof i === "string").slice(0, 10)
      : [],
    importSource: "url" as const,
    importUrl: url,
  };

  return NextResponse.json({ draft: result, warnings });
}
