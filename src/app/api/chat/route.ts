import { NextRequest, NextResponse } from 'next/server';
import { validateCsrf } from '@/lib/security/csrf';
import { mockProperties } from '@/lib/data';
import { getPropertyDb, toPublicProperty, type PropertyRecord } from '@/lib/property-db';

// Type definitions for Cloudflare Workers AI
interface CloudflareEnv {
  AI: {
    run: (model: string, options: {
      messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
      max_tokens?: number;
      temperature?: number;
    }) => Promise<{ response: string }>;
  };
}

// Get Cloudflare context from global symbol
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getCloudflareContext(): any | undefined {
  const symbol = Symbol.for("__cloudflare-context__");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const context = (globalThis as any)[symbol];
  return context;
}

// Get AI binding from Cloudflare environment
function getAI(): CloudflareEnv['AI'] {
  // Try to get AI from Cloudflare context (for Cloudflare Workers)
  const cfContext = getCloudflareContext();
  if (cfContext?.env?.AI) {
    return cfContext.env.AI;
  }
  
  // Fallback to process.env (for development/testing)
  const env = process.env as unknown as { AI?: CloudflareEnv['AI'] };
  if (env.AI) {
    return env.AI;
  }
  
  if (process.env.NODE_ENV !== 'production') console.error("AI binding not found");
  throw new Error("AI binding not found. Make sure AI is bound in wrangler.toml");
}

// System prompt for Aria
const SYSTEM_PROMPT = `You are Aria, the Customer Care Lead at NEOS (NEOS Executive Apartments).

## About NEOS Website
- Website: www.stayneos.com (neos.rentals redirects here)
- Features: Browse properties, AI Concierge for recommendations, For Business form for corporate housing
- Languages: English, Chinese, French
- Contact: support@stayneos.com, +1 (647) 446-7987

## Booking Process
1. **Browse**: Visit /properties to see all available apartments
2. **Inquire**: Use AI Concierge on homepage or contact form for questions
3. **Book**: For business/corporate: /for-business form (5 fields, 2-hour response guarantee)
4. **Payment**: Monthly, quarterly, or annual rates available
5. **Check-in**: Digital key access, welcome package, 24/7 support

## Key Policies
- Minimum stay: 30 days
- Included: Fully furnished, utilities, Wi-Fi, housekeeping
- Insurance: $2M commercial liability coverage
- Cancellation: 30-day notice for monthly stays
- Pets: Case-by-case approval (contact for details)

## Special Services
- **Corporate Housing**: Custom solutions for project teams, relocations
- **Medical Stays**: Proximity to major hospitals, insurance coordination
- **Academic Housing**: Near UofT, OCAD, Ryerson campuses
- **Long-term**: 3+ month stays with discounted rates

## Web Search Capability
If you need current Toronto rental market data, local news, or competitor pricing, you can query external websites through our web search API.
Use this for: Toronto rental trends, local events affecting housing, competitor pricing comparisons.
Don't use for: personal information, sensitive data, non-housing topics, or making up property listings.

## Your Role
- Answer questions about properties, pricing, availability
- Guide users to appropriate pages (/properties, /for-business)
- Explain booking process and policies
- **Answer general city living questions**: weather, transit, neighborhoods, restaurants, hospitals, schools, events, etc.
- **Be a helpful local concierge**, not just a property FAQ bot
- Use provided weather data or web search results when available
- Escalate complex issues to support@stayneos.com
- Be professional, warm, and helpful. Keep answers concise but complete (3-5 sentences).

IMPORTANT RULES:
- For NEOS property addresses, availability, and prices, ONLY use the LIVE PROPERTY DATA block provided by the API. Never invent or estimate an address, price, discount, or availability.
- If LIVE PROPERTY DATA is empty or unavailable, say that current property data is unavailable and send the user to /properties or support@stayneos.com. Do not fall back to memory or examples.
- For external marketplace listings such as realtor.ca, say external search is not enabled unless explicit EXTERNAL PROPERTY RESULTS are provided in this request. Never hallucinate realtor.ca prices.
- When EXTERNAL PROPERTY RESULTS are provided, mention that they come from realtor.ca and distinguish them from NEOS internal listings.
- Always present NEOS internal properties first and label them as "我们的房源" in Chinese, "NEOS listing" in English, or "logement NEOS" in French.
- External property results should be presented second and clearly labeled "来自 [source]" in Chinese, "from [source]" in English, or "depuis [source]" in French.
- If you have real-time data (weather, search results), use it directly in your answer. Don't say "querying..." or "checking..." — you already have the data.
- For city-specific questions you can answer from general knowledge (transit routes, popular neighborhoods, hospital locations), answer directly without saying you need to search.
- **Pay attention to the city the user is asking about.** If they ask about a city other than Toronto (e.g. Seattle, Vancouver, New York), acknowledge that city in your response. Don't recommend Toronto-specific properties unless they ask about Toronto.
- When responding in Chinese (ZH), use Chinese terminology for amenities and services, for example 水电费 instead of "utilities", 服务 instead of "services", 家具 instead of "furnishings".
- If you truly don't know, suggest contacting support@stayneos.com.
- Respond in the same language the user writes in.`;

// Improved fallback responses by language
const FALLBACK_RESPONSES = {
  EN: "Hi! I'm Aria, NEOS Customer Care. For booking inquiries, visit our properties page or use the AI concierge. For urgent help, email us at support@stayneos.com.",
  ZH: "您好！我是 Aria，NEOS 客服。预订咨询请访问房源页面或使用 AI 租赁顾问。紧急帮助请发送邮件至 support@stayneos.com。",
  FR: "Bonjour ! Je suis Aria, service client NEOS. Pour les demandes de réservation, visitez notre page de propriétés ou utilisez le concierge IA. Pour une aide urgente, écrivez-nous à support@stayneos.com.",
  DEFAULT: "Hi! I'm Aria, NEOS Customer Care. For booking inquiries, visit our properties page or use the AI concierge. For urgent help, email us at support@stayneos.com."
};

// Generate a session ID if not provided
function generateSessionId(): string {
  return `website_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Simple language detection
function detectLanguage(text: string): string {
  const lowerText = text.toLowerCase();
  
  // Check for Chinese characters
  if (/[\u4e00-\u9fff]/.test(text)) {
    return 'ZH';
  }
  
  // Check for French keywords
  if (/\b(bonjour|salut|merci|s'il vous plaît|aidez|aide|français|fr)\b/i.test(lowerText)) {
    return 'FR';
  }
  
  // Default to English
  return 'EN';
}

// Get fallback response based on language
function getFallbackResponse(language: string = 'EN'): string {
  return FALLBACK_RESPONSES[language as keyof typeof FALLBACK_RESPONSES] || FALLBACK_RESPONSES.DEFAULT;
}

function getPropertyFallbackResponse(language: string, properties: InternalChatProperty[]): string {
  if (properties.length === 0) {
    if (language === 'ZH') return '我现在没有可引用的实时房源数据。请先查看 /properties，或发送邮件到 support@stayneos.com 让团队确认最新可订房源。';
    if (language === 'FR') return "Je n'ai pas de données de propriétés en temps réel à citer pour le moment. Consultez /properties ou écrivez à support@stayneos.com pour confirmer les disponibilités.";
    return 'I do not have live property data to cite right now. Please check /properties or email support@stayneos.com for current availability.';
  }

  const lines = properties.map((property) => `${property.title} — CAD $${property.price.toLocaleString('en-CA')}/mo — ${property.location}`);
  if (language === 'ZH') return `我根据 NEOS 当前内部房源数据找到这些匹配项：\n${lines.join('\n')}\n请以房源卡片和详情页为准；我不会引用未验证的外部挂牌价格。`;
  if (language === 'FR') return `D'après les données internes actuelles de NEOS, voici les logements correspondants :\n${lines.join('\n')}\nVeuillez vous fier aux cartes et aux pages de détail; je ne cite pas de prix externes non vérifiés.`;
  return `Based on current internal NEOS property data, these homes match:\n${lines.join('\n')}\nPlease use the cards and detail pages as the source of truth; I will not cite unverified external listing prices.`;
}

// Get AI model from environment variable
function getAIModel(): string {
  return process.env.ARIA_CHAT_MODEL || '@cf/meta/llama-3.1-8b-instruct';
}

// Check if a query needs weather info
function needsWeather(query: string): boolean {
  const q = query.toLowerCase();
  const keywords = ['weather', 'temperature', 'forecast', '天气', '气温', '温度', '预报', 'météo', 'température'];
  return keywords.some(k => q.includes(k));
}

// Fetch weather from wttr.in (free, no API key)
async function getWeather(query: string): Promise<string> {
  try {
    // Extract city or default to Toronto
    let city = 'Toronto';
    const cityMatch = query.match(/(?:weather|天气|météo).*?(?:in|的|à)\s*(.+?)(?:\?|$|,|\.|。)/i);
    if (cityMatch) city = cityMatch[1].trim();
    
    const res = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error('Weather API error');
    const data = await res.json();
    const current = data.current_condition?.[0];
    if (!current) return 'Weather data not available.';

    const forecast = data.weather?.[0];
    return `Current weather in ${city}:
- Temperature: ${current.temp_C}°C (${current.temp_F}°F), Feels like: ${current.FeelsLikeC}°C
- Condition: ${current.weatherDesc?.[0]?.value || 'N/A'}
- Humidity: ${current.humidity}%, Wind: ${current.windspeedKmph} km/h ${current.winddir16Point}
${forecast ? `- Today's forecast: High ${forecast.maxtempC}°C / Low ${forecast.mintempC}°C` : ''}`;
  } catch {
    return 'Unable to fetch weather data right now.';
  }
}

// Check if a query needs external web search
function needsWebSearch(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  const searchKeywords = [
    // Real estate & market
    'market', 'trend', 'competitor', 'compare', 'news', 'toronto rental',
    'rental market', 'housing market', 'price comparison', 'competition',
    'current rates', 'market rate', 'average rent', 'rental trend',
    'toronto news', 'housing news', 'real estate news', 'competitor pricing',
    'how much', 'what is the price', 'compare prices', 'market analysis',
    'rental data', 'market data', 'statistics', 'report', 'study',
    'realtor', 'mls', 'listing', 'condo', 'apartment', 'lease',
    'realtor', 'realtor.ca', 'mls',
    // Local info
    'restaurant', 'food', 'eat', 'bar', 'nightlife', 'event', 'festival',
    'transit', 'ttc', 'subway', 'bus', 'airport', 'commute',
    'school', 'university', 'hospital', 'clinic', 'gym', 'park',
    'neighborhood', 'neighbourhood', 'area', 'district',
    // Chinese keywords — general
    '餐厅', '美食', '交通', '地铁', '学校', '医院', '公园',
    '房价', '房源', '租金', '挂牌', '小区', '社区', '公寓',
    '房产', '楼盘', '二手房', '新房', '出租', '求租',
    '找', '附近', '周围', '旁边', '预算', '价格', '多少钱',
    '租房', '月租', '多大', '市中心', '学区', '华人',
    // Direct URL or search intent
    'search', 'find', 'look up', 'check', 'latest', 'recent', 'current',
    '搜索', '查找', '查一下', '帮我查', '最新', '最近',
  ];

  // Also trigger on URLs in the message
  if (/https?:\/\//.test(query)) return true;
  
  return searchKeywords.some(keyword => lowerQuery.includes(keyword));
}

type InternalChatProperty = {
  id: string;
  title: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  url: string;
  image?: string;
  quarterlyPrice?: number | null;
  annualPrice?: number | null;
};

const GTA_LOCATION_RE = /\b(toronto|north york|scarborough|etobicoke|east york|york|mississauga|markham|vaughan|richmond hill|brampton|oakville|burlington|pickering|ajax|whitby|oshawa|gta|ontario|on)\b/i;
const NON_GTA_LOCATION_RE = /\b(manhattan|new york|nyc|brooklyn|queens|jersey|seattle|vancouver|montreal|calgary|ottawa|chicago|boston|miami|los angeles|san francisco)\b/i;

function firstImageFromJson(value: unknown): string | undefined {
  if (!value) return undefined;
  if (Array.isArray(value)) {
    const first = value[0];
    if (typeof first === 'string') return first;
    if (first && typeof first === 'object' && typeof (first as { url?: unknown }).url === 'string') {
      return (first as { url: string }).url;
    }
    return undefined;
  }
  if (typeof value !== 'string') return undefined;
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return undefined;
    const first = parsed[0];
    if (typeof first === 'string') return first;
    if (first && typeof first === 'object' && typeof (first as { url?: unknown }).url === 'string') {
      return (first as { url: string }).url;
    }
  } catch {
    return value.startsWith('/') || value.startsWith('http') ? value : undefined;
  }
  return undefined;
}

function localizeValue(row: Record<string, unknown>, key: 'title' | 'description', language: string): string {
  const suffix = language === 'ZH' ? 'Zh' : language === 'FR' ? 'Fr' : '';
  const localized = suffix ? row[`${key}${suffix}`] : undefined;
  return String(localized || row[key] || '');
}

function toChatProperty(row: Record<string, unknown>, language = 'EN'): InternalChatProperty {
  const id = String(row.id || row.slug || '');
  const slug = String(row.slug || id);
  const address = String(row.address || row.location || '');
  const city = String(row.city || 'Toronto');
  const location = address.includes(city) ? address : `${address}, ${city}`.replace(/^,\s*/, '');
  const monthly = Number(row.monthlyRate || row.priceMonthly || row.price || 0);
  const image = String(row.heroImage || firstImageFromJson(row.images) || '');

  return {
    id,
    title: localizeValue(row, 'title', language),
    location,
    price: Number.isFinite(monthly) ? monthly : 0,
    bedrooms: Number(row.bedrooms || 0),
    bathrooms: Number(row.bathrooms || 0),
    url: `/property/${slug}`,
    image: image || undefined,
    quarterlyPrice: row.quarterlyRate || row.priceQuarterly ? Number(row.quarterlyRate || row.priceQuarterly) : null,
    annualPrice: row.yearlyRate || row.priceAnnual ? Number(row.yearlyRate || row.priceAnnual) : null,
  };
}

function mockChatProperties(language = 'EN'): InternalChatProperty[] {
  return mockProperties.map((property) => toChatProperty({
    id: property.id,
    slug: property.id,
    title: property.title,
    titleZh: property.titleZh,
    titleFr: property.titleFr,
    address: property.location,
    city: 'Toronto',
    priceMonthly: property.price,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    images: JSON.stringify(property.images),
  }, language));
}

function getQueryBudget(query: string): number | undefined {
  const matches = [...query.matchAll(/\$?\s*([1-9][0-9,]{3,5})\s*(?:cad|\/?mo|monthly|per month|月)?/gi)];
  const values = matches
    .map((match) => Number(match[1].replace(/,/g, '')))
    .filter((value) => Number.isFinite(value) && value >= 1000);
  return values.length ? Math.max(...values) : undefined;
}

function isGtaSearchIntent(query: string): boolean {
  return /多大|uoft|u\s*of\s*t|university\s+of\s+toronto|toronto|gta|多伦多|市中心|安省|ontario/i.test(query);
}

function isGtaInternalProperty(property: InternalChatProperty, requireGta = false): boolean {
  const haystack = `${property.title} ${property.location} ${property.url}`.toLowerCase();
  if (NON_GTA_LOCATION_RE.test(haystack)) return false;
  return !requireGta || GTA_LOCATION_RE.test(haystack);
}

function isGtaExternalProperty(property: ExternalProperty, requireGta = false): boolean {
  const haystack = `${property.title} ${property.location || ''} ${property.snippet || ''} ${property.url}`.toLowerCase();
  if (NON_GTA_LOCATION_RE.test(haystack)) return false;
  return !requireGta || GTA_LOCATION_RE.test(haystack);
}

function getQueryBedrooms(query: string): number | undefined {
  const normalized = query.toLowerCase();
  const match = normalized.match(/\b([1-4])\s*(?:br|bed|bedroom|bedrooms)\b/);
  if (match) return Number(match[1]);
  // Chinese: 一/两/三/四 + 居|室|卧|房|间 (备选 卧室 / 房间)
  if (/(?:一|1)\s*(?:居|室|卧|房|间)(?:室)?/.test(query)) return 1;
  if (/(?:两|二|2)\s*(?:居|室|卧|房|间)(?:室)?/.test(query)) return 2;
  if (/(?:三|3)\s*(?:居|室|卧|房|间)(?:室)?/.test(query)) return 3;
  if (/(?:四|4)\s*(?:居|室|卧|房|间)(?:室)?/.test(query)) return 4;
  return undefined;
}

function scoreProperty(property: InternalChatProperty, query: string, budget?: number, bedrooms?: number): number {
  const haystack = `${property.title} ${property.location}`.toLowerCase();
  const tokens = query.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter((token) => token.length > 2);
  let score = 0;
  for (const token of tokens) {
    if (haystack.includes(token)) score += token.length > 4 ? 3 : 2;
  }
  if (bedrooms && property.bedrooms >= bedrooms) score += 6;
  if (budget && property.price > 0 && property.price <= budget) score += 6;
  if (/medical|hospital|医生|医疗|医院|rotation|academic|scholar|学者|university|大学/i.test(query) && /simcoe|hospital|university|grange/i.test(haystack)) score += 4;
  if (/family|relocat|家庭|搬迁|executive|高管/i.test(query) && property.bedrooms >= 3) score += 3;
  return score;
}

function pickRecommendedProperties(properties: InternalChatProperty[], query: string, limit = 5): InternalChatProperty[] {
  const budget = getQueryBudget(query);
  const bedrooms = getQueryBedrooms(query);
  const requireGta = isGtaSearchIntent(query);
  return [...properties]
    .filter((property) => isGtaInternalProperty(property, requireGta))
    .filter((property) => !bedrooms || property.bedrooms >= bedrooms)
    .filter((property) => !budget || (property.price > 0 && property.price <= budget))
    .map((property) => ({ property, score: scoreProperty(property, query, budget, bedrooms) }))
    .sort((a, b) => b.score - a.score || a.property.price - b.property.price)
    .slice(0, limit)
    .map(({ property }) => property);
}

function findClosestInternalProperty(properties: InternalChatProperty[], query: string): InternalChatProperty | undefined {
  const bedrooms = getQueryBedrooms(query);
  const requireGta = isGtaSearchIntent(query);
  return [...properties]
    .filter((property) => isGtaInternalProperty(property, requireGta))
    .filter((property) => property.price > 0)
    .filter((property) => !bedrooms || property.bedrooms >= bedrooms)
    .sort((a, b) => a.price - b.price)[0];
}

function filterExternalPropertiesForQuery(properties: ExternalProperty[], query: string, budget?: number, limit = 3): ExternalProperty[] {
  const requireGta = isGtaSearchIntent(query);
  const bedrooms = getQueryBedrooms(query);
  return properties
    .filter((property) => isGtaExternalProperty(property, requireGta))
    .filter((property) => !budget || (typeof property.price === 'number' && property.price <= budget))
    .filter((property) => !bedrooms || (typeof property.bedrooms === 'number' && property.bedrooms >= bedrooms))
    .filter((property) =>
      property.source === 'realtor.ca'
      && typeof property.price === 'number'
      && typeof property.bedrooms === 'number'
      && Boolean(property.title && property.url && property.location && property.image)
    )
    .slice(0, limit);
}

function formatChatCurrency(value: number, language: string): string {
  const amount = `$${value.toLocaleString('en-CA')}`;
  if (language === 'FR') return `${amount} CAD`;
  if (language === 'ZH') return `${amount}`;
  return `CAD ${amount}`;
}

function getNoBudgetMatchResponse(language: string, budget: number, closest?: InternalChatProperty): string {
  const budgetText = formatChatCurrency(budget, language);
  if (!closest) {
    if (language === 'ZH') return `目前暂无月租 ${budgetText} 以内的 GTA 房源。请调整预算或位置，或联系 support@stayneos.com 确认最新可订房源。`;
    if (language === 'FR') return `Nous n'avons actuellement aucun logement dans la région du Grand Toronto à moins de ${budgetText} par mois. Essayez un autre budget ou écrivez à support@stayneos.com.`;
    return `We do not currently have any GTA listings under ${budgetText} per month. Try a different budget or email support@stayneos.com for current availability.`;
  }

  const priceText = formatChatCurrency(closest.price, language);
  if (language === 'ZH') {
    return `目前暂无月租 ${budgetText} 以内的 GTA 房源。最接近的是 ${closest.title}，月租 ${priceText} 起。要不要我帮你看这个预算外选项，或换一个预算继续找？`;
  }
  if (language === 'FR') {
    return `Nous n'avons actuellement aucun logement dans la région du Grand Toronto à moins de ${budgetText} par mois. L'option la plus proche est ${closest.title}, à partir de ${priceText}/mois. Voulez-vous voir cette option hors budget ou essayer un autre budget ?`;
  }
  return `We do not currently have any GTA listings under ${budgetText} per month. The closest option is ${closest.title}, starting at ${priceText}/mo. Would you like to review that over-budget option or try another budget?`;
}

// Fetch live property data from the same internal catalog used by /api/properties.
async function getPropertyContext(language = 'EN'): Promise<{ context: string; properties: InternalChatProperty[]; source: 'd1' | 'internal-catalog' | 'empty' }> {
  try {
    const db = getPropertyDb();
    const result = await db.prepare("SELECT * FROM Property WHERE status='PUBLISHED' ORDER BY createdAt DESC").all();

    if (!result.results || result.results.length === 0) {
      return { context: 'LIVE PROPERTY DATA: No published NEOS properties are currently available.', properties: [], source: 'empty' };
    }

    const rows = (result.results || []).map((item) => toPublicProperty(item as unknown as PropertyRecord));
    const properties = rows.map((p) => toChatProperty(p as Record<string, unknown>, language));
    let context = 'LIVE PROPERTY DATA (from internal StayNeos properties API / D1):\n\n';
    rows.forEach((p, i) => {
      const property = properties[i];
      context += `${i + 1}. ID: ${property.id} — ${property.title}\n`;
      context += `   Address: ${property.location}\n`;
      if (p.neighborhood) context += `   Neighborhood: ${p.neighborhood}\n`;
      context += `   Bedrooms: ${property.bedrooms}, Bathrooms: ${property.bathrooms}\n`;
      context += `   Monthly Price: CAD $${property.price || 'unavailable'}\n`;
      if (property.quarterlyPrice) context += `   Quarterly Price: CAD $${property.quarterlyPrice}/month\n`;
      if (property.annualPrice) context += `   Annual Price: CAD $${property.annualPrice}/month\n`;
      const description = localizeValue(p as Record<string, unknown>, 'description', language);
      if (description) context += `   Description: ${description.substring(0, 260)}\n`;
      context += `   URL: ${property.url}\n\n`;
    });

    return { context, properties, source: 'd1' };
  } catch (error) {
    console.error('Failed to fetch property context:', error);
    const properties = mockChatProperties(language);
    let context = 'LIVE PROPERTY DATA (internal fallback catalog because D1 binding is unavailable in this environment):\n\n';
    properties.forEach((p, i) => {
      context += `${i + 1}. ID: ${p.id} — ${p.title}\n`;
      context += `   Address: ${p.location}\n`;
      context += `   Bedrooms: ${p.bedrooms}, Bathrooms: ${p.bathrooms}\n`;
      context += `   Monthly Price: CAD $${p.price || 'unavailable'}\n`;
      context += `   URL: ${p.url}\n\n`;
    });
    return { context, properties, source: 'internal-catalog' };
  }
}

// Direct web search (shared lib, no HTTP round-trip)
import { performWebSearch, searchExternalProperties, type ExternalProperty } from '@/lib/web-search';

async function callWebSearch(query: string): Promise<string> {
  try {
    return await performWebSearch(query, 3);
  } catch (error) {
    console.error('Web search error:', error);
    return 'Unable to fetch web search results at this time.';
  }
}

// Detect whether the user is specifically looking for property listings
// (so we should try to render external property cards, not just news).
function needsExternalPropertySearch(query: string): boolean {
  const q = query.toLowerCase();
  const propertyKeywords = [
    'rent', 'rental', 'lease', 'apartment', 'condo', 'house', 'studio',
    'bedroom', '1br', '2br', '3br', 'br ', 'unit', 'suite', 'listing',
    'find', 'looking for', 'show me', 'available', 'furnished', 'monthly',
    'budget', 'under', 'below',
    // Chinese
    '房源', '出租', '出售', '公寓', '单间', '两居', '三居', '套房', '帮我找', '查一下房', '找房子',
    '找房', '找一下', '找找', '有没有', '有什么', '租房', '租房子', '求租', '租',
    '多大', '附近', '旁边', '周围', '靠近', '预算', '以内', '以下', '价格', '多少钱',
    '月租', '一居', '二居', '卧室', '几房', '房租', '住', '离', '学校', '多大附近',
    // Site references
    'realtor.ca', 'realtor', 'mls',
  ];
  // Also: any URL in the message that points to a property site
  if (/https?:\/\/[^\s]*(realtor\.ca)/i.test(query)) return true;
  if (/找.*房|房.*预算|预算.*房|附近.*公寓|旁边.*(公寓|房)|(多大|大学|学校).*(公寓|房|租)/.test(query)) return true;
  return propertyKeywords.some(k => q.includes(k));
}

function getListingResultsResponse(
  language: string,
  internalCount: number,
  externalCount: number
): string {
  if (language === 'ZH') {
    if (externalCount > 0) {
      if (internalCount === 0) return `NEOS 当前没有符合预算的站内房源；下面是 realtor.ca 外部结果，最多 5 个，点击卡片查看详情。`;
      return `我先列 NEOS 站内房源，再补 realtor.ca 外部结果；最多 5 个，点击下方卡片查看链接。`;
    }
    if (internalCount > 0) {
      return `我先列 NEOS 站内房源；最多 5 个，点击下方卡片查看链接。`;
    }
    return '目前没有可展示的 NEOS 站内房源或 realtor.ca 外部结果。请调整预算或位置再试。';
  }
  if (language === 'FR') {
    if (externalCount > 0) {
      if (internalCount === 0) return "Aucun logement NEOS ne correspond au budget pour l'instant; voici les résultats realtor.ca, 5 maximum. Ouvrez les cartes ci-dessous pour les détails.";
      return 'Je liste d’abord les logements NEOS, puis les résultats realtor.ca; 5 résultats maximum. Ouvrez les cartes ci-dessous pour les liens.';
    }
    if (internalCount > 0) {
      return 'Je liste d’abord les logements NEOS; 5 résultats maximum. Ouvrez les cartes ci-dessous pour les liens.';
    }
    return "Aucun logement NEOS ni résultat realtor.ca à afficher pour l'instant. Essayez un autre budget ou emplacement.";
  }
  if (externalCount > 0) {
    if (internalCount === 0) return 'No NEOS listings currently match the budget; realtor.ca results are shown below, 5 maximum. Open the cards for details.';
    return 'NEOS listings are shown first, followed by realtor.ca results; 5 results maximum. Open the cards below for links.';
  }
  if (internalCount > 0) {
    return 'NEOS listings are shown first; 5 results maximum. Open the cards below for links.';
  }
  return 'No NEOS listings or realtor.ca results are available for that search yet. Try a different budget or location.';
}

// Simple IP-based rate limit for public chat (20 req/min)
const chatRateLimit = new Map<string, { count: number; resetAt: number }>();

function checkChatRateLimit(request: NextRequest): boolean {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip') || 'unknown';
  const now = Date.now();
  const existing = chatRateLimit.get(ip);

  if (!existing || existing.resetAt <= now) {
    chatRateLimit.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (existing.count >= 20) return false;
  existing.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    if (!validateCsrf(request)) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }

    // Check if it's a translation request by looking at the body
    // We need to read the body without consuming it
    const requestClone = request.clone();
    let isTranslationRequest = false;
    let translationText = '';
    let targetLang = '';
    
    try {
      const body = await requestClone.json();
      if (body.text && (body.targetLang === 'zh' || body.targetLang === 'fr')) {
        isTranslationRequest = true;
        translationText = body.text;
        targetLang = body.targetLang;
      }
    } catch {
      // Not a translation request
    }
    
    if (isTranslationRequest) {
      return await handleTranslation(request, translationText, targetLang as 'zh' | 'fr');
    }
    
    // Normal chat request - apply rate limiting
    
    // Normal chat request - apply rate limiting
    if (!checkChatRateLimit(request)) {
      return NextResponse.json(
        { error: 'Too many messages. Please wait a moment.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { message, sessionId: providedSessionId, history } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    // Generate or use provided session ID
    const sessionId = providedSessionId || generateSessionId();
    
    // Detect language from user message
    const language = detectLanguage(message);
    
    // Get AI model
    const model = getAIModel();
    
    // Check if we need weather or web search
    let webSearchResults = '';
    let usedWebSearch = false;
    
    let externalProperties: ExternalProperty[] = [];
    const isPropertyListingRequest = needsExternalPropertySearch(message);
    const externalPropertySearchEnabled = process.env.ENABLE_EXTERNAL_PROPERTY_SEARCH === 'true';

    if (needsWeather(message)) {
      usedWebSearch = true;
      webSearchResults = await getWeather(message);
    } else if (needsWebSearch(message) && (!isPropertyListingRequest || externalPropertySearchEnabled)) {
      usedWebSearch = true;
      // If the user is specifically asking for listings, fetch both the
      // text summary (for the AI) and structured cards (for the UI) in parallel.
      if (isPropertyListingRequest && externalPropertySearchEnabled) {
        const [textResults, cards] = await Promise.allSettled([
          callWebSearch(`realtor.ca ${message}`),
          searchExternalProperties(message, 5),
        ]);
        webSearchResults = textResults.status === 'fulfilled' ? textResults.value : '';
        externalProperties = cards.status === 'fulfilled' ? cards.value : [];
      } else {
        webSearchResults = await callWebSearch(message);
      }
    }
    
    // Fetch live property data from database
    const propertyData = await getPropertyContext(language);
    const budget = getQueryBudget(message);
    const recommendedProperties = isPropertyListingRequest
      ? pickRecommendedProperties(propertyData.properties, message, 5)
      : [];

    if (isPropertyListingRequest) {
      const externalLimit = Math.max(0, 5 - recommendedProperties.length);
      externalProperties = filterExternalPropertiesForQuery(externalProperties, message, budget, externalLimit);
      const totalCards = recommendedProperties.length + externalProperties.length;
      if (budget && totalCards < 3) {
        return NextResponse.json({
          text: getNoBudgetMatchResponse(language, budget, findClosestInternalProperty(propertyData.properties, message)),
          sessionId,
          source: 'budget-guardrail',
          language,
          usedWebSearch,
          webSearchQuery: usedWebSearch ? message : undefined,
          propertySource: propertyData.source,
        }, {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
          }
        });
      }
      return NextResponse.json({
        text: getListingResultsResponse(language, recommendedProperties.length, externalProperties.length),
        sessionId,
        source: 'listing-results',
        language,
        usedWebSearch,
        webSearchQuery: usedWebSearch ? message : undefined,
        properties: recommendedProperties.length > 0 ? recommendedProperties : undefined,
        recommendations: recommendedProperties.length > 0 ? recommendedProperties : undefined,
        propertySource: propertyData.source,
        externalProperties: externalProperties.length > 0 ? externalProperties : undefined,
      }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        }
      });
    }

    // Prepare messages for AI
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: 'system' as const,
        content: `${SYSTEM_PROMPT}\n\n${propertyData.context}\n\nMATCHING_INTERNAL_PROPERTY_CARDS:\n${JSON.stringify(recommendedProperties)}`
      }
    ];
    
    // Add real-time data if available (weather, search results)
    if (webSearchResults) {
      messages.push({
        role: 'system' as const,
        content: `REAL-TIME DATA (use this directly in your answer, do NOT say "querying" or "checking"):\n\n${webSearchResults}`
      });
    } else if (isPropertyListingRequest && !externalPropertySearchEnabled) {
      messages.push({
        role: 'system' as const,
        content: 'EXTERNAL PROPERTY RESULTS: Not enabled. Do not mention realtor.ca or other external listing details. Recommend only LIVE PROPERTY DATA above.'
      });
    }
    
    // Add conversation history (last 10 messages for context)
    if (Array.isArray(history) && history.length > 0) {
      const recentHistory = history.slice(-10);
      for (const msg of recentHistory) {
        if (msg.sender === 'user' && msg.text) {
          messages.push({ role: 'user' as const, content: msg.text });
        } else if (msg.sender === 'bot' && msg.text && msg.id !== 'welcome') {
          messages.push({ role: 'assistant' as const, content: msg.text });
        }
      }
    }

    // Add current user message
    messages.push({
      role: 'user' as const,
      content: message.trim()
    });

    // Call Cloudflare Workers AI
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      // Access Cloudflare Workers AI binding
      const ai = getAI();
      const aiResponse = await ai.run(model, {
        messages,
        max_tokens: 512,
        temperature: 0.2,
      });
      
      clearTimeout(timeoutId);
      
      if (aiResponse && aiResponse.response) {
        return NextResponse.json({
          text: aiResponse.response,
          sessionId,
          source: 'cloudflare-ai',
          language,
          usedWebSearch,
          webSearchQuery: usedWebSearch ? message : undefined,
          properties: recommendedProperties.length > 0 ? recommendedProperties : undefined,
          recommendations: recommendedProperties.length > 0 ? recommendedProperties : undefined,
          propertySource: propertyData.source,
          externalProperties: externalProperties.length > 0 ? externalProperties : undefined,
        }, {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
          }
        });
      } else {
        throw new Error('Invalid AI response format');
      }
      
    } catch (aiError) {
      console.error('Cloudflare AI error:', aiError);
      
      // Use language-specific fallback response
      return NextResponse.json({
        text: isPropertyListingRequest
          ? getPropertyFallbackResponse(language, recommendedProperties)
          : getFallbackResponse(language),
        sessionId,
        source: 'fallback-ai-error',
        language,
        usedWebSearch,
        webSearchQuery: usedWebSearch ? message : undefined,
        properties: recommendedProperties.length > 0 ? recommendedProperties : undefined,
        recommendations: recommendedProperties.length > 0 ? recommendedProperties : undefined,
        propertySource: propertyData.source,
        externalProperties: externalProperties.length > 0 ? externalProperties : undefined,
      }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        }
      });
    }

  } catch (error) {
    console.error('Error in chat API:', error);
    
    // Generate session ID even on error
    const sessionId = generateSessionId();
    const language = 'EN'; // Default to English on general errors
    
    return NextResponse.json({
      text: getFallbackResponse(language),
      sessionId,
      source: 'error-fallback',
      language,
      usedWebSearch: false
    }, {
      status: 500,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    });
  }
}

// Optional: Add a GET endpoint for health check
export async function GET() {
  const model = getAIModel();
  
  return NextResponse.json({
    status: 'ok',
    ai: {
      model,
      provider: 'cloudflare-workers-ai',
      binding: 'env.AI'
    },
    fallback: {
      enabled: true,
      languages: Object.keys(FALLBACK_RESPONSES).length,
      system_prompt_length: SYSTEM_PROMPT.length
    }
  });
}



async function handleTranslation(_request: NextRequest, text: string, targetLang: 'zh' | 'fr') {
  const targetLanguage = targetLang === 'zh' ? 'Simplified Chinese' : 'French';
  
  const prompt = `You are a professional real estate market analyst and translator. Translate the following real estate market report from English to ${targetLanguage}.

IMPORTANT INSTRUCTIONS:
1. Preserve all formatting, markdown, and structure
2. Keep numbers, dates, percentages, and statistics exactly as-is
3. Translate real estate terminology accurately and consistently
4. Maintain a professional, analytical tone
5. Do not add or remove any information
6. If there are section headers (like ###, ##, #), keep them in markdown format

Original English text:
${text}

Translated ${targetLanguage} text:`;
  
  try {
    const ai = getAI();
    const model = getAIModel();
    
    if (!ai) {
      throw new Error('AI binding not available');
    }
    
    const result = await ai.run(model, {
      messages: [
        { role: 'system', content: 'You are a professional translator specializing in real estate market reports.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: Math.min(4000, text.length * 2),
      temperature: 0.1,
    });
    
    return NextResponse.json({
      translatedText: result.response.trim(),
      originalLength: text.length,
      translatedLength: result.response.length,
      targetLang,
      model
    }, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
    });
    
  } catch (error) {
    console.error('Translation error:', error);
    
    // Fallback to simple term translation
    const simpleTranslated = simpleTermTranslation(text, targetLang);
    
    return NextResponse.json({
      translatedText: simpleTranslated,
      originalLength: text.length,
      translatedLength: simpleTranslated.length,
      targetLang,
      model: 'fallback',
      note: 'Used simple term translation due to AI error'
    }, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
    });
  }
}

function simpleTermTranslation(text: string, targetLang: 'zh' | 'fr'): string {
  // Simple term replacements for real estate
  const terms = {
    zh: {
      'home sales': '住房销售',
      'new listings': '新挂牌',
      'average selling price': '平均售价',
      'year-over-year': '同比',
      'month-over-month': '环比',
      'Greater Toronto Area': '大多伦多地区',
      'GTA': 'GTA',
      'condominium': '公寓',
      'condo': '公寓',
      'detached': '独立屋',
      'townhouse': '联排别墅',
      'rental': '租赁',
      'market report': '市场报告',
      'real estate': '房地产',
      'occupancy': '入住率',
    },
    fr: {
      'home sales': 'ventes de maisons',
      'new listings': 'nouvelles inscriptions',
      'average selling price': 'prix de vente moyen',
      'year-over-year': 'en glissement annuel',
      'month-over-month': 'en glissement mensuel',
      'Greater Toronto Area': 'Région du Grand Toronto',
      'GTA': 'RGT',
      'condominium': 'condominium',
      'condo': 'condo',
      'detached': 'indépendante',
      'townhouse': 'maison en rangée',
      'rental': 'location',
      'market report': 'rapport de marché',
      'real estate': 'immobilier',
      'occupancy': 'taux d\'occupation',
    }
  };
  
  const langTerms = terms[targetLang];
  let translated = text;
  
  for (const [en, translation] of Object.entries(langTerms)) {
    const regex = new RegExp(en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    translated = translated.replace(regex, translation);
  }
  
  return translated;
}
