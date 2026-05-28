export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type DeepSeekChatEnv = {
  DEEPSEEK_API_KEY?: string;
};

type GenerateChatReplyOptions = {
  messages: ChatMessage[];
  env: DeepSeekChatEnv;
  temperature?: number;
  maxTokens?: number;
};

type DeepSeekChatResponse = {
  choices?: Array<{
    message?: {
      content?: unknown;
    };
  }>;
};

const DEEPSEEK_CHAT_ENDPOINT = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_CHAT_MODEL = 'deepseek-chat';

export async function generateChatReply(opts: GenerateChatReplyOptions): Promise<{ text: string; model: string }> {
  const apiKey = opts.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY is not configured');
  }

  const response = await fetch(DEEPSEEK_CHAT_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: DEEPSEEK_CHAT_MODEL,
      messages: opts.messages,
      temperature: opts.temperature ?? 0.2,
      max_tokens: opts.maxTokens ?? 512,
    }),
    signal: AbortSignal.timeout(12000),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`DeepSeek chat failed with HTTP ${response.status}: ${errorBody.slice(0, 300)}`);
  }

  const data = (await response.json()) as DeepSeekChatResponse;
  const text = data.choices?.[0]?.message?.content;

  if (typeof text !== 'string' || text.trim().length === 0) {
    throw new Error('DeepSeek chat returned an invalid response format');
  }

  return {
    text,
    model: DEEPSEEK_CHAT_MODEL,
  };
}
