/** @jest-environment node */
import { POST as createHostProperty } from '@/app/api/host/properties/route';

jest.mock('@/lib/auth/admin-api', () => ({
  verifyRequestAuth: jest.fn(async () => ({ userId: 'host_1', role: 'HOST' })),
}));

jest.mock('@/lib/security/csrf', () => ({
  validateCsrf: jest.fn(() => true),
}));

const runMock = jest.fn(async () => undefined);
let bindArgs: unknown[] = [];

const statementMock = {
  bind: jest.fn((...args: unknown[]) => {
    bindArgs = args;
    return { run: runMock };
  }),
};

jest.mock('@/lib/d1', () => ({
  getDb: jest.fn(() => ({
    prepare: jest.fn(() => statementMock),
  })),
}));

describe('host property translation fallback', () => {
  const originalDeepSeekApiKey = process.env.DEEPSEEK_API_KEY;
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    bindArgs = [];
    delete process.env.DEEPSEEK_API_KEY;
    global.fetch = jest.fn();
  });

  afterAll(() => {
    if (originalDeepSeekApiKey) {
      process.env.DEEPSEEK_API_KEY = originalDeepSeekApiKey;
    } else {
      delete process.env.DEEPSEEK_API_KEY;
    }
    global.fetch = originalFetch;
  });

  it('saves a property with null zh/fr descriptions when DeepSeek key is missing', async () => {
    const request = new Request('http://localhost/api/host/properties', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        title: 'Test Property',
        type: 'condo',
        description: 'Bright furnished suite downtown.',
        descriptionZh: '',
        descriptionFr: '',
        location: { address: '1 King St W', city: 'Toronto' },
        basics: { bedrooms: 1, bathrooms: 1, sqft: 500 },
        pricing: { priceMonthly: 3000, minStayDays: 30 },
        amenities: [],
        photos: [],
      }),
    });

    const response = await createHostProperty(request);

    expect(response.status).toBe(201);
    expect(runMock).toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
    expect(bindArgs[11]).toBe('Bright furnished suite downtown.');
    expect(bindArgs[12]).toBeNull();
    expect(bindArgs[13]).toBeNull();
  });
});
