import { test, expect } from '@playwright/test';

const pages = [
  { path: '/', titleContains: 'NEOS' },
  { path: '/login', titleContains: 'Log In' },
  { path: '/about', titleContains: 'About' },
  { path: '/contact', titleContains: 'Contact' },
  { path: '/for-business', titleContains: 'Corporate' },
  { path: '/for-agents', titleContains: 'Agent' },
  { path: '/long-term', titleContains: 'Long-Term' },
  { path: '/market-insights', titleContains: 'Market' },
];

test.describe('Feature: SEO Meta Tags', () => {
  for (const pg of pages) {
    test(`[P1] ${pg.path} should have correct title`, async ({ page }) => {
      await page.goto(pg.path);
      const title = await page.title();
      expect(title.toLowerCase()).toContain(pg.titleContains.toLowerCase());
    });
  }

  test('[P1] homepage should have meta description', async ({ page }) => {
    await page.goto('/');
    const metaDesc = await page.getAttribute('meta[name="description"]', 'content');
    expect(metaDesc).toBeTruthy();
    expect(metaDesc!.length).toBeGreaterThan(20);
  });

  test('[P1] homepage should have OG tags', async ({ page }) => {
    await page.goto('/');
    const ogTitle = await page.getAttribute('meta[property="og:title"]', 'content');
    expect(ogTitle).toBeTruthy();
  });
});
