import { NextRequest, NextResponse } from 'next/server';
import { validateCsrf } from '@/lib/security/csrf';
import { getPropertyDb, toPublicProperty, type PropertyRecord } from '@/lib/property-db';

interface ConciergeRequest {
  message: string;
  language: string;
}

interface ConciergeResponse {
  text: string;
  recommended_property_id: string | null;
  alternative_property_id: string | null;
  hotel_comparison: string;
}

interface LiveProperty {
  id: string;
  slug: string;
  title: string;
  titleZh?: string;
  titleFr?: string;
  location: string;
  neighborhood?: string;
  city: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  area?: number;
  description?: string;
  descriptionZh?: string;
  descriptionFr?: string;
  status: string;
}

interface CloudflareEnv {
  AI?: {
    run: (model: string, input: {
      messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
      max_tokens?: number;
      temperature?: number;
    }) => Promise<{ response?: string }>;
  };
}

function getCloudflareContext(): { env?: CloudflareEnv } | undefined {
  const symbol = Symbol.for('__cloudflare-context__');
  return (globalThis as typeof globalThis & { [key: symbol]: { env?: CloudflareEnv } | undefined })[symbol];
}

function getAI(): CloudflareEnv['AI'] | undefined {
  const cfContext = getCloudflareContext();
  if (cfContext?.env?.AI) return cfContext.env.AI;
  return (process.env as unknown as CloudflareEnv).AI;
}

async function fetchLiveProperties(): Promise<LiveProperty[]> {
  try {
    const db = getPropertyDb();
    const result = await db.prepare("SELECT * FROM Property WHERE status='PUBLISHED' ORDER BY createdAt DESC").all();
    return (result.results || [])
      .map((item) => toPublicProperty(item as unknown as PropertyRecord))
      .filter((property) => property.status === 'PUBLISHED' && property.price > 0)
      .map((property) => ({
        id: property.id,
        slug: property.slug,
        title: property.title,
        titleZh: property.titleZh,
        titleFr: property.titleFr,
        location: property.location,
        neighborhood: property.neighborhood,
        city: property.city,
        price: property.price,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        maxGuests: property.maxGuests,
        area: property.area,
        description: property.description,
        descriptionZh: property.descriptionZh,
        descriptionFr: property.descriptionFr,
        status: property.status,
      }));
  } catch (error) {
    console.error('Failed to fetch live concierge properties:', error);
    return [];
  }
}

function extractBudget(message: string): number | null {
  const patterns = [
    /\$\s*([1-9][0-9,]{3,5})/,
    /([1-9][0-9,]{3,5})\s*(?:\/月|\/mo|\/month|per month|a month|每月|月租)/i,
    /(?:预算|budget|under|below|less than|不超过|以内|max|maximum)\s*\$?\s*([1-9][0-9,]{3,5})/i,
    /\$?\s*([1-9][0-9,]{3,5})\s*(?:以内|以下|以下的|under|below|budget)/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (!match) continue;
    const value = Number(match[1].replace(/,/g, ''));
    if (Number.isFinite(value)) return value;
  }
  return null;
}

function formatCurrency(value: number, language: string): string {
  const formatted = `$${value.toLocaleString('en-CA')}`;
  if (language === 'zh') return `CAD ${formatted}`;
  if (language === 'fr') return `${formatted} CAD`;
  return `CAD ${formatted}`;
}

function getLocalizedTitle(property: LiveProperty, language: string): string {
  if (language === 'zh' && property.titleZh) return property.titleZh;
  if (language === 'fr' && property.titleFr) return property.titleFr;
  return property.title;
}

function buildPropertyContext(properties: LiveProperty[], language: string): string {
  if (properties.length === 0) return 'LIVE NEOS PROPERTIES: No current published properties are available.';

  let context = 'LIVE NEOS PROPERTIES (AUTHORITATIVE: never invent or modify prices):\n\n';
  properties.forEach((property, index) => {
    context += `${index + 1}. ID: ${property.id}\n`;
    context += `   Title: ${getLocalizedTitle(property, language)}\n`;
    context += `   Address: ${property.location}\n`;
    context += `   City: ${property.city}${property.neighborhood ? ` / ${property.neighborhood}` : ''}\n`;
    context += `   Monthly Price: ${formatCurrency(property.price, language)}/month\n`;
    context += `   Bedrooms: ${property.bedrooms}, Bathrooms: ${property.bathrooms}, Max Guests: ${property.maxGuests}\n`;
    if (property.area && property.area > 0) context += `   Area: ${property.area} sqft\n`;
    const description = language === 'zh' ? property.descriptionZh : language === 'fr' ? property.descriptionFr : property.description;
    if (description) context += `   Description: ${description.slice(0, 220)}\n`;
    context += `   Listing URL: https://www.stayneos.com/property/${property.slug}\n\n`;
  });
  return context;
}

function pickBestProperty(properties: LiveProperty[], message: string): LiveProperty | null {
  if (properties.length === 0) return null;

  const query = message.toLowerCase();
  const scored = properties.map((property) => {
    const haystack = `${property.title} ${property.titleZh || ''} ${property.location} ${property.neighborhood || ''} ${property.description || ''} ${property.descriptionZh || ''}`.toLowerCase();
    let score = 0;
    if (/hospital|medical|doctor|insurance|医院|医疗|医生|保险|rotation|轮转/i.test(message) && /simcoe|hospital|医院|university|uoft|大学|sickkids|sinai/i.test(haystack)) score += 10;
    if (/u\s*of\s*t|uoft|university|scholar|student|多大|大学|学者|学生/i.test(message) && /wellesley|simcoe|university|uoft|多伦多大学|大学/i.test(haystack)) score += 8;
    if (/family|corporate|executive|relocat|家庭|高管|企业|搬迁/i.test(message) && property.bedrooms >= 3) score += 7;
    for (const token of query.replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter((t) => t.length > 2)) {
      if (haystack.includes(token)) score += 1;
    }
    return { property, score };
  });

  scored.sort((a, b) => b.score - a.score || a.property.price - b.property.price);
  return scored[0]?.property || null;
}

function buildNoBudgetMatchResponse(language: string, budget: number, cheapest: LiveProperty | undefined): ConciergeResponse {
  if (!cheapest) {
    return {
      text: language === 'zh'
        ? '目前没有可引用的实时房源数据。请查看房源页面或联系 hello@stayneos.com 确认最新可订房源。'
        : language === 'fr'
          ? "Je n'ai pas de données de logements en temps réel à citer pour le moment. Consultez la page des logements ou écrivez à hello@stayneos.com."
          : 'I do not have live property data to cite right now. Please check our properties page or email hello@stayneos.com.',
      recommended_property_id: null,
      alternative_property_id: null,
      hotel_comparison: '',
    };
  }

  const price = formatCurrency(cheapest.price, language);
  const title = getLocalizedTitle(cheapest, language);

  return {
    text: language === 'zh'
      ? `目前暂无月租 ${formatCurrency(budget, language)} 以内的房源。最接近的是 ${title}，月租 ${price}，如预算有弹性我可以继续帮您比较；也可以联系 hello@stayneos.com 了解后续可用房源。`
      : language === 'fr'
        ? `Nous n'avons actuellement aucun logement à moins de ${formatCurrency(budget, language)} par mois. L'option la plus proche est ${title}, à ${price}/mois; contactez hello@stayneos.com pour les prochaines disponibilités.`
        : `We do not currently have any homes under ${formatCurrency(budget, language)} per month. The closest option is ${title} at ${price}/mo; contact hello@stayneos.com for future availability.`,
    recommended_property_id: null,
    alternative_property_id: cheapest.id,
    hotel_comparison: language === 'zh'
      ? '酒店式长住通常按晚计费；NEOS 只引用当前内部房源价格，不会为了匹配预算改写价格。'
      : language === 'fr'
        ? "Les séjours hôteliers prolongés sont généralement facturés à la nuit; NEOS ne modifie pas les prix pour correspondre à un budget."
        : 'Extended-stay hotels are usually priced nightly; NEOS only quotes current internal listing prices and does not alter them to fit a budget.',
  };
}

function buildFallbackResponse(language: string, budget: number | null, properties: LiveProperty[], message: string): ConciergeResponse {
  const sorted = [...properties].sort((a, b) => a.price - b.price);
  if (budget !== null) {
    const withinBudget = sorted.filter((property) => property.price <= budget);
    if (withinBudget.length === 0) return buildNoBudgetMatchResponse(language, budget, sorted[0]);
  }

  const candidates = budget !== null ? sorted.filter((property) => property.price <= budget) : sorted;
  const best = pickBestProperty(candidates.length ? candidates : sorted, message);
  if (!best) return buildNoBudgetMatchResponse(language, budget || 0, undefined);

  const price = formatCurrency(best.price, language);
  const title = getLocalizedTitle(best, language);
  const alternative = sorted.find((property) => property.id !== best.id) || null;

  return {
    text: language === 'zh'
      ? `根据当前 NEOS 内部房源数据，我推荐 ${title}，月租 ${price}。它的位置是 ${best.location}，${best.bedrooms} 卧 ${best.bathrooms} 卫，适合您描述的需求；我只引用当前房源数据，不会编造低价。`
      : language === 'fr'
        ? `D'après les données internes actuelles de NEOS, je recommande ${title} à ${price}/mois. Il se trouve à ${best.location}, avec ${best.bedrooms} chambre(s) et ${best.bathrooms} salle(s) de bain; je ne cite que les prix internes actuels.`
        : `Based on current internal NEOS property data, I recommend ${title} at ${price}/mo. It is at ${best.location}, with ${best.bedrooms} bedroom(s) and ${best.bathrooms} bathroom(s); I only quote current internal prices.`,
    recommended_property_id: best.id,
    alternative_property_id: alternative?.id || null,
    hotel_comparison: language === 'zh'
      ? '同区域长住酒店通常按晚收费；NEOS 月租提供完整厨房、家具和服务。'
      : language === 'fr'
        ? 'Les hôtels de séjour prolongé du secteur sont généralement facturés à la nuit; NEOS offre une cuisine complète, le mobilier et les services.'
        : 'Comparable extended-stay hotels are usually priced nightly; NEOS monthly stays include a full kitchen, furnishings, and services.',
  };
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
    if (!validateCsrf(request)) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }

    if (!checkConciergeRateLimit(request)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment.' },
        { status: 429 }
      );
    }

    const body: ConciergeRequest = await request.json();
    if (!body.message || typeof body.message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const language = body.language || 'en';
    const liveProperties = await fetchLiveProperties();
    const budget = extractBudget(body.message);
    const cheapest = [...liveProperties].sort((a, b) => a.price - b.price)[0];

    if (budget !== null && liveProperties.every((property) => property.price > budget)) {
      return NextResponse.json(buildNoBudgetMatchResponse(language, budget, cheapest));
    }

    const propertyContext = buildPropertyContext(liveProperties, language);
    const matchingProperties = budget !== null
      ? liveProperties.filter((property) => property.price <= budget)
      : liveProperties;
    const budgetGuidance = budget !== null
      ? `\n\nBUDGET NOTE: User requested max ${formatCurrency(budget, language)}/month. Only recommend properties with price <= that budget: ${matchingProperties.map((p) => `${getLocalizedTitle(p, language)} (${formatCurrency(p.price, language)}/month)`).join(', ') || 'none'}.`
      : '';

    const systemPrompt = `You are NEOS AI Concierge, an expert housing assistant for premium furnished apartments.

${propertyContext}

CRITICAL RULES:
1. NEVER invent, estimate, or modify property prices, addresses, discounts, or availability.
2. Use only LIVE NEOS PROPERTIES above as the property source.
3. If no property matches the user's budget, explicitly say so and suggest the closest option.
4. Respond in the same language the user writes in.
5. When responding in Chinese, use Chinese terms for amenities and services, e.g. 水电费, 服务, 家具, not untranslated English labels.
6. Return ONLY valid JSON:
{
  "text": "Your helpful response text",
  "recommended_property_id": "property-id-or-null",
  "alternative_property_id": "property-id-or-null",
  "hotel_comparison": "Brief comparison vs hotel pricing"
}
${budgetGuidance}`;

    const ai = getAI();
    const model = process.env.AI_CONCIERGE_MODEL || '@cf/meta/llama-3.1-8b-instruct';

    if (ai && typeof ai.run === 'function') {
      try {
        const result = await ai.run(model, {
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: body.message },
          ],
          max_tokens: 500,
          temperature: 0.2,
        });

        if (result?.response) {
          const cleanedResponse = result.response
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();
          const parsed = JSON.parse(cleanedResponse) as ConciergeResponse;
          if (parsed.text) return NextResponse.json(parsed);
        }
      } catch (error) {
        console.error('AI concierge response failed:', error);
      }
    }

    return NextResponse.json(buildFallbackResponse(language, budget, liveProperties, body.message));
  } catch (error) {
    console.error('Concierge route error:', error);
    return NextResponse.json({
      text: 'I could not load current property data right now. Please check the properties page or email hello@stayneos.com.',
      recommended_property_id: null,
      alternative_property_id: null,
      hotel_comparison: '',
    } satisfies ConciergeResponse);
  }
}
