import { test, expect } from '@playwright/test';

test('home -> properties -> property detail', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/NEOS|StayNeos/i);

  await page.getByRole('link', { name: /properties|房源|propriétés/i }).first().click();
  await expect(page).toHaveURL(/\/properties/);

  const firstPropertyLink = page.locator('a[href^="/property/"]').first();
  await expect(firstPropertyLink).toBeVisible();
  await firstPropertyLink.click();

  await expect(page).toHaveURL(/\/property\//);
  await expect(page.locator('main')).toBeVisible();
});

test('register -> login -> dashboard -> logout', async ({ page, browserName }) => {
  // Skip in CI without D1 database binding
  test.skip(!!process.env.CI, 'Requires D1 database - run against staging');

  const seed = Date.now();
  const email = `e2e+${seed}@example.com`;
  const password = 'Passw0rd!';

  await page.goto('/register');
  await page.fill('#firstName', 'E2E');
  await page.fill('#lastName', 'User');
  await page.fill('#email', email);
  await page.fill('#password', password);
  await page.fill('#confirmPassword', password);
  await page.getByRole('button', { name: /join now|create|注册|账户|compte/i }).click();

  await page.waitForURL(/\/dashboard/, { timeout: 20_000 });
  await expect(page).toHaveURL(/\/dashboard/);

  await page.goto('/login');
  await page.fill('#email', email);
  await page.fill('#password', password);
  await page.getByRole('button', { name: /sign in|登录|connexion/i }).click();
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/dashboard/);

  await page.locator('button[aria-haspopup="true"]').first().click();
  await page.getByRole('button', { name: /logout|退出|déconnexion/i }).click();
  await expect(page).toHaveURL(/\/$/);
});

test('language switching consistency (zh/en/fr)', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /EN|中文|FR|English|Français/i }).first().click();
  await page.getByRole('button', { name: /中文/ }).click();
  await page.goto('/properties');
  await expect(page.locator('html')).toContainText(/房源|租/);

  await page.goto('/');
  await page.getByRole('button', { name: /EN|中文|FR|English|Français/i }).first().click();
  await page.getByRole('button', { name: /English/ }).click();
  await page.goto('/properties');
  await expect(page.locator('h1')).toContainText(/Properties/i);

  await page.goto('/');
  await page.getByRole('button', { name: /EN|中文|FR|English|Français/i }).first().click();
  await page.getByRole('button', { name: /Français/ }).click();
  await page.goto('/properties');
  await expect(page.locator('html')).toContainText(/propriét|location/i);
});

test('mobile responsive smoke (375 viewport)', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('nav')).toBeVisible();
  await expect(page.locator('body')).toBeVisible();
  await context.close();
});

test('404 page is shown', async ({ page }) => {
  await page.goto('/this-page-should-not-exist-404');
  await expect(page.getByRole('heading', { name: /not found|页面未找到|introuvable/i })).toBeVisible();
});
