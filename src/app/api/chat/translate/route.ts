import { NextRequest, NextResponse } from 'next/server';
import { validateCsrf } from '@/lib/security/csrf';

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
function getAI(): CloudflareEnv['AI'] | null {
  const context = getCloudflareContext();
  if (!context || !context.env || !context.env.AI) {
    return null;
  }
  return context.env.AI;
}

// Get AI model from environment or default
function getAIModel(): string {
  const context = getCloudflareContext();
  if (context?.env?.AI_MODEL) {
    return context.env.AI_MODEL;
  }
  // Default model used by Aria
  return '@cf/meta/llama-3.1-8b-instruct';
}

export async function POST(request: NextRequest) {
  try {
    if (!validateCsrf(request)) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }

    const body = await request.json();
    const { text, targetLang } = body;
    
    if (!text || !targetLang || (targetLang !== 'zh' && targetLang !== 'fr')) {
      return NextResponse.json(
        { error: 'Missing text or invalid targetLang (must be zh or fr)' },
        { status: 400 }
      );
    }
    
    return await handleTranslation(request, text, targetLang as 'zh' | 'fr');
  } catch (error) {
    console.error('Translation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
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
