import { test, expect } from '@playwright/test';

/**
 * map-cluster.spec.ts
 *
 * Google Maps integration: zoom controls render, zooming out clusters nearby
 * markers, and clicking a cluster reveals the bottom card strip.
 *
 * The Maps API key is referrer-restricted to production domains, so the real
 * map (and its zoom/cluster controls) only render against a production origin.
 * This spec is therefore opt-in: set RUN_MAP_E2E=1 and point Playwright's
 * baseURL at a production/preview origin with a usable key. In CI (and any
 * local run without the flag) it skips cleanly.
 */
test('map zoom-out reveals cluster marker and opens card strip', async ({ page }) => {
  test.skip(
    !process.env.RUN_MAP_E2E,
    'Google Maps key is referrer-restricted to production; set RUN_MAP_E2E=1 to run against a production origin'
  );

  await page.goto('/properties');

  const map = page.getByTestId('properties-map');
  await expect(map).toBeVisible({ timeout: 25_000 });

  // Google Maps zoom-out control ("Zoom out").
  const zoomOut = page.locator('button[aria-label="Zoom out"], [title="Zoom out"]').first();
  await expect(zoomOut).toBeVisible({ timeout: 15_000 });

  // Zoom out until a cluster marker ("N stays") appears. The initial fit-bounds
  // zoom keeps the few properties spread apart, so this may take several clicks.
  const clusterMarker = page.locator('[title*="stays"]').first();
  let found = false;
  for (let attempt = 0; attempt < 10; attempt += 1) {
    if ((await clusterMarker.count()) > 0) {
      found = true;
      break;
    }
    await zoomOut.click();
    await page.waitForTimeout(700);
  }
  expect(found, 'a cluster marker ("N stays") should appear after zooming out').toBe(true);

  // Clicking the cluster opens the horizontal card strip at the bottom.
  await clusterMarker.click();
  await expect(page.getByTestId('cluster-cards')).toBeVisible({ timeout: 10_000 });
});
