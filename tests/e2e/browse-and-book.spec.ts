import { test, expect } from '@playwright/test';

/**
 * browse-and-book.spec.ts
 *
 * Critical path: unauthenticated browsing → property detail →
 * verify Reserve/CTA button → navigate to checkout → verify page content.
 */
test.describe('Browse and Book flow', () => {
  test('browse properties, navigate to detail, verify Reserve button, reach checkout', async ({
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

    // ── Verify checkout page URL and content ──
    await expect(page).toHaveURL(/\/checkout\//);
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 });

    // Verify dates and key checkout elements are shown on the page
    const pageContent = page.locator('main');
    // The checkout page renders dates as "Jun 13" format, not ISO
    const checkInFormatted = checkIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const checkOutFormatted = checkOut.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    await expect(pageContent).toContainText(checkInFormatted);
    await expect(pageContent).toContainText(checkOutFormatted);
    // Verify checkout has price summary
    await expect(pageContent).toContainText(/Price Summary/i);
  });
});
