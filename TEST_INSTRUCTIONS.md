# Test Instructions for StayNeos

Execute the full testing pipeline for stayneos.com (Next.js 14, Cloudflare Workers, D1 database).

## Already Done
- vitest, @playwright/test, @testing-library/react, @axe-core/playwright installed
- Playwright chromium browser installed

## Your Tasks

### Phase 0: Setup
1. Create `vitest.config.ts` and `playwright.config.ts` per the template below
2. Create `tests/setup.ts` for vitest
3. Create `e2e/` and `tests/` directories

### Phase 1: E2E Tests (Playwright against https://stayneos.com)
Write E2E tests for:
- **P0** Homepage loads (title, hero, nav, no console errors) → `e2e/homepage.spec.ts`
- **P0** Property listing → `e2e/listings.spec.ts`  
- **P0** Property detail (gallery, amenities, pricing, booking card) → `e2e/property-detail.spec.ts`
- **P0** Login page renders, Google button present → `e2e/auth.spec.ts`
- **P1** Contact form → `e2e/contact.spec.ts`
- **P1** SEO meta tags → `e2e/seo.spec.ts`
- **P1** 404 page → `e2e/errors.spec.ts`

Important: Test against LIVE site `https://stayneos.com` (not localhost). Set `baseURL: 'https://stayneos.com'` in playwright config. Remove webServer config since we're testing production.

### Phase 2: Unit Tests (Vitest)
Write unit tests for:
- `src/lib/utils/property-transform.ts` (toNightlyPrice, toMonthlyListingPrice, formatMonthlyListingPrice)
- `src/lib/auth.ts` (isValidEmail, isValidPassword, hashPassword)
- `src/lib/data.ts` (getPropertyById)

### Phase 5: Accessibility
Run axe-core against homepage, login, property detail pages.

### Execution
1. Run all E2E tests: `npx playwright test --reporter=json`
2. Run unit tests: `npx vitest run --reporter=json`
3. Collect results and output a summary

### Config Templates

vitest.config.ts:
```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

playwright.config.ts:
```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: 'https://stayneos.com',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  ],
});
```

### Output
After running tests, create `results/test-summary.json` with pass/fail counts.
