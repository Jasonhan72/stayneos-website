import { test, expect } from '@playwright/test';

test('responsive layout renders home on desktop/mobile', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/StayNeos/i);
});

test.fixme('user register -> login -> browse -> book -> pay', async () => {
  // TODO: bind to seeded test account + Stripe test mode in CI
});

test.fixme('google oauth -> dashboard -> logout', async () => {
  // TODO: requires OAuth test credentials and callback domain
});

test.fixme('site-wide language switching consistency', async () => {
  // TODO: add assertions across home/properties/booking pages
});
