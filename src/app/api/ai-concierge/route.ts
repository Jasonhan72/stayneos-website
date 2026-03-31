import { NextRequest, NextResponse } from 'next/server';

interface ConciergeRequest {
  message: string;
  language: string;
}

interface ConciergeResponse {
  text: string;
  recommended_property_id: number;
  alternative_property_id: number | null;
  hotel_comparison: string;
}

const PROPERTIES_CONTEXT = `
Available NEOS Properties in Toronto:

1. ID: 1 — 55 Cooper St (Sugar Wharf) · Premium 3BR Sky Suite
   - Location: Waterfront / Sugar Wharf, downtown Toronto
   - Bedrooms: 3, Max Guests: 6, Area: 1273 sqft
   - Monthly: $12,000 | Quarterly: $10,800/mo | Annual: $9,600/mo
   - Features: Lake views from 55+ floor, near Union Station (8 min walk), Financial District (5 min), Scotiabank Arena, brand new Menkes development
   - Best for: Executives, families, luxury seekers, project teams, corporate relocations

2. ID: 2 — 238 Simcoe St (Grange Park) · Executive 3BR Suite
   - Location: Downtown Core / Grange Park, near AGO, OCAD, UofT St. George
   - Bedrooms: 3, Max Guests: 5, Area: 1100 sqft
   - Monthly: $6,500 | Quarterly: $5,850/mo | Annual: $5,200/mo
   - Features: Walking distance to 4 major hospitals (Toronto General, Mt. Sinai, SickKids, Princess Margaret), St. Patrick / Osgoode subway ~3 min
   - Best for: Medical professionals, visiting scholars, academic stays, insurance housing, families needing hospital proximity

3. ID: 3 — 22 Wellesley St E · Modern 1BR City View
   - Location: Midtown, near Wellesley subway station
   - Bedrooms: 1, Max Guests: 2, Area: 550 sqft
   - Monthly: $3,500 | Quarterly: $3,150/mo | Annual: $2,800/mo
   - Features: Modern finishes, city view, convenient midtown location, close to UofT
   - Best for: Solo professionals, visiting scholars, medical rotations, budget-conscious stays

Matching Rules:
- Medical/hospital needs → Property 2 (238 Simcoe) first, Property 3 as alternative
- Luxury/executive/large family → Property 1 (55 Cooper) first
- Budget/solo/student → Property 3 (22 Wellesley) first, Property 2 as alternative
- Insurance housing → Property 2 (238 Simcoe) for hospital proximity
- Corporate/project team → Property 1 (55 Cooper) first
`;

const SYSTEM_PROMPT = `You are NEOS AI Concierge, an expert housing assistant for premium furnished apartments in Toronto.

${PROPERTIES_CONTEXT}

IMPORTANT:
- Be warm, concise, and helpful. Max 3-4 sentences for your response.
- Always recommend a specific property based on the user's needs using the matching rules above.
- Include a brief hotel comparison showing value.
- Respond in the same language the user writes in.
- Return ONLY valid JSON matching this format:
{
  "text": "Your helpful response text",
  "recommended_property_id": 1,
  "alternative_property_id": 2,
  "hotel_comparison": "Brief comparison vs hotel pricing"
}`;

const FALLBACK_RESPONSES = {
  en: {
    text: "Based on your needs, I'd recommend our 238 Simcoe St suite — perfectly located in downtown Toronto near major hospitals, universities, and transit. It's a fully furnished 3BR at $6,500/mo, move-in ready.",
    recommended_property_id: 2,
    alternative_property_id: 3,
    hotel_comparison: "Comparable hotel suites in this area cost $250-400/night ($7,500-12,000/mo). NEOS saves you up to 45% with a real home experience.",
  },
  zh: {
    text: "根据您的需求，我推荐我们位于 238 Simcoe St 的套房 — 地处多伦多市中心，靠近主要医院、大学和交通枢纽。这是一个全家具的 3 卧室公寓，月租 $6,500，可随时入住。",
    recommended_property_id: 2,
    alternative_property_id: 3,
    hotel_comparison: "该区域类似酒店套房价格 $250-400/晚（$7,500-12,000/月）。选择 NEOS 可节省高达 45%，享受真正的居家体验。",
  },
  fr: {
    text: "En fonction de vos besoins, je recommande notre suite au 238 Simcoe St — parfaitement située au centre-ville de Toronto, près des principaux hôpitaux, universités et transports en commun. C'est un 3 chambres entièrement meublé à $6,500/mois, prêt à emménager.",
    recommended_property_id: 2,
    alternative_property_id: 3,
    hotel_comparison: "Les suites d'hôtel comparables dans cette zone coûtent $250-400/nuit ($7,500-12,000/mois). NEOS vous fait économiser jusqu'à 45% avec une véritable expérience de maison.",
  },
};

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

    // Try Cloudflare Workers AI if available
    const env = (process.env as Record<string, unknown>);
    const ai = (env as { AI?: { run: (model: string, input: Record<string, unknown>) => Promise<{ response?: string }> } }).AI;
    const model = (env.AI_CONCIERGE_MODEL as string) || '@cf/meta/llama-3.1-8b-instruct';

    if (ai && typeof ai.run === 'function') {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

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
            // Try to parse the JSON response
            const cleanedResponse = result.response
              .replace(/```json\n?/g, '')
              .replace(/```\n?/g, '')
              .trim();
            const parsed: ConciergeResponse = JSON.parse(cleanedResponse);

            // Validate required fields
            if (parsed.text && parsed.recommended_property_id) {
              return NextResponse.json(parsed);
            }
          } catch {
            // If parsing fails, use AI text with fallback structure
            const lang = body.language || 'en';
            const fallback = FALLBACK_RESPONSES[lang as keyof typeof FALLBACK_RESPONSES] || FALLBACK_RESPONSES.en;
            return NextResponse.json({
              ...fallback,
              text: result.response,
            });
          }
        }
      } catch {
        // AI timeout or error — fall through to fallback
      }
    }

    // Fallback: simple keyword matching with language support
    const msg = body.message.toLowerCase();
    const lang = body.language || 'en';
    const fallback = FALLBACK_RESPONSES[lang as keyof typeof FALLBACK_RESPONSES] || FALLBACK_RESPONSES.en;
    let response = { ...fallback };

    // Medical/hospital keywords in multiple languages
    const medicalKeywords = ['medical', 'hospital', 'doctor', 'insurance', '医疗', '医院', '医生', '保险', 'médical', 'hôpital', 'médecin', 'assurance'];
    const executiveKeywords = ['executive', 'luxury', 'family', 'corporate', 'relocat', '高管', '豪华', '家庭', '企业', '搬迁', 'exécutif', 'luxe', 'famille', 'entreprise', 'relocalisation'];
    const scholarKeywords = ['scholar', 'student', 'budget', 'u of t', 'university', '学者', '学生', '预算', '大学', 'chercheur', 'étudiant', 'budget', 'université'];

    if (medicalKeywords.some(keyword => msg.includes(keyword))) {
      response = lang === 'zh' ? {
        text: "针对医疗专业人士，我强烈推荐我们位于 238 Simcoe St 的套房 — 步行即可到达多伦多总医院、西奈山医院、病童医院和玛格丽特公主医院。全家具 3 卧室公寓，月租 $6,500。",
        recommended_property_id: 2,
        alternative_property_id: 3,
        hotel_comparison: "附近酒店价格 $250-400/晚。选择月租可节省高达 45%，并拥有完整厨房和家庭办公室。",
      } : lang === 'fr' ? {
        text: "Pour les professionnels de la santé, je recommande vivement notre suite au 238 Simcoe St — à distance de marche des hôpitaux Toronto General, Mt. Sinai, SickKids et Princess Margaret. 3 chambres entièrement meublées à $6,500/mois.",
        recommended_property_id: 2,
        alternative_property_id: 3,
        hotel_comparison: "Les hôtels à proximité facturent $250-400/nuit. Notre tarif mensuel vous fait économiser jusqu'à 45% avec une cuisine complète et un bureau à domicile.",
      } : {
        text: "For medical professionals, I highly recommend our 238 Simcoe St suite — it's walking distance to Toronto General, Mt. Sinai, SickKids, and Princess Margaret hospitals. Fully furnished 3BR at $6,500/mo.",
        recommended_property_id: 2,
        alternative_property_id: 3,
        hotel_comparison: "Nearby hotels charge $250-400/night. Our monthly rate saves you up to 45% with a full kitchen and home office.",
      };
    } else if (executiveKeywords.some(keyword => msg.includes(keyword))) {
      response = lang === 'zh' ? {
        text: "根据您的需求，我们的 55 Cooper St 湖景套房是理想选择 — 壮丽的安大略湖景，3 间卧室，步行 8 分钟到联合车站。全新的 Sugar Wharf 开发项目，月租 $12,000。",
        recommended_property_id: 1,
        alternative_property_id: 2,
        hotel_comparison: "市中心豪华酒店套房起价 $500+/晚（$15,000+/月）。选择 NEOS 可节省 20% 以上，同时享受 3 倍空间。",
      } : lang === 'fr' ? {
        text: "Pour vos besoins, notre suite premium au 55 Cooper St est idéale — vue imprenable sur le lac Ontario, 3 chambres, 8 minutes à pied de la gare Union. Nouveau développement Sugar Wharf à $12,000/mois.",
        recommended_property_id: 1,
        alternative_property_id: 2,
        hotel_comparison: "Les suites d'hôtel de luxe du centre-ville commencent à $500+/nuit ($15,000+/mois). Vous économiserez 20%+ tout en profitant de 3x plus d'espace.",
      } : {
        text: "For your needs, our premium 55 Cooper St Sky Suite is ideal — stunning lake views, 3 bedrooms, 8 min walk to Union Station. Brand new Sugar Wharf development at $12,000/mo.",
        recommended_property_id: 1,
        alternative_property_id: 2,
        hotel_comparison: "Luxury hotel suites downtown start at $500+/night ($15,000+/mo). You'll save 20%+ while enjoying 3x the space.",
      };
    } else if (scholarKeywords.some(keyword => msg.includes(keyword))) {
      response = lang === 'zh' ? {
        text: "针对访问学者，我们位于 22 Wellesley St 的公寓非常合适 — 现代 1 卧室公寓，城市景观，靠近多伦多大学和 Wellesley 地铁站。月租仅 $3,500，全家具。",
        recommended_property_id: 3,
        alternative_property_id: 2,
        hotel_comparison: "校园附近的延长住宿酒店价格 $150-250/晚（$4,500-7,500/月）。选择 NEOS 可节省高达 53%。",
      } : lang === 'fr' ? {
        text: "Pour les chercheurs invités, notre appartement au 22 Wellesley St est parfait — studio moderne avec vue sur la ville, près de l'Université de Toronto et de la station de métro Wellesley. Seulement $3,500/mois, entièrement meublé.",
        recommended_property_id: 3,
        alternative_property_id: 2,
        hotel_comparison: "Les hôtels de séjour prolongé près du campus facturent $150-250/nuit ($4,500-7,500/mois). NEOS vous fait économiser jusqu'à 53%.",
      } : {
        text: "For visiting scholars, our 22 Wellesley St apartment is perfect — modern 1BR with city views, close to UofT and Wellesley subway. Just $3,500/mo, fully furnished.",
        recommended_property_id: 3,
        alternative_property_id: 2,
        hotel_comparison: "Extended-stay hotels near campus charge $150-250/night ($4,500-7,500/mo). NEOS saves you up to 53%.",
      };
    }

    return NextResponse.json(response);
  } catch (_error) {
    // In case of any error, return English fallback
    return NextResponse.json(FALLBACK_RESPONSES.en);
  }
}
