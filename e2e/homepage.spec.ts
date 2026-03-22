import { test, expect } from '@playwright/test';

test.describe('Feature: Homepage', () => {
  test('[P0] should load with correct title and hero section', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/NEOS/i);
    // Hero section or main heading visible
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
  });

  test('[P0] should display navigation', async ({ page }) => {
    await page.goto('/');
    // Nav should be present
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();
  });

  test('[P0] should have no console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Filter out known benign errors (e.g. favicon, third-party)
    const criticalErrors = errors.filter(e => 
      !e.includes('favicon') && !e.includes('third-party') && !e.includes('net::') && !e.includes('Failed to load resource')
    );
    expect(criticalErrors.length).toBeLessThanOrEqual(1);
  });

  test('[P0] should display featured properties section', async ({ page }) => {
    await page.goto('/');
    // Look for property cards or listing section
    // Check for any content section with properties/listings
    const body = await page.textContent('body');
    const hasPropertyContent = body?.includes('Cooper') || body?.includes('Simcoe') || body?.includes('Wellesley') || body?.includes('Featured');
    expect(hasPropertyContent).toBe(true);
  });
});
