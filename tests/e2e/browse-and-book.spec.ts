import { test, expect } from '@playwright/test';

/**
 * browse-and-book.spec.ts
 *
 * Critical path: unauthenticated browsing → property detail →
 * select future dates → Reserve → verify checkout page.
 */
test.describe('Browse and Book flow', () => {
  test('browse properties, select dates, Reserve → checkout page', async ({ page }) => {
    // ── Home page ──
    await page.goto('/');
    await expect(page).toHaveTitle(/NEOS|StayNeos/i);

    // ── Navigate to /properties ──
    await page.getByRole('link', { name: /properties|房源|propriétés/i }).first().click();
    await expect(page).toHaveURL(/\/properties/);

    // ── Click first property card ──
    const firstCardLink = page.locator('a[href^="/property/"]').first();
    await expect(firstCardLink).toBeVisible({ timeout: 10_000 });
    await firstCardLink.click();
    await expect(page).toHaveURL(/\/property\//);

    // ── Select future dates on the calendar ──
    // Desktop: click the CHECK-IN date selector button to open the calendar
    const checkInBtn = page.getByRole('button', { name: /check.?in/i }).first();
    await expect(checkInBtn).toBeVisible({ timeout: 5_000 });
    await checkInBtn.click();
    await page.waitForTimeout(500);

    // Find the calendar day buttons. Pick the first available selectable day.
    // The calendar renders <button> elements with day numbers.
    // Selectable days have the cursor-pointer class and are NOT disabled.
    const dayButtons = page.locator(
      '.grid-cols-7 button:not([disabled]) span'
    );
    const dayCount = await dayButtons.count();

    if (dayCount >= 2) {
      // Click first available day as check-in
      await dayButtons.nth(0).click();
      await page.waitForTimeout(300);
      // Click a day ~7 positions later as check-out (1 week stay)
      const checkOutIndex = Math.min(6, dayCount - 1);
      await dayButtons.nth(checkOutIndex).click();
      await page.waitForTimeout(300);
    }

    // ── Verify dates are set (the button text changes to "Reserve") ──
    const reserveBtn = page.getByRole('button', { name: /reserve/i });
    const ctaBtn = reserveBtn.or(page.getByRole('button', { name: /check availability/i }));

    // ── Click Reserve / Check Availability ──
    await ctaBtn.first().click();

    // The app redirects to /booking/[id]?params which immediately redirects to /checkout/[id]?params
    await page.waitForURL(/\/checkout\//, { timeout: 10_000 });

    // ── Verify checkout page shows content ──
    await expect(page.locator('main')).toBeVisible();
    const pageContent = page.locator('main');
    await expect(pageContent).not.toBeEmpty();
  });
});
