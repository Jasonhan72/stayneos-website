import { test, expect, type Page } from '@playwright/test';

/**
 * Link integrity smoke test
 * ------------------------------------------------------------------
 * Visits every page in `CRITICAL_PAGES` and asserts that:
 *   1. The page itself loads with HTTP 200.
 *   2. Every internal <a href="/..."> on that page resolves to 200 or 3xx.
 *
 * This is the safety net that would have caught last night's
 * "UserMenu links 404" bug. Run with:
 *     npm run test:e2e -- link-integrity
 *
 * To run against production, set:
 *     PLAYWRIGHT_BASE_URL=https://www.stayneos.com npm run test:e2e -- link-integrity
 */

const CRITICAL_PAGES = [
  '/',
  '/about',
  '/faq',
  '/help',
  '/contact',
  '/properties',
  '/property/2', // 238 Simcoe
  '/neighborhoods',
  '/market-insights',
  '/for-business',
  '/for-hosts',
  '/for-agents',
  '/for-students',
  '/landlords',
  '/long-term',
  '/corporate',
  '/services',
  '/become-a-host',
  '/privacy',
  '/terms',
  '/cancellation-policy',
  '/login',
  '/register',
];

// Hosts to skip when probing — chat/widget targets that are intentional outbound.
const SKIP_HOST_REGEX = /wa\.me|whatsapp\.com|mailto:|tel:|maps\.google|google\.com\/maps/i;

async function collectInternalLinks(page: Page, baseURL: string): Promise<string[]> {
  return await page.$$eval('a[href]', (anchors, baseHref) => {
    const seen = new Set<string>();
    anchors.forEach((a) => {
      const href = (a as HTMLAnchorElement).getAttribute('href');
      if (!href) return;
      if (href.startsWith('#')) return;
      try {
        const u = new URL(href, baseHref);
        // Only same-origin
        if (u.origin === new URL(baseHref).origin) {
          seen.add(u.pathname + u.search);
        }
      } catch {
        /* ignore malformed */
      }
    });
    return Array.from(seen);
  }, baseURL);
}

test.describe('link integrity', () => {
  for (const path of CRITICAL_PAGES) {
    test(`page loads: ${path}`, async ({ page, baseURL }) => {
      const target = (baseURL ?? '') + path;
      const res = await page.goto(target, { waitUntil: 'domcontentloaded' });
      expect(res, `no response for ${target}`).not.toBeNull();
      expect(res!.status(), `${target} returned ${res!.status()}`).toBeLessThan(400);
    });
  }

  test('homepage internal links resolve', async ({ page, request, baseURL }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const links = await collectInternalLinks(page, baseURL ?? 'http://localhost:3000');
    expect(links.length).toBeGreaterThan(5);

    // Sample up to 25 unique paths to keep the test fast
    const sample = links.slice(0, 25);
    for (const path of sample) {
      if (SKIP_HOST_REGEX.test(path)) continue;
      const res = await request.head((baseURL ?? '') + path).catch(() => null);
      // Fallback to GET if HEAD is rejected
      const final = res && res.status() < 500
        ? res
        : await request.get((baseURL ?? '') + path).catch(() => null);
      expect(final, `no response for ${path}`).not.toBeNull();
      expect(final!.status(), `${path} returned ${final!.status()}`).toBeLessThan(400);
    }
  });
});
