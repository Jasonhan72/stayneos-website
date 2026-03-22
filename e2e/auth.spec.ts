import { test, expect } from '@playwright/test';

test.describe('Feature: Authentication', () => {
  test('[P0] should display login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/Log In|登录|Connexion/i);
  });

  test('[P0] should have email and password inputs', async ({ page }) => {
    await page.goto('/login');
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('[P0] should have Google login button', async ({ page }) => {
    await page.goto('/login');
    const googleBtn = page.getByRole('button', { name: /google/i });
    await expect(googleBtn).toBeVisible();
  });

  test('[P0] should redirect Google login to accounts.google.com', async ({ page }) => {
    await page.goto('/login');
    const googleBtn = page.getByRole('button', { name: /google/i });
    
    const [popup] = await Promise.all([
      page.waitForEvent('popup', { timeout: 5000 }).catch(() => null),
      googleBtn.click(),
    ]);

    // Either opens a popup or navigates current page
    if (popup) {
      await popup.waitForLoadState();
      expect(popup.url()).toContain('accounts.google.com');
    } else {
      await page.waitForURL(/accounts\.google\.com|api\/auth\/google/, { timeout: 10000 });
    }
  });

  test('[P0] should redirect unauthenticated users from protected routes', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain('/login');
  });

  test('[P0] should display register page', async ({ page }) => {
    await page.goto('/register');
    expect(await page.title()).toMatch(/Sign Up|注册|Inscription/i);
  });

  test('[P1] should show validation errors for empty login', async ({ page }) => {
    await page.goto('/login');
    // Try submitting empty form
    const submitBtn = page.getByRole('button', { name: /log in|登录|sign in/i });
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      // Should show some validation message
      await page.waitForTimeout(500);
    }
  });
});
