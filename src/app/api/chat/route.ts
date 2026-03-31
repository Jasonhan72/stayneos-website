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
const SYSTEM_PROMPT = `You are Aria, the Customer Care Lead at NEOS (StayNeos Executive Apartments).

## About NEOS Website
- Website: neos.rentals (also stayneos.com redirects to neos.rentals)
- Features: Browse properties, AI Concierge for recommendations, For Business form for corporate housing
- Languages: English, Chinese, French
- Contact: hello@neos.rentals, +1 (647) 862-6518

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
- Use web search API when you need current market data or competitor information
- Escalate complex issues to hello@neos.rentals
- Be professional, warm, concise (2-3 sentences max)

If you don't know something, suggest contacting hello@neos.rentals or visiting the relevant page on our website.

Respond in the same language the user writes in.`;

// Improved fallback responses by language
const FALLBACK_RESPONSES = {
  EN: "Hi! I'm Aria, NEOS Customer Care. For booking inquiries, visit our properties page or use the AI concierge. For urgent help, email us at hello@neos.rentals.",
  ZH: "您好！我是 Aria，NEOS 客服。预订咨询请访问房源页面或使用 AI 租赁顾问。紧急帮助请发送邮件至 hello@neos.rentals。",
  FR: "Bonjour ! Je suis Aria, service client NEOS. Pour les demandes de réservation, visitez notre page de propriétés ou utilisez le concierge IA. Pour une aide urgente, écrivez-nous à hello@neos.rentals.",
  DEFAULT: "Hi! I'm Aria, NEOS Customer Care. For booking inquiries, visit our properties page or use the AI concierge. For urgent help, email us at hello@neos.rentals."
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

// Check if a query needs external web search
function needsWebSearch(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  const searchKeywords = [
    'market', 'trend', 'competitor', 'compare', 'news', 'toronto rental',
    'rental market', 'housing market', 'price comparison', 'competition',
    'current rates', 'market rate', 'average rent', 'rental trend',
    'toronto news', 'housing news', 'real estate news', 'competitor pricing',
    'how much', 'what is the price', 'compare prices', 'market analysis',
    'rental data', 'market data', 'statistics', 'report', 'study'
  ];
  
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
import { performWebSearch } from '@/lib/web-search';

async function callWebSearch(query: string): Promise<string> {
  try {
    return await performWebSearch(query, 3);
  } catch (error) {
    console.error('Web search error:', error);
    return 'Unable to fetch web search results at this time.';
  }
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
    
    // Check if we need web search
    let webSearchResults = '';
    let usedWebSearch = false;
    
    if (needsWebSearch(message)) {
      usedWebSearch = true;
      webSearchResults = await callWebSearch(message);
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
    
    // Add web search results if available
    if (webSearchResults) {
      messages.push({
        role: 'system' as const,
        content: `Current web search results for context:\n${webSearchResults}\n\nUse this information to provide accurate, up-to-date answers about Toronto rental market trends, competitor pricing, and local news. Cite sources when appropriate.`
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
          webSearchQuery: usedWebSearch ? message : undefined
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
        webSearchQuery: usedWebSearch ? message : undefined
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
    }, { status: 500 });
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