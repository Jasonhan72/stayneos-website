import { defineConfig } from '@playwright/test';
import base from './playwright.config';

// This suite requires the explicitly local Worker/D1 acceptance environment.
process.env.E2E_REQUIRE_AUTH = '1';
export default defineConfig({
  ...base,
  testMatch: ['critical-flows.spec.ts', 'register-and-login.spec.ts'],
  grep: /register/,
  workers: 1,
  webServer: undefined,
  use: { ...base.use, baseURL: 'https://127.0.0.1:3173', ignoreHTTPSErrors: true },
  reporter: [['list'], ['json', { outputFile: '.local/e2e/browser-auth.json' }]],
});
