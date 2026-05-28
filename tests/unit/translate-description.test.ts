import {
  fillMissingDescriptionTranslations,
  translateDescription,
} from '@/lib/translate-description';

const originalFetch = global.fetch;
const originalAbortSignalTimeout = AbortSignal.timeout;

describe('translateDescription', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    AbortSignal.timeout = jest.fn(() => new AbortController().signal);
  });

  afterAll(() => {
    global.fetch = originalFetch;
    AbortSignal.timeout = originalAbortSignalTimeout;
  });

  it('returns null without a DeepSeek API key', async () => {
    await expect(translateDescription('Bright suite', 'zh', {})).resolves.toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('uses DeepSeek chat with the property description prompt and a 15s timeout', async () => {
    const fetchMock = global.fetch as jest.Mock;
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: '套房明亮' } }] }),
    });

    await expect(translateDescription('Bright suite', 'zh', { DEEPSEEK_API_KEY: 'key' }))
      .resolves.toBe('套房明亮');

    expect(AbortSignal.timeout).toHaveBeenCalledWith(15000);
    expect(fetchMock).toHaveBeenCalledWith('https://api.deepseek.com/v1/chat/completions', expect.objectContaining({
      method: 'POST',
      headers: {
        Authorization: 'Bearer key',
        'Content-Type': 'application/json',
      },
      body: expect.stringContaining('"model":"deepseek-chat"'),
    }));
    expect(fetchMock.mock.calls[0][1].body).toContain('preserving tone and any markdown structure');
    expect(fetchMock.mock.calls[0][1].body).toContain('Output only the translation, no explanation');
  });
});

describe('fillMissingDescriptionTranslations', () => {
  it('translates zh/fr in parallel when description exists and both fields are empty', async () => {
    const translator = jest.fn(async (_description: string, target: 'zh' | 'fr') => `${target} text`);

    const result = await fillMissingDescriptionTranslations(
      'Bright furnished suite',
      { descriptionZh: null, descriptionFr: '' },
      { DEEPSEEK_API_KEY: 'key' },
      { translator }
    );

    expect(result).toEqual({ descriptionZh: 'zh text', descriptionFr: 'fr text' });
    expect(translator).toHaveBeenCalledTimes(2);
    expect(translator.mock.calls.map((call) => call[1]).sort()).toEqual(['fr', 'zh']);
  });

  it('does not translate when host provided both translations', async () => {
    const translator = jest.fn();

    const result = await fillMissingDescriptionTranslations(
      'Bright furnished suite',
      { descriptionZh: '自定义中文', descriptionFr: 'Français personnalisé' },
      { DEEPSEEK_API_KEY: 'key' },
      { translator }
    );

    expect(result).toEqual({ descriptionZh: '自定义中文', descriptionFr: 'Français personnalisé' });
    expect(translator).not.toHaveBeenCalled();
  });

  it('can force retranslation after English description changes', async () => {
    const translator = jest.fn(async (_description: string, target: 'zh' | 'fr') => `new ${target}`);

    const result = await fillMissingDescriptionTranslations(
      'Updated English description',
      { descriptionZh: '旧中文', descriptionFr: 'ancien français' },
      { DEEPSEEK_API_KEY: 'key' },
      { forceZh: true, forceFr: true, translator }
    );

    expect(result).toEqual({ descriptionZh: 'new zh', descriptionFr: 'new fr' });
    expect(translator).toHaveBeenCalledTimes(2);
  });

  it('keeps fields null when translations fail', async () => {
    const translator = jest.fn(async () => null);

    const result = await fillMissingDescriptionTranslations(
      'Bright furnished suite',
      { descriptionZh: null, descriptionFr: null },
      {},
      { translator }
    );

    expect(result).toEqual({ descriptionZh: null, descriptionFr: null });
  });
});
