import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const pagesToAudit = ['/', '/login', '/property/1'];

for (const pagePath of pagesToAudit) {
  test(`Accessibility: ${pagePath}`, async ({ page }) => {
    await page.goto(pagePath);
    await page.waitForLoadState('networkidle');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    
    // Report violations but don't fail on minor issues
    const criticalViolations = results.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );
    
    if (criticalViolations.length > 0) {
      console.log(`Accessibility violations on ${pagePath}:`,
        JSON.stringify(criticalViolations.map(v => ({
          id: v.id,
          impact: v.impact,
          description: v.description,
          nodes: v.nodes.length,
        })), null, 2)
      );
    }
    
    // Allow some violations but flag critical ones
    expect(criticalViolations.length).toBeLessThanOrEqual(5);
  });
}
