import { test, expect } from '@playwright/test';

const PASSWORD = 'E2eTestPass1!';

/**
 * register-and-login.spec.ts
 *
 * Critical path: user registers, verifies navbar reflects auth state,
 * then logs out/in again and confirms the profile page shows their email.
 *
 * On preview environments where D1 is not configured, the registration
 * API may fail. The test handles this gracefully by skipping.
 */
test.describe('Register and Login flow', () => {
  test('register -> navbar shows avatar -> profile shows email', async ({ page }) => {
    const seed = Date.now();
    const email = `e2e-${seed}@test.stayneos.com`;

    // ── Register ──
    await page.goto('/register');
    await expect(page.locator('h2')).toContainText('Create Account');

    await page.fill('#firstName', 'E2E');
    await page.fill('#lastName', 'User');
    await page.fill('#email', email);
    await page.fill('#password', PASSWORD);
    await page.fill('#confirmPassword', PASSWORD);

    await page.getByRole('button', { name: /create account/i }).click();

    // Wait for redirect after registration.
    // On preview environments without D1, the API call may fail silently.
    try {
      await page.waitForURL(/\/$/, { timeout: 15_000 });
    } catch {
      const stillOnRegister = /\/register/.test(page.url());
      if (stillOnRegister) {
        if (process.env.PLAYWRIGHT_BASE_URL || process.env.E2E_REQUIRE_AUTH) throw new Error('Registration API unavailable in configured preview');
        test.skip(true, 'Registration API unavailable (likely no D1 on preview)');
        return;
      }
      throw new Error('Unexpected state after registration');
    }

    // Give React a tick to hydrate the UserMenu
    await page.waitForTimeout(1500);

    // ── Verify auth: no "Sign Up" / "Log In" links visible ──
    await expect(page.getByRole('link', { name: /sign up|register/i })).not.toBeVisible();
    // UserMenu button should be present (aria-haspopup="true")
    const userMenuBtn = page.getByRole('button', { name: /^(User menu|用户菜单|Menu utilisateur)$/i });
    await expect(userMenuBtn).toBeVisible({ timeout: 5000 });

    // ── Navigate to profile and confirm email ──
    await page.goto('/profile');
    await expect(page.locator('main')).toContainText(email);

    // ── Log out ──
    await page.goto('/');
    await page.waitForTimeout(500);
    // Open the user menu
    await page.getByRole('button', { name: /^(User menu|用户菜单|Menu utilisateur)$/i }).click();
    await page.locator('nav').getByRole('button', { name: /log out|logout|退出|déconnexion/i }).click();
    await page.waitForTimeout(1000);

    // ── Log back in ──
    await page.goto('/login');
    await page.fill('#email', email);
    await page.fill('#password', PASSWORD);
    await page.locator('form').filter({ has: page.locator('#password') }).locator('button[type="submit"]').click();

    // After login the app redirects to / (home)
    await page.waitForURL(/\/$/);
    await page.waitForTimeout(1500);

    // ── Verify auth again ──
    await expect(page.getByRole('button', { name: /^(User menu|用户菜单|Menu utilisateur)$/i })).toBeVisible({ timeout: 5000 });

    // ── Profile still shows email ──
    await page.goto('/profile');
    await expect(page.locator('main')).toContainText(email);
  });
});
