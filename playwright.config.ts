import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Configuration
 *
 * Local:  npx playwright test
 * CI:     PLAYWRIGHT_BASE_URL=<preview> npx playwright test
 *
 * Test accounts are configured via env:
 *   E2E_USER_EMAIL / E2E_USER_PASSWORD (for wishlist & login-dependent tests)
 */
const remoteURL = process.env.PLAYWRIGHT_BASE_URL;
const localHTTPS = process.env.E2E_LOCAL_HTTPS === '1';
// Remote suites write test data: reject production and arbitrary targets.
if (remoteURL && (!process.env.E2E_USER_EMAIL || !process.env.E2E_USER_PASSWORD)) {
  throw new Error('Remote E2E requires dedicated preview account credentials');
}
if (remoteURL && new URL(remoteURL).hostname !== 'stayneos-preview.neos-lab.workers.dev') {
  throw new Error('Remote E2E requires the isolated stayneos-preview worker');
}
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['list']] : 'list',

  use: {
    baseURL: remoteURL || (localHTTPS ? 'https://127.0.0.1:3143' : 'http://127.0.0.1:3000'),
    ignoreHTTPSErrors: !remoteURL && localHTTPS,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],

  webServer: remoteURL ? undefined : localHTTPS ? {
    command: 'node scripts/tests/https-server.cjs',
    url: 'https://127.0.0.1:3143',
    ignoreHTTPSErrors: true,
    reuseExistingServer: false,
    timeout: 120_000,
  } : {
    command: process.env.CI ? 'npm run start' : 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
