import { generateChatReply } from '@/lib/deepseek-chat';

const originalFetch = global.fetch;
const originalAbortSignalTimeout = AbortSignal.timeout;

describe('generateChatReply', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    AbortSignal.timeout = jest.fn(() => new AbortController().signal);
  });

  afterAll(() => {
    global.fetch = originalFetch;
    AbortSignal.timeout = originalAbortSignalTimeout;
  });

  it('calls DeepSeek chat completions and returns text', async () => {
    const fetchMock = global.fetch as jest.Mock;
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'Hello from DeepSeek' } }],
      }),
    });

    const result = await generateChatReply({
      env: { DEEPSEEK_API_KEY: 'test-key' },
      messages: [{ role: 'user', content: 'Hello' }],
      temperature: 0.2,
      maxTokens: 128,
    });

    expect(result).toEqual({
      text: 'Hello from DeepSeek',
      model: 'deepseek-chat',
    });
    expect(AbortSignal.timeout).toHaveBeenCalledWith(12000);
    expect(fetchMock).toHaveBeenCalledWith('https://api.deepseek.com/v1/chat/completions', expect.objectContaining({
      method: 'POST',
      headers: {
        Authorization: 'Bearer test-key',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: 'Hello' }],
        temperature: 0.2,
        max_tokens: 128,
      }),
    }));
  });

  it('throws when the API key is missing', async () => {
    await expect(generateChatReply({
      env: {},
      messages: [{ role: 'user', content: 'Hello' }],
    })).rejects.toThrow('DEEPSEEK_API_KEY is not configured');

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('throws on DeepSeek HTTP errors', async () => {
    const fetchMock = global.fetch as jest.Mock;
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => 'unauthorized',
    });

    await expect(generateChatReply({
      env: { DEEPSEEK_API_KEY: 'bad-key' },
      messages: [{ role: 'user', content: 'Hello' }],
    })).rejects.toThrow('DeepSeek chat failed with HTTP 401');
  });

  it('throws on invalid JSON response shape', async () => {
    const fetchMock = global.fetch as jest.Mock;
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [] }),
    });

    await expect(generateChatReply({
      env: { DEEPSEEK_API_KEY: 'test-key' },
      messages: [{ role: 'user', content: 'Hello' }],
    })).rejects.toThrow('DeepSeek chat returned an invalid response format');
  });
});
