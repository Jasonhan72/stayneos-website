import { test, expect } from '@playwright/test';

/**
 * map-cluster.spec.ts
 *
 * Google Maps integration: zoom controls render, zooming out clusters nearby
 * markers, and clicking a cluster reveals the bottom card strip.
 *
 * The Maps API key is referrer-restricted to production domains, so on
 * localhost / CI this test skips (same pattern as the D1-dependent tests).
 * Against a production/preview origin with a usable key it exercises the
 * full zoom → cluster → card-strip flow.
 */
test('map zoom-out reveals cluster marker and opens card strip', async ({ page }) => {
  await page.goto('/properties');

  const map = page.getByTestId('properties-map');
  await expect(map).toBeVisible({ timeout: 25_000 });

  // Wait for either the Google map to render or the auth-failure fallback.
  await page.waitForFunction(
    () =>
      document.querySelector('.gm-style') !== null ||
      document.body.innerText.includes('Google Maps could not load'),
    null,
    { timeout: 25_000 }
  );

  const fallback = page.locator('text=Google Maps could not load');
  if ((await fallback.count()) > 0) {
    test.skip(true, 'Google Maps API key unavailable in this environment (referrer-restricted)');
    return;
  }

  // Google Maps zoom-out control ("Zoom out").
  const zoomOut = page.locator('button[aria-label="Zoom out"], [title="Zoom out"]').first();
  await expect(zoomOut).toBeVisible({ timeout: 10_000 });

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
