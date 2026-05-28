type DescriptionTranslationTarget = 'zh' | 'fr';

type DeepSeekTranslationResponse = {
  choices?: Array<{
    message?: {
      content?: unknown;
    };
  }>;
};

type TranslationFields = {
  descriptionZh: string | null;
  descriptionFr: string | null;
};

type FillTranslationOptions = {
  forceZh?: boolean;
  forceFr?: boolean;
  translator?: typeof translateDescription;
};

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_MODEL = 'deepseek-chat';
const TARGET_LANGUAGE_LABELS: Record<DescriptionTranslationTarget, string> = {
  zh: 'Simplified Chinese',
  fr: 'French',
};

function hasText(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export async function translateDescription(
  text: string,
  target: DescriptionTranslationTarget,
  env: { DEEPSEEK_API_KEY?: string }
): Promise<string | null> {
  const apiKey = env.DEEPSEEK_API_KEY;
  const source = text.trim();

  if (!apiKey || !source) return null;

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          {
            role: 'user',
            content: `Translate the following furnished apartment listing description from English to ${TARGET_LANGUAGE_LABELS[target]}, preserving tone and any markdown structure. Output only the translation, no explanation. Source: ${source}`,
          },
        ],
        temperature: 0.2,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) return null;

    const data = (await response.json()) as DeepSeekTranslationResponse;
    const content = data.choices?.[0]?.message?.content;
    return typeof content === 'string' && content.trim().length > 0 ? content.trim() : null;
  } catch {
    return null;
  }
}

export async function fillMissingDescriptionTranslations(
  description: string | null | undefined,
  fields: TranslationFields,
  env: { DEEPSEEK_API_KEY?: string },
  options: FillTranslationOptions = {}
): Promise<TranslationFields> {
  if (!hasText(description)) return fields;

  const shouldTranslateZh = options.forceZh || !hasText(fields.descriptionZh);
  const shouldTranslateFr = options.forceFr || !hasText(fields.descriptionFr);
  const translator = options.translator ?? translateDescription;

  const translations = await Promise.allSettled([
    shouldTranslateZh ? translator(description, 'zh', env) : Promise.resolve(null),
    shouldTranslateFr ? translator(description, 'fr', env) : Promise.resolve(null),
  ]);

  const translatedZh = translations[0].status === 'fulfilled' ? translations[0].value : null;
  const translatedFr = translations[1].status === 'fulfilled' ? translations[1].value : null;

  return {
    descriptionZh: translatedZh ?? fields.descriptionZh,
    descriptionFr: translatedFr ?? fields.descriptionFr,
  };
}
