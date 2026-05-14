/**
 * Shared D1 mock factory for API route tests.
 * Creates a D1Database-compatible mock with chainable prepare/bind/first/all/run.
 */
export function createD1Mock(overrides: {
  firstReturns?: Record<string, unknown> | null;
  allReturns?: { results: Record<string, unknown>[] };
  runReturns?: unknown;
} = {}): D1Database {
  const { firstReturns = null, allReturns = { results: [] }, runReturns = undefined } = overrides;

  const mock = {
    prepare: jest.fn().mockReturnValue({
      bind: jest.fn().mockReturnThis(),
      first: jest.fn().mockReturnValue(firstReturns),
      all: jest.fn().mockReturnValue(allReturns),
      run: jest.fn().mockReturnValue(runReturns),
      raw: jest.fn().mockReturnValue([]),
    }),
  } as unknown as D1Database;

  return mock;
}
