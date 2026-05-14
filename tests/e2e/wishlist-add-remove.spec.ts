import { test, expect } from '@playwright/test';

/**
 * wishlist-add-remove.spec.ts
 *
 * Critical path: login → add property to wishlist →
 * verify wishlist page → remove → verify empty.
 *
 * Requires a pre-existing test account set via env:
 *   E2E_USER_EMAIL / E2E_USER_PASSWORD
 */
test.describe('Wishlist Add and Remove', () => {
  test('login, add to wishlist, verify, remove, verify empty', async ({ page }) => {
    const email = process.env.E2E_USER_EMAIL;
    const password = process.env.E2E_USER_PASSWORD;

    test.skip(!email || !password, 'Skipping: E2E_USER_EMAIL and E2E_USER_PASSWORD env vars required');

    // ── Login ──
    await page.goto('/login');
    await page.fill('#email', email);
    await page.fill('#password', password);
    await page.getByRole('button', { name: /sign in/i }).click();

    // Wait for redirect to home after login.
    // On preview environments without D1, the login API may fail silently.
    try {
      await page.waitForURL(/\/$/, { timeout: 15_000 });
    } catch {
      const stillOnLogin = /\/login/.test(page.url());
      if (stillOnLogin) {
        test.skip(true, 'Login API unavailable (likely no D1 on preview)');
        return;
      }
      throw new Error('Unexpected state after login');
    }

    await page.waitForTimeout(1500);

    // Confirm authenticated
    await expect(page.locator('button[aria-haspopup="true"]')).toBeVisible({
      timeout: 5_000,
    });

    // ── Navigate to Properties ──
    await page.goto('/properties');
    await expect(page).toHaveURL(/\/properties/);

    // ── Get the first property title and heart it ──
    // The PropertyGridCard places the heart button inside the <a href="/property/...">
    // We locate the first property link card and find the heart button within it.
    const firstPropertyCard = page.locator('a[href^="/property/"]').first();
    await expect(firstPropertyCard).toBeVisible({ timeout: 10_000 });

    // Get the property title from the card (h3 inside the link)
    const titleEl = firstPropertyCard.locator('h3');
    const propertyTitle = (await titleEl.textContent())?.trim();
    expect(propertyTitle).toBeTruthy();

    // Click the heart button inside the card (it has a lucide-heart SVG)
    const heartBtn = firstPropertyCard.locator('button svg.lucide-heart').locator('..');
    await expect(heartBtn).toBeVisible();
    await heartBtn.click();

    // Wait for the wishlist API call to complete
    await page.waitForTimeout(1500);

    // Verify heart is filled (rose-500 color class)
    const heartSvg = heartBtn.locator('svg.lucide-heart');
    await expect(heartSvg).toHaveClass(/fill-rose-500/);

    // ── Navigate to Wishlists ──
    await page.goto('/dashboard/wishlists');
    await expect(page).toHaveURL(/\/wishlists/);
    await page.waitForTimeout(3000); // Allow API + render

    // Verify the property appears on the wishlist page
    if (propertyTitle) {
      await expect(page.getByText(propertyTitle).first()).toBeVisible({ timeout: 8_000 });
    }

    // ── Remove from wishlist ──
    // Wishlist cards are div.group elements. The Trash2 button is hidden by default
    // (opacity-0) and becomes visible on hover (group-hover:opacity-100).
    const wishlistCard = page.locator('div.group').first();
    if (await wishlistCard.isVisible().catch(() => false)) {
      // Hover to reveal the remove button
      await wishlistCard.hover();
      await page.waitForTimeout(500);

      // Click the Trash2 button inside the card
      const trashBtn = wishlistCard.locator('button svg.lucide-trash-2').locator('..');
      if (await trashBtn.isVisible().catch(() => false)) {
        await trashBtn.click();
        await page.waitForTimeout(1500);
      }
    }

    // ── Verify wishlist is empty ──
    // Empty state shows a big Heart icon with text-neutral-300 class
    await expect(page.locator('svg.text-neutral-300').first()).toBeVisible({ timeout: 5_000 });
  });
});
