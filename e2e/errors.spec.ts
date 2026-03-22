import { test, expect } from '@playwright/test';

test.describe('Feature: Error Pages', () => {
  test('[P1] should show 404 for unknown routes', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist-xyz');
    // Should either return 404 status or show a 404 page
    const status = response?.status();
    const bodyText = await page.textContent('body');
    const is404 = status === 404 || bodyText?.includes('404') || bodyText?.toLowerCase().includes('not found');
    expect(is404).toBe(true);
  });
});
