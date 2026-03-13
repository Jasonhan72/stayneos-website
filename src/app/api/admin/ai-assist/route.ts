import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin-api';

type AiAssistType = 'parse' | 'translate' | 'seo';

const parseSchema = {
  name: 'property_parse',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      title: { type: 'string' },
      titleZh: { type: 'string' },
      titleFr: { type: 'string' },
      address: { type: 'string' },
      neighborhood: { type: 'string' },
      city: { type: 'string' },
      latitude: { type: 'number' },
      longitude: { type: 'number' },
      propertyType: { type: 'string' },
      bedrooms: { type: 'number' },
      bathrooms: { type: 'number' },
      sqft: { type: 'number' },
      floor: { type: 'number' },
      facing: { type: 'string' },
      balconySqft: { type: 'number' },
      buildingYear: { type: 'number' },
      developer: { type: 'string' },
      description: { type: 'string' },
      descriptionZh: { type: 'string' },
      descriptionFr: { type: 'string' },
      priceMonthly: { type: 'number' },
      priceQuarterly: { type: 'number' },
      priceAnnual: { type: 'number' },
      currency: { type: 'string' },
      includedAmenities: { type: 'array', items: { type: 'string' } },
      buildingAmenities: { type: 'array', items: { type: 'string' } },
      nearestSubway: { type: 'string' },
      subwayWalkMinutes: { type: 'number' },
      nearbyLandmarks: { type: 'array', items: { type: 'string' } },
      minStayDays: { type: 'number' },
      checkInTime: { type: 'string' },
      checkOutTime: { type: 'string' },
      selfCheckIn: { type: 'boolean' },
      images: { type: 'array', items: { type: 'string' } },
      heroImage: { type: 'string' },
      idealFor: { type: 'array', items: { type: 'string' } },
      metaTitle: { type: 'string' },
      metaDescription: { type: 'string' },
    },
    required: [],
  },
} as const;

const translateSchema = {
  name: 'property_translate',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      title: { type: 'string' },
      titleZh: { type: 'string' },
      titleFr: { type: 'string' },
      description: { type: 'string' },
      descriptionZh: { type: 'string' },
      descriptionFr: { type: 'string' },
    },
    required: ['description', 'descriptionZh', 'descriptionFr'],
  },
} as const;

const seoSchema = {
  name: 'property_seo',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      metaTitle: { type: 'string' },
      metaDescription: { type: 'string' },
    },
    required: ['metaTitle', 'metaDescription'],
  },
} as const;

function getSystemPrompt(type: AiAssistType): string {
  if (type === 'parse') {
    return [
      '你是多伦多高端短租/中长租房源录入助手。',
      '请从用户粘贴的 listing 文案中提取结构化字段。',
      '只返回 schema 允许的字段，未知字段不要编造，直接省略。',
      '尽量输出英文 title 和英文 description；如果文案里已有中文或法文，也可以补充对应字段。',
      'amenities、nearbyLandmarks、idealFor 必须是字符串数组。',
      '时间用 24 小时制 HH:MM。',
      'propertyType 只能从 APARTMENT, CONDO, TOWNHOUSE, HOUSE, LOFT, STUDIO, PENTHOUSE 中选择最合理的一个。',
    ].join(' ');
  }

  if (type === 'translate') {
    return [
      '你是房源文案翻译助手。',
      '请基于用户提供的内容生成房源描述的英文、中文、法文三个版本，适合后台直接入库。',
      '内容要自然、专业、不过度营销。',
      '如果用户已给出标题，也可顺手输出 title、titleZh、titleFr。',
    ].join(' ');
  }

  return [
    '你是房源 SEO 助手。',
    '请生成适合房源详情页的 metaTitle 和 metaDescription。',
    'metaTitle 控制在 60 字符内，metaDescription 控制在 160 字符内。',
    '不要输出引号，不要堆砌关键词。',
  ].join(' ');
}

function getSchema(type: AiAssistType) {
  if (type === 'parse') return parseSchema;
  if (type === 'translate') return translateSchema;
  return seoSchema;
}

export async function POST(request: Request) {
  try {
    await requireAdmin(request);

    const { prompt, type } = (await request.json()) as { prompt?: string; type?: AiAssistType };
    if (!prompt || !type || !['parse', 'translate', 'seo'].includes(type)) {
      return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY 未配置' }, { status: 500 });
    }

    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        messages: [
          { role: 'system', content: getSystemPrompt(type) },
          { role: 'user', content: prompt },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: getSchema(type),
        },
      }),
    });

    const payload = (await openAiResponse.json()) as {
      error?: { message?: string };
      choices?: Array<{ message?: { content?: string } }>;
    };

    if (!openAiResponse.ok) {
      return NextResponse.json({ error: payload.error?.message || 'OpenAI 请求失败' }, { status: 500 });
    }

    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: 'AI 返回为空' }, { status: 500 });
    }

    return NextResponse.json({ data: JSON.parse(content) });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'AI 助手调用失败' }, { status: 500 });
  }
}
