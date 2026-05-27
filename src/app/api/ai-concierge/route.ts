import { NextRequest, NextResponse } from 'next/server';

interface ConciergeRequest {
  message: string;
  language: string;
}

interface ConciergeResponse {
  text: string;
  recommended_property_id: number | null;
  alternative_property_id: number | null;
  hotel_comparison: string;
}

interface LiveProperty {
  id: string;
  slug: string;
  title: string;
  titleZh?: string;
  location: string;
  neighborhood?: string;
  city: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  area?: number;
  description?: string;
  status: string;
}

// Fetch live properties from the internal API
async function fetchLiveProperties(): Promise<LiveProperty[]> {
  try {
    const res = await fetch('https://neos.rentals/api/properties', {
      signal: AbortSignal.timeout(5000),
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    const props: LiveProperty[] = (data.properties || []).filter(
      (p: LiveProperty) => p.status === 'PUBLISHED'
    );
    return props;
  } catch (err) {
    console.error('Failed to fetch live properties:', err);
    return [];
  }
}

// Build property context string from live data
function buildPropertyContext(properties: LiveProperty[]): string {
  if (properties.length === 0) {
    return '(Live property data temporarily unavailable)';
  }

  let ctx = 'LIVE NEOS PROPERTIES (AUTHORITATIVE — do NOT invent or modify any prices):\n\n';
  properties.forEach((p, i) => {
    ctx += `${i + 1}. ID: ${p.id}\n`;
    ctx += `   Title: ${p.title}\n`;
    if (p.titleZh) ctx += `   Title (ZH): ${p.titleZh}\n`;
    ctx += `   Address: ${p.location}\n`;
    ctx += `   City: ${p.city}${p.neighborhood ? ` / ${p.neighborhood}` : ''}\n`;
    ctx += `   Monthly Price: $${p.price} CAD/month\n`;
    ctx += `   Bedrooms: ${p.bedrooms}, Bathrooms: ${p.bathrooms}, Max Guests: ${p.maxGuests}\n`;
    if (p.area && p.area > 0) ctx += `   Area: ${p.area} sqft\n`;
    if (p.description) ctx += `   Description: ${p.description.substring(0, 200)}\n`;
    ctx += `   Listing URL: https://www.neos.rentals/properties/${p.slug}\n\n`;
  });
  return ctx;
}

// Extract budget from user message (returns null if not mentioned)
function extractBudget(message: string): number | null {
  // Match patterns like $3500, 3500/月, 3500 a month, 预算3500, budget 3500, under 3500, etc.
  const patterns = [
    /\$\s*(\d{3,5})/,
    /(\d{3,5})\s*(?:\/月|\/mo|\/month|per month|a month)/i,
    /(?:预算|budget|under|below|less than|不超过|以内)\s*\$?\s*(\d{3,5})/i,
  ];
  for (const re of patterns) {
    const m = message.match(re);
    if (m) return parseInt(m[1], 10);
  }
  return null;
}

// IP-based rate limit for public concierge (10 req/min)
const conciergeRateLimit = new Map<string, { count: number; resetAt: number }>();

function checkConciergeRateLimit(request: NextRequest): boolean {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip') || 'unknown';
  const now = Date.now();
  const existing = conciergeRateLimit.get(ip);

  if (!existing || existing.resetAt <= now) {
    conciergeRateLimit.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (existing.count >= 10) return false;
  existing.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    if (!checkConciergeRateLimit(request)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment.' },
        { status: 429 }
      );
    }

    const body: ConciergeRequest = await request.json();

    if (!body.message || typeof body.message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Fetch live property data
    const liveProperties = await fetchLiveProperties();
    const propertyContext = buildPropertyContext(liveProperties);

    // Extract budget constraint
    const budget = extractBudget(body.message);

    // Filter properties by budget if specified
    const matchingProperties = budget
      ? liveProperties.filter(p => p.price <= budget)
      : liveProperties;

    // Build budget guidance for the AI
    let budgetGuidance = '';
    if (budget && matchingProperties.length === 0) {
      const cheapest = liveProperties.sort((a, b) => a.price - b.price)[0];
      budgetGuidance = `\n\nBUDGET NOTE: User requested max $${budget}/month. NONE of our current properties fall within this budget. ` +
        `DO NOT recommend any property as if it fits the budget. ` +
        `Instead, clearly state that we currently have no listings under $${budget}/month, ` +
        `and mention our most affordable option (${cheapest?.title} at $${cheapest?.price}/month) as a reference. ` +
        `Suggest the user contact us at hello@neos.rentals for custom solutions or future availability.`;
    } else if (budget && matchingProperties.length > 0) {
      budgetGuidance = `\n\nBUDGET NOTE: User requested max $${budget}/month. Only recommend properties with price ≤ $${budget}: ` +
        matchingProperties.map(p => `${p.title} ($${p.price}/month)`).join(', ');
    }

    const SYSTEM_PROMPT = `You are NEOS AI Concierge, an expert housing assistant for premium furnished apartments.

${propertyContext}

CRITICAL RULES — VIOLATION IS NOT PERMITTED:
1. NEVER invent, estimate, or modify any property price. Use ONLY the exact prices shown above.
2. NEVER mention a property address or price that is not in the above list.
3. If no property matches the user's budget, explicitly say so and suggest the closest option.
4. Always respond in the same language the user writes in (Chinese → respond in Chinese, French → respond in French).
5. Recommend a specific property based on user needs. Be warm, concise, max 3-4 sentences.
6. Include a brief hotel comparison showing value.
7. When responding in Chinese, use Chinese terms for all amenities (e.g. 水电费 not utilities, 服务 not services).
8. Return ONLY valid JSON:
{
  "text": "Your helpful response text",
  "recommended_property_id": "property-id-or-null",
  "alternative_property_id": "property-id-or-null",
  "hotel_comparison": "Brief comparison vs hotel pricing"
}
${budgetGuidance}`;

    // Try Cloudflare Workers AI if available
    const env = (process.env as Record<string, unknown>);
    const ai = (env as { AI?: { run: (model: string, input: Record<string, unknown>) => Promise<{ response?: string }> } }).AI;
    const model = (env.AI_CONCIERGE_MODEL as string) || '@cf/meta/llama-3.1-8b-instruct';

    if (ai && typeof ai.run === 'function') {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        const result = await ai.run(model, {
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: body.message },
          ],
          max_tokens: 500,
        });

        clearTimeout(timeout);

        if (result?.response) {
          try {
            const cleanedResponse = result.response
              .replace(/```json\n?/g, '')
              .replace(/```\n?/g, '')
              .trim();
            const parsed: ConciergeResponse = JSON.parse(cleanedResponse);

            if (parsed.text) {
              return NextResponse.json(parsed);
            }
          } catch {
            const lang = body.language || 'en';
            return NextResponse.json(buildFallbackResponse(lang, budget, liveProperties));
          }
        }
      } catch {
        // AI timeout or error — fall through to fallback
      }
    }

    // Fallback: keyword matching
    return NextResponse.json(buildFallbackResponse(body.language || 'en', budget, liveProperties));
  } catch (_error) {
    return NextResponse.json(buildFallbackResponse('en', null, []));
  }
}

function buildFallbackResponse(
  lang: string,
  budget: number | null,
  properties: LiveProperty[]
): ConciergeResponse {
  const matchingProps = budget ? properties.filter(p => p.price <= budget) : properties;
  const tokyoProps = properties.filter(p => p.city === 'Toronto');
  const recommended = matchingProps.length > 0 ? matchingProps[0] : (tokyoProps.length > 0 ? tokyoProps[0] : properties[0]);

  if (budget && matchingProps.length === 0) {
    const cheapest = [...properties].sort((a, b) => a.price - b.price)[0];
    if (lang === 'zh') {
      return {
        text: `抱歉，我们目前暂无月租 $${budget} 以内的房源。最实惠的选择是 ${cheapest?.title || '22 Wellesley St'}，月租 $${cheapest?.price || 4000}。如需了解更多或有特殊需求，请联系 hello@neos.rentals。`,
        recommended_property_id: cheapest ? parseInt(cheapest.id) || null : null,
        alternative_property_id: null,
        hotel_comparison: lang === 'zh' ? '多伦多同区酒店通常 $150-300/晚，月度住宿性价比更优。' : 'Hotels in the area typically cost $150-300/night.',
      };
    }
    return {
      text: `We currently don't have any listings under $${budget}/month. Our most affordable option is ${cheapest?.title} at $${cheapest?.price}/month — fully furnished and move-in ready. Contact hello@neos.rentals for future availability.`,
      recommended_property_id: cheapest ? parseInt(cheapest.id) || null : null,
      alternative_property_id: null,
      hotel_comparison: 'Comparable extended-stay hotels cost $150-250/night. Our monthly rate offers significantly better value.',
    };
  }

  if (lang === 'zh') {
    return {
      text: `根据您的需求，推荐 ${recommended?.title || '238 Simcoe St 套房'} — 全家具，月租 $${recommended?.price || 8000}，设施齐全，可随时入住。`,
      recommended_property_id: recommended ? parseInt(recommended.id) || null : 2,
      alternative_property_id: null,
      hotel_comparison: '同区域酒店套房约 $250-400/晚，选择 NEOS 月租可节省高达 45%，并享有完整居家空间。',
    };
  }

  return {
    text: `Based on your needs, I recommend ${recommended?.title || '238 Simcoe St'} — fully furnished at $${recommended?.price || 8000}/month, move-in ready with full amenities.`,
    recommended_property_id: recommended ? parseInt(recommended.id) || null : 2,
    alternative_property_id: null,
    hotel_comparison: 'Comparable hotel suites in this area cost $250-400/night. NEOS saves you up to 45% with a real home experience.',
  };
}
