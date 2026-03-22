import { test, expect } from '@playwright/test';

test.describe('Feature: Property Detail Page', () => {
  test('[P0] should load 55 Cooper property', async ({ page }) => {
    await page.goto('/property/1');
    await expect(page.locator('h1')).toContainText(/Cooper/i);
  });

  test('[P0] should display pricing info', async ({ page }) => {
    await page.goto('/property/1');
    // Should show monthly price
    await expect(page.getByText('From $12,000/Mo')).toBeVisible();
  });

  test('[P0] should display amenities section', async ({ page }) => {
    await page.goto('/property/1');
    // "What this place offers" or similar heading
    const amenitiesSection = page.getByText(/offers|amenities|设施/i);
    await expect(amenitiesSection.first()).toBeVisible();
  });

  test('[P0] should have clickable show all amenities button', async ({ page }) => {
    await page.goto('/property/1');
    const showAllBtn = page.getByRole('button', { name: /show all|查看全部/i });
    if (await showAllBtn.isVisible()) {
      await showAllBtn.click();
      // After clicking, should show more amenities
      await page.waitForTimeout(500);
      // Button text should change to "show less"
      const showLessBtn = page.getByRole('button', { name: /show less|收起/i });
      await expect(showLessBtn).toBeVisible();
    }
  });

  test('[P0] should display booking card with correct nightly rate', async ({ page }) => {
    await page.goto('/property/1');
    // Should NOT show $12,000 x nights (that was the bug)
    // The booking card price breakdown should show the nightly rate (~$400)
    const priceText = await page.textContent('body');
    // $12,000/Mo should be displayed as monthly price
    expect(priceText).toContain('12,000');
    // Should NOT have $408,000 type of astronomical totals
    expect(priceText).not.toMatch(/\$[3-9]\d{2},\d{3}/); // No 300k-999k prices
  });

  test('[P0] should load all 3 properties', async ({ page }) => {
    for (const id of ['1', '2', '3']) {
      const response = await page.goto(`/property/${id}`);
      expect(response?.status()).toBe(200);
      await expect(page.locator('h1')).toBeVisible();
    }
  });

  test('[P0] should display map section', async ({ page }) => {
    await page.goto('/property/1');
    const map = page.locator('iframe[src*="maps.google"]');
    await expect(map).toBeVisible();
  });
});
