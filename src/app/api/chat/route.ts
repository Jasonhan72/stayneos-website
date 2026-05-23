import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/d1';

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

## Current Properties (Toronto)
1. **55 Cooper St (Sugar Wharf)** - Premium 3BR Sky Suite
   - Price: $12,000/mo (monthly), $10,800/mo (quarterly), $9,600/mo (annual)
   - Features: Lake views, 55+ floor, near Union Station (8 min walk)
   - Best for: Executives, families, luxury seekers

2. **238 Simcoe St (Artist Alley)** - Executive 3BR Suite  
   - Price: $6,500/mo (monthly), $5,850/mo (quarterly), $5,200/mo (annual)
   - Features: Near hospitals (Toronto General, Mt. Sinai, SickKids), universities
   - Best for: Medical professionals, visiting scholars, insurance housing

3. **22 Wellesley St E** - Modern 1BR City View
   - Price: $3,500/mo (monthly), $3,150/mo (quarterly), $2,800/mo (annual)
   - Features: Midtown, near Wellesley subway, modern finishes
   - Best for: Solo professionals, students, budget-conscious stays

## Special Services
- **Corporate Housing**: Custom solutions for project teams, relocations
- **Medical Stays**: Proximity to major hospitals, insurance coordination
- **Academic Housing**: Near UofT, OCAD, Ryerson campuses
- **Long-term**: 3+ month stays with discounted rates

## Web Search Capability
If you need current Toronto rental market data, local news, or competitor pricing, you can query external websites through our web search API.
Use this for: Toronto rental trends, local events affecting housing, competitor pricing comparisons.
Don't use for: personal information, sensitive data, or non-housing topics.

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
- If you have real-time data (weather, search results), use it directly in your answer. Don't say "querying..." or "checking..." — you already have the data.
- For city-specific questions you can answer from general knowledge (transit routes, popular neighborhoods, hospital locations), answer directly without saying you need to search.
- **Pay attention to the city the user is asking about.** If they ask about a city other than Toronto (e.g. Seattle, Vancouver, New York), acknowledge that city in your response. Don't recommend Toronto-specific properties unless they ask about Toronto.
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
    'zolo', 'housesigma', 'condos.ca', 'realtor.ca',
    // Local info
    'restaurant', 'food', 'eat', 'bar', 'nightlife', 'event', 'festival',
    'transit', 'ttc', 'subway', 'bus', 'airport', 'commute',
    'school', 'university', 'hospital', 'clinic', 'gym', 'park',
    'neighborhood', 'neighbourhood', 'area', 'district',
    // Chinese keywords
    '餐厅', '美食', '交通', '地铁', '学校', '医院', '公园',
    '房价', '房源', '租金', '挂牌', '小区', '社区', '公寓',
    '房产', '楼盘', '二手房', '新房', '出租', '求租',
    // Direct URL or search intent
    'search', 'find', 'look up', 'check', 'latest', 'recent', 'current',
    '搜索', '查找', '查一下', '帮我查', '最新', '最近',
  ];

  // Also trigger on URLs in the message
  if (/https?:\/\//.test(query)) return true;
  
  return searchKeywords.some(keyword => lowerQuery.includes(keyword));
}

// Fetch live property data from D1
async function getPropertyContext(): Promise<string> {
  try {
    const db = getDb();
    const result = await db
      .prepare("SELECT id, title, slug, address, city, neighborhood, priceMonthly, bedrooms, bathrooms, description, status FROM Property WHERE status = 'PUBLISHED' ORDER BY priceMonthly DESC")
      .all();

    if (!result.results || result.results.length === 0) {
      return '(No properties currently available in the database)';
    }

    let context = 'LIVE PROPERTY DATA (from database):\n\n';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (result.results as any[]).forEach((p: any, i: number) => {
      context += `${i + 1}. ID: ${p.id} — ${p.title}\n`;
      context += `   Address: ${p.address}, ${p.city}\n`;
      if (p.neighborhood) context += `   Neighborhood: ${p.neighborhood}\n`;
      context += `   Bedrooms: ${p.bedrooms}, Bathrooms: ${p.bathrooms}\n`;
      context += `   Monthly Price: $${p.priceMonthly}\n`;
      if (p.description) context += `   Description: ${String(p.description).substring(0, 200)}\n`;
      context += `   Status: ${p.status}\n\n`;
    });

    return context;
  } catch (error) {
    console.error('Failed to fetch property context:', error);
    return '(Property database temporarily unavailable — use the hardcoded property info in your system prompt)';
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
    'find', 'looking for', 'show me', 'available',
    // Chinese
    '房源', '出租', '出售', '公寓', '单间', '两居', '三居', '套房', '帮我找', '查一下房', '找房子',
    // Site references
    'condos.ca', 'zolo', 'rentals.ca', 'rentfaster', 'padmapper', 'realtor.ca', 'liv.rent', 'kijiji', 'housesigma',
  ];
  // Also: any URL in the message that points to a property site
  if (/https?:\/\/[^\s]*(condos\.ca|zolo\.ca|rentals\.ca|rentfaster\.ca|padmapper\.com|liv\.rent|realtor\.ca|kijiji\.ca|housesigma\.com|zumper\.com)/i.test(query)) return true;
  return propertyKeywords.some(k => q.includes(k));
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

    if (needsWeather(message)) {
      usedWebSearch = true;
      webSearchResults = await getWeather(message);
    } else if (needsWebSearch(message)) {
      usedWebSearch = true;
      // If the user is specifically asking for listings, fetch both the
      // text summary (for the AI) and structured cards (for the UI) in parallel.
      if (needsExternalPropertySearch(message)) {
        const [textResults, cards] = await Promise.allSettled([
          callWebSearch(message),
          searchExternalProperties(message, 3),
        ]);
        webSearchResults = textResults.status === 'fulfilled' ? textResults.value : '';
        externalProperties = cards.status === 'fulfilled' ? cards.value : [];
      } else {
        webSearchResults = await callWebSearch(message);
      }
    }
    
    // Fetch live property data from database
    const propertyContext = await getPropertyContext();

    // Prepare messages for AI
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: 'system' as const,
        content: SYSTEM_PROMPT + '\n\n' + propertyContext
      }
    ];
    
    // Add real-time data if available (weather, search results)
    if (webSearchResults) {
      messages.push({
        role: 'system' as const,
        content: `REAL-TIME DATA (use this directly in your answer, do NOT say "querying" or "checking"):\n\n${webSearchResults}`
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
        temperature: 0.7,
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
        text: getFallbackResponse(language),
        sessionId,
        source: 'fallback-ai-error',
        language,
        usedWebSearch,
        webSearchQuery: usedWebSearch ? message : undefined,
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