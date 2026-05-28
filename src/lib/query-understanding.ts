export interface QuerySlots {
  intent: 'property_listing' | 'weather' | 'general' | 'web_search';
  budget?: number;
  bedrooms?: number;
  bathrooms?: number;
  location?: string;
  nearLandmark?: string;
  requireGta: boolean;
  language: 'EN' | 'ZH' | 'FR';
  wantsExternal: boolean;
  petFriendly?: boolean;
  furnished?: boolean;
  minStayMonths?: number;
}

type GeminiEnv = {
  GEMINI_API_KEY?: string;
};

const GEMINI_MODEL = 'gemini-2.5-flash-lite';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

let warnedMissingGeminiKey = false;

function detectFallbackLanguage(text: string): QuerySlots['language'] {
  if (/[\u4e00-\u9fff]/.test(text)) return 'ZH';
  if (/\b(bonjour|salut|merci|météo|français|logement|appartement|loyer)\b/i.test(text)) return 'FR';
  return 'EN';
}

export function fallbackGetQueryBudget(query: string): number | undefined {
  const matches = [...query.matchAll(/\$?\s*([1-9][0-9,]{3,5})\s*(?:cad|\/?mo|monthly|per month|月|以内|以下|under|below|budget|预算)?/gi)];
  const values = matches
    .map((match) => Number(match[1].replace(/,/g, '')))
    .filter((value) => Number.isFinite(value) && value >= 1000 && value <= 50000);
  return values.length ? Math.max(...values) : undefined;
}

export function fallbackGetQueryBedrooms(query: string): number | undefined {
  const normalized = query.toLowerCase();
  const match = normalized.match(/\b([1-5])\s*(?:br|bed|bedroom|bedrooms)\b/);
  if (match) return Number(match[1]);
  if (/(?:一|1)\s*(?:居|室|卧|房|间)(?:室)?/.test(query)) return 1;
  if (/(?:两|二|2)\s*(?:居|室|卧|房|间)(?:室)?/.test(query)) return 2;
  if (/(?:三|3)\s*(?:居|室|卧|房|间)(?:室)?/.test(query)) return 3;
  if (/(?:四|4)\s*(?:居|室|卧|房|间)(?:室)?/.test(query)) return 4;
  if (/(?:五|5)\s*(?:居|室|卧|房|间)(?:室)?/.test(query)) return 5;
  return undefined;
}

export function fallbackNeedsWeather(query: string): boolean {
  const q = query.toLowerCase();
  const keywords = ['weather', 'temperature', 'forecast', '天气', '气温', '温度', '预报', 'météo', 'température'];
  return keywords.some(k => q.includes(k));
}

export function fallbackIsGtaSearchIntent(query: string): boolean {
  return /多大|uoft|u\s*of\s*t|university\s+of\s+toronto|toronto|gta|多伦多|市中心|downtown|安省|ontario|tmu|toronto metropolitan|ryerson|medical|hospital|rotation/i.test(query);
}

export function fallbackNeedsExternalPropertySearch(query: string): boolean {
  const q = query.toLowerCase();
  const propertyKeywords = [
    'rent', 'rental', 'lease', 'apartment', 'condo', 'house', 'studio',
    'bedroom', '1br', '2br', '3br', 'br ', 'unit', 'suite', 'listing',
    'find', 'looking for', 'show me', 'available', 'furnished', 'monthly',
    'budget', 'under', 'below',
    '房源', '出租', '出售', '公寓', '单间', '两居', '二居', '三居', '套房', '帮我找', '查一下房', '找房子',
    '找房', '找一下', '找找', '有没有', '有什么', '租房', '租房子', '求租', '短租', '长租', '租',
    '多大', '附近', '旁边', '周围', '靠近', '预算', '以内', '以下', '价格', '多少钱',
    '月租', '一居', '卧室', '几房', '房租', '住', '离', '学校', '多大附近',
    'realtor.ca', 'realtor', 'mls',
  ];
  if (/https?:\/\/[^\s]*(realtor\.ca)/i.test(query)) return true;
  if (/找.*房|房.*预算|预算.*房|附近.*公寓|旁边.*(公寓|房)|(多大|大学|学校).*(公寓|房|租)/.test(query)) return true;
  return propertyKeywords.some(k => q.includes(k));
}

function fallbackBathrooms(query: string): number | undefined {
  const match = query.toLowerCase().match(/\b([1-5])\s*(?:bath|bathroom|bathrooms|ba)\b/);
  if (match) return Number(match[1]);
  if (/(?:一|1)\s*(?:卫|洗手间|浴室)/.test(query)) return 1;
  if (/(?:两|二|2)\s*(?:卫|洗手间|浴室)/.test(query)) return 2;
  if (/(?:三|3)\s*(?:卫|洗手间|浴室)/.test(query)) return 3;
  return undefined;
}

function fallbackMinStayMonths(query: string): number | undefined {
  const numeric = query.match(/\b([1-9]|1[0-2])\s*(?:month|months|mo)\b/i)
    || query.match(/([1-9]|1[0-2])\s*(?:个月|月)/);
  if (numeric) return Number(numeric[1]);
  if (/三个月|三月/.test(query)) return 3;
  if (/两个月|二个月|两月|二月/.test(query)) return 2;
  if (/一个月|一月/.test(query)) return 1;
  return undefined;
}

function fallbackLocation(query: string): string | undefined {
  if (/\b(tmu|toronto metropolitan|ryerson)\b/i.test(query)) return 'TMU';
  if (/\b(uoft|u\s*of\s*t|university\s+of\s+toronto)\b/i.test(query) || /多大/.test(query)) return 'University of Toronto';
  if (/\bdowntown\b/i.test(query) || /市中心/.test(query)) return 'downtown Toronto';
  const nearMatch = query.match(/(?:near|around|close to|附近|旁边|靠近)\s*([A-Za-z][A-Za-z0-9 &.-]{1,50})/i);
  return nearMatch?.[1]?.trim();
}

function fallbackNearLandmark(query: string): string | undefined {
  if (/\b(tmu|toronto metropolitan|ryerson)\b/i.test(query)) return 'TMU';
  if (/\b(uoft|u\s*of\s*t|university\s+of\s+toronto)\b/i.test(query) || /多大/.test(query)) return 'University of Toronto';
  if (/medical|hospital|rotation|医院|医疗/i.test(query)) return 'medical rotation';
  return undefined;
}

function fallbackIntent(query: string): QuerySlots['intent'] {
  if (fallbackNeedsWeather(query)) return 'weather';
  if (fallbackNeedsExternalPropertySearch(query)) return 'property_listing';
  if (/\b(search|look up|latest|recent|current|news)\b|搜索|查一下|最新|最近/i.test(query)) return 'web_search';
  return 'general';
}

export function fallbackUnderstandQuery(message: string): QuerySlots {
  const intent = fallbackIntent(message);
  const wantsExternal = /realtor|realtor\.ca|mls|外部|外面|external/i.test(message);
  return {
    intent,
    budget: fallbackGetQueryBudget(message),
    bedrooms: fallbackGetQueryBedrooms(message),
    bathrooms: fallbackBathrooms(message),
    location: fallbackLocation(message),
    nearLandmark: fallbackNearLandmark(message),
    requireGta: fallbackIsGtaSearchIntent(message) || intent === 'property_listing',
    language: detectFallbackLanguage(message),
    wantsExternal,
    petFriendly: /pet|dog|cat|宠物|猫|狗/i.test(message) ? true : undefined,
    furnished: /furnished|家具|带家具|meublé/i.test(message) ? true : undefined,
    minStayMonths: fallbackMinStayMonths(message),
  };
}

function getCloudflareContext(): { env?: GeminiEnv } | undefined {
  const symbol = Symbol.for('__cloudflare-context__');
  return (globalThis as unknown as Record<symbol, { env?: GeminiEnv } | undefined>)[symbol];
}

function getGeminiApiKey(env: GeminiEnv): string | undefined {
  const cfContext = getCloudflareContext();
  const globalEnv = globalThis as unknown as GeminiEnv;
  const processEnv = typeof process !== 'undefined' ? process.env : {} as NodeJS.ProcessEnv;
  return env.GEMINI_API_KEY || cfContext?.env?.GEMINI_API_KEY || globalEnv.GEMINI_API_KEY || processEnv.GEMINI_API_KEY;
}

function normalizeSlots(value: unknown, message: string): QuerySlots {
  const fallback = fallbackUnderstandQuery(message);
  if (!value || typeof value !== 'object') return fallback;
  const input = value as Partial<QuerySlots>;
  const intent = input.intent && ['property_listing', 'weather', 'general', 'web_search'].includes(input.intent)
    ? input.intent
    : fallback.intent;
  const language = input.language && ['EN', 'ZH', 'FR'].includes(input.language)
    ? input.language
    : fallback.language;

  return {
    intent,
    budget: typeof input.budget === 'number' && Number.isFinite(input.budget) ? input.budget : fallback.budget,
    bedrooms: typeof input.bedrooms === 'number' && Number.isFinite(input.bedrooms) ? input.bedrooms : fallback.bedrooms,
    bathrooms: typeof input.bathrooms === 'number' && Number.isFinite(input.bathrooms) ? input.bathrooms : fallback.bathrooms,
    location: typeof input.location === 'string' && input.location.trim() ? input.location.trim() : fallback.location,
    nearLandmark: typeof input.nearLandmark === 'string' && input.nearLandmark.trim() ? input.nearLandmark.trim() : fallback.nearLandmark,
    requireGta: typeof input.requireGta === 'boolean' ? input.requireGta : fallback.requireGta,
    language,
    wantsExternal: typeof input.wantsExternal === 'boolean' ? input.wantsExternal : fallback.wantsExternal,
    petFriendly: typeof input.petFriendly === 'boolean' ? input.petFriendly : fallback.petFriendly,
    furnished: typeof input.furnished === 'boolean' ? input.furnished : fallback.furnished,
    minStayMonths: typeof input.minStayMonths === 'number' && Number.isFinite(input.minStayMonths) ? input.minStayMonths : fallback.minStayMonths,
  };
}

function parseGeminiJson(text: string): unknown {
  const trimmed = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  return JSON.parse(trimmed);
}

export async function understandQuery(message: string, env: GeminiEnv = {}): Promise<QuerySlots> {
  const apiKey = getGeminiApiKey(env);
  if (!apiKey) {
    if (!warnedMissingGeminiKey) {
      console.warn('GEMINI_API_KEY is not set; falling back to regex query understanding.');
      warnedMissingGeminiKey = true;
    }
    return fallbackUnderstandQuery(message);
  }

  try {
    const response = await fetch(`${GEMINI_URL}?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(1500),
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{
            text: `Extract search/query slots from this StayNeos chat message. Return only JSON. Message: ${JSON.stringify(message)}`,
          }],
        }],
        systemInstruction: {
          parts: [{
            text: `You extract structured slots for a furnished apartment concierge in Toronto/GTA.
Return one JSON object only. No markdown.
Rules:
- budget is monthly CAD rent, numeric only.
- bedrooms is the minimum bedroom count. Chinese "2房", "两居", "三居" mean 2 and 3 bedrooms.
- requireGta is true when the query mentions Toronto, GTA, downtown, TMU, UofT, hospitals/medical rotations in this context, or asks for housing without another city.
- location is the raw user place such as "TMU", "downtown", "Yonge & Bloor"; nearLandmark is a school/hospital/landmark keyword.
- wantsExternal is true only if the user asks for external marketplaces such as realtor.ca/MLS or wants non-NEOS results.
- Use intent "property_listing" for rental/listing searches, "weather" for weather, "web_search" for current web lookups, otherwise "general".
- language is EN, ZH, or FR.`,
          }],
        },
        generationConfig: {
          temperature: 0,
          maxOutputTokens: 256,
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'object',
            properties: {
              intent: { type: 'string', enum: ['property_listing', 'weather', 'general', 'web_search'] },
              budget: { type: 'number' },
              bedrooms: { type: 'number' },
              bathrooms: { type: 'number' },
              location: { type: 'string' },
              nearLandmark: { type: 'string' },
              requireGta: { type: 'boolean' },
              language: { type: 'string', enum: ['EN', 'ZH', 'FR'] },
              wantsExternal: { type: 'boolean' },
              petFriendly: { type: 'boolean' },
              furnished: { type: 'boolean' },
              minStayMonths: { type: 'number' },
            },
            required: ['intent', 'requireGta', 'language', 'wantsExternal'],
          },
        },
      }),
    });

    if (!response.ok) throw new Error(`Gemini query understanding failed: ${response.status}`);
    const data = await response.json() as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Gemini query understanding returned no JSON text.');
    return normalizeSlots(parseGeminiJson(text), message);
  } catch (error) {
    console.warn('Query understanding failed; falling back to regex.', error);
    return fallbackUnderstandQuery(message);
  }
}
