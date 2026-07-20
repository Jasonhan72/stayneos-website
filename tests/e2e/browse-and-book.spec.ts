import { test, expect } from '@playwright/test';

/**
 * browse-and-book.spec.ts
 *
 * Critical path: unauthenticated browsing → property detail →
 * verify Reserve/CTA button → attempt checkout → verify login callback.
 */
test.describe('Browse and Book flow', () => {
  test('browse properties, navigate to detail, verify Reserve button, require login before checkout', async ({
    page,
  }) => {
    // ── Home page ──
    await page.goto('/');
    await expect(page).toHaveTitle(/NEOS|StayNeos/i);

    // ── Navigate to /properties ──
    await page.getByRole('link', { name: /properties|房源|propriétés/i }).first().click();
    await expect(page).toHaveURL(/\/properties/);

    // ── Click first property card ──
    const firstCardLink = page.locator('a[href^="/property/"]').first();
    await expect(firstCardLink).toBeVisible({ timeout: 10_000 });

    // Extract property ID from the href
    const href = await firstCardLink.getAttribute('href');
    const propertyId = href?.split('/property/')[1];
    expect(propertyId).toBeTruthy();

    await firstCardLink.click();
    await expect(page).toHaveURL(/\/property\//);

    // ── Verify property detail page has a Reserve or Check Availability button ──
    const reserveBtn = page.getByRole('button', { name: /reserve|检查空房|vérif/i });
    const checkAvailBtn = page.getByRole('button', { name: /check availability/i });
    const ctaBtn = reserveBtn.or(checkAvailBtn);
    await expect(ctaBtn.first()).toBeVisible({ timeout: 10_000 });

    // ── Navigate directly to checkout with query parameters ──
    // Calculate future dates: +30 days check-in, +37 days check-out
    const today = new Date();
    const checkIn = new Date(today);
    checkIn.setDate(today.getDate() + 30);
    const checkOut = new Date(today);
    checkOut.setDate(today.getDate() + 37);

    const yyyymmdd = (d: Date) => d.toISOString().split('T')[0];
    const params = new URLSearchParams({
      checkIn: yyyymmdd(checkIn),
      checkOut: yyyymmdd(checkOut),
      adults: '1',
      children: '0',
      infants: '0',
      pets: '0',
    });

    await page.goto(`/checkout/${propertyId}?${params.toString()}`);

    // Checkout is authenticated; unauthenticated visitors should be sent to login
    // with a callback that preserves the intended checkout URL.
    await expect(page).toHaveURL(/\/login\?callbackUrl=/);
    const callbackUrl = new URL(page.url()).searchParams.get('callbackUrl');
    expect(callbackUrl).toContain(`/checkout/${propertyId}`);
  });
});
