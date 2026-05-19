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
  const jinaKey = process.env.JINA_API_KEY || "";
  const jinaUrl = `https://r.jina.ai/${url}`;
  let pageText = "";
  try {
    const jinaRes = await fetch(jinaUrl, {
      headers: jinaKey ? { Authorization: `Bearer ${jinaKey}` } : {},
    });
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

  const truncated = pageText.slice(0, 8000);

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
      const prompt = `Extract rental property information from this webpage content and return ONLY valid JSON with these fields (omit fields you can't find):
{
  "title": string,
  "address": string,
  "city": string,
  "neighborhood": string,
  "bedrooms": number,
  "bathrooms": number,
  "sqft": number,
  "priceMonthly": number,
  "description": string,
  "amenities": string[],
  "minStayDays": number,
  "images": string[]
}

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
          max_tokens: 1024,
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
