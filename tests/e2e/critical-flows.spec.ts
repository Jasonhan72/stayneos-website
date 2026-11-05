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

test('register -> login -> bookings -> logout', async ({ page }) => {
  const seed = Date.now();
  const email = `e2e+${seed}@example.com`;
  const password = 'Passw0rd!';

  // Register
  await page.goto('/register');
  await page.fill('#firstName', 'E2E');
  await page.fill('#lastName', 'User');
  await page.fill('#email', email);
  await page.fill('#password', password);
  await page.fill('#confirmPassword', password);
  await page.getByRole('button', { name: /join now|create|注册|账户|compte/i }).click();

  // Wait for redirect after registration.
  // On preview environments without D1, the API may fail silently.
  try {
    await page.waitForURL(/\/$/, { timeout: 15_000 });
  } catch {
    const stillOnRegister = /\/register/.test(page.url());
    if (stillOnRegister) {
      if (process.env.PLAYWRIGHT_BASE_URL || process.env.E2E_REQUIRE_AUTH) throw new Error('Registration API unavailable in configured preview');
      test.skip(true, 'Registration API unavailable (likely no D1 on preview)');
      return;
    }
  }

  // Verify the guest booking area after registration
  await page.goto('/bookings');
  await expect(page).toHaveURL(/\/bookings/);

  // Logout and login again
  await page.getByRole('button', { name: /^(User menu|用户菜单|Menu utilisateur)$/i }).click();
  await page.locator('nav').getByRole('button', { name: /log out|logout|退出|déconnexion/i }).click();
  await expect(page).toHaveURL(/\/$/);
  await page.goto('/login');
  await page.fill('#email', email);
  await page.fill('#password', password);
  await page.locator('form').filter({ has: page.locator('#password') }).locator('button[type="submit"]').click();

  try {
    await page.waitForURL(/\/$/, { timeout: 15_000 });
  } catch {
    if (process.env.PLAYWRIGHT_BASE_URL || process.env.E2E_REQUIRE_AUTH) throw new Error('Login API unavailable in configured preview');
    test.skip(true, 'Login API unavailable (likely no D1 on preview)');
    return;
  }

  await page.goto('/bookings');
  await expect(page).toHaveURL(/\/bookings/);

  // Logout
  await page.getByRole('button', { name: /^(User menu|用户菜单|Menu utilisateur)$/i }).click();
  await page.locator('nav').getByRole('button', { name: /log out|logout|退出|déconnexion/i }).click();
  await expect(page).toHaveURL(/\/$/);
});

test('language route consistency (zh/en/fr)', async ({ browser }) => {
  const cases = [
    { path: '/zh/properties', pattern: /房源|租/, selector: 'html' },
    { path: '/properties', pattern: /Properties/i, selector: 'h1' },
    { path: '/fr/properties', pattern: /propriét|location/i, selector: 'html' },
  ];

  for (const localeCase of cases) {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(localeCase.path);
    await expect(page.locator(localeCase.selector)).toContainText(localeCase.pattern);
    await context.close();
  }
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

test('switching languages keeps the current page, query and anchor after reload', async ({ page }) => {
  await page.goto('/login?next=%2Fprofile#form');
  for (const [label, prefix, lang] of [
    ['中文', '/zh', 'zh-CN'],
    ['Français', '/fr', 'fr-CA'],
    ['English', '', 'en'],
  ]) {
    const toggle = page.locator('nav').getByRole('button', { name: /^(EN|FR|中文),/ });
    await toggle.click();
    await toggle.locator('..').getByRole('button', { name: new RegExp(label + '$') }).click();
    const target = prefix + '/login?next=%2Fprofile#form';
    await expect(page).toHaveURL(url => url.pathname + url.search + url.hash === target);
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
    await expect(page.locator('#password')).toBeVisible();
  }
});

test('prefetching a translation leaves the visitor’s language preference intact', async ({ request }) => {
  const response = await request.get('/zh/about', { headers: { rsc: '1', 'sec-fetch-dest': 'empty' } });
  expect(response.ok()).toBeTruthy();
  expect(response.headers()['set-cookie'] || '').not.toContain('stayneos_locale=');
  const navigation = await request.get('/zh/about', { headers: { 'sec-fetch-dest': 'document', accept: 'text/html' } });
  expect(navigation.headers()['set-cookie']).toContain('stayneos_locale=zh');
});

test('a legacy alias keeps explicit English over a previous language preference', async ({ request }) => {
  const response = await request.get('/en/wishlists?ref=account', {
    headers: { cookie: 'stayneos_locale=fr' },
    maxRedirects: 0,
  });
  expect(response.status()).toBe(308);
  const location = new URL(response.headers().location, response.url());
  expect(location.pathname + location.search).toBe('/en/dashboard/wishlists?ref=account');
});
