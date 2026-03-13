import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin-api';

type AiAssistType = 'parse' | 'translate' | 'seo';

// Get Cloudflare AI binding
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getAI(): any {
  const symbol = Symbol.for("__cloudflare-context__");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const context = (globalThis as any)[symbol];
  if (context?.env?.AI) return context.env.AI;
  throw new Error("Workers AI binding 'AI' not found");
}

function getSystemPrompt(type: AiAssistType): string {
  if (type === 'parse') {
    return [
      'You are a Toronto luxury rental property data extraction assistant.',
      'Extract structured fields from the listing text the user provides.',
      'Return a valid JSON object with only the fields you can confidently extract.',
      'Use English for title and description. If Chinese or French text is provided, include titleZh/descriptionZh/titleFr/descriptionFr.',
      'amenities, nearbyLandmarks, idealFor must be string arrays.',
      'Times use 24h format HH:MM.',
      'propertyType must be one of: APARTMENT, CONDO, TOWNHOUSE, HOUSE, LOFT, STUDIO, PENTHOUSE.',
      'Fields: title, titleZh, titleFr, address, neighborhood, city, latitude(number), longitude(number), propertyType, bedrooms(number), bathrooms(number), sqft(number), floor(number), facing, balconySqft(number), buildingYear(number), developer, description, descriptionZh, descriptionFr, priceMonthly(number), priceQuarterly(number), priceAnnual(number), currency, includedAmenities(array), buildingAmenities(array), nearestSubway, subwayWalkMinutes(number), nearbyLandmarks(array), minStayDays(number), checkInTime, checkOutTime, selfCheckIn(boolean), images(array), heroImage, idealFor(array), metaTitle, metaDescription.',
      'Return ONLY valid JSON, no markdown, no explanation.',
    ].join(' ');
  }

  if (type === 'translate') {
    return [
      'You are a property listing translation assistant.',
      'Generate English, Chinese, and French versions of the property description.',
      'Be natural, professional, not overly promotional.',
      'If a title is provided, also translate it.',
      'Return ONLY valid JSON with fields: title, titleZh, titleFr, description, descriptionZh, descriptionFr.',
      'No markdown, no explanation.',
    ].join(' ');
  }

  return [
    'You are a property SEO assistant.',
    'Generate metaTitle (under 60 chars) and metaDescription (under 160 chars) for a property detail page.',
    'Do not use quotes, do not keyword-stuff.',
    'Return ONLY valid JSON with fields: metaTitle, metaDescription.',
    'No markdown, no explanation.',
  ].join(' ');
}

export async function POST(request: Request) {
  try {
    await requireAdmin(request);

    const { prompt, type } = (await request.json()) as { prompt?: string; type?: AiAssistType };
    if (!prompt || !type || !['parse', 'translate', 'seo'].includes(type)) {
      return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
    }

    let ai;
    try {
      ai = getAI();
    } catch {
      return NextResponse.json({ error: 'Workers AI 未绑定，请检查 wrangler.toml 配置' }, { status: 500 });
    }

    // Use Llama 3.1 8B Instruct (free on Workers AI, good for structured extraction)
    const result = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        { role: 'system', content: getSystemPrompt(type) },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 2048,
    });

    const responseText = result?.response || '';
    if (!responseText) {
      return NextResponse.json({ error: 'AI 返回为空' }, { status: 500 });
    }

    // Try to extract JSON from the response (LLM might wrap it in markdown)
    let parsed;
    try {
      // Try direct parse first
      parsed = JSON.parse(responseText);
    } catch {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/) || responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        parsed = JSON.parse(jsonStr);
      } else {
        return NextResponse.json({ error: 'AI 返回格式无法解析', raw: responseText }, { status: 500 });
      }
    }

    return NextResponse.json({ data: parsed });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('AI assist error:', error);
    return NextResponse.json({ error: 'AI 助手调用失败' }, { status: 500 });
  }
}
