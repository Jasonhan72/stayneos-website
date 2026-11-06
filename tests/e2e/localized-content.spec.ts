import { test, expect } from '@playwright/test';

const homes = [
  { locale: 'zh-CN', label: '中文', path: '/zh', service: '服务区域', title: '多伦多精装公寓', owner: '业主自营', property: '库珀街 55 号 · 湖滨高层三居套房', price: '起租价' },
  { locale: 'fr-CA', label: 'Français', path: '/fr', service: 'Quartiers desservis', title: 'Appartements meublés à Toronto', owner: 'Gestion directe par le propriétaire', property: '55 Cooper St (Sugar Wharf) · Suite haut de gamme de trois chambres en étage élevé', price: 'À partir de' },
  { locale: 'en', label: 'English', path: '/', service: 'Service areas', title: 'Toronto furnished apartments', owner: 'Owner-Operated', property: '55 Cooper St (Sugar Wharf) · Premium 3BR Sky Suite', price: 'From' },
];

for (const mobile of [false, true]) {
  test(`homepage content follows the ${mobile ? 'mobile' : 'desktop'} language menu`, async ({ page }) => {
    if (mobile) await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/?ref=language#home');
    for (const home of homes) {
      if (mobile) {
        await page.locator('nav button').filter({ has: page.locator('svg.lucide-menu') }).click();
        const drawer = page.locator('div.fixed.translate-x-0');
        await drawer.getByRole('button', { name: /CAD|USD/ }).click();
        await drawer.getByRole('button', { name: new RegExp(home.label + '$') }).click();
      } else {
        const toggle = page.locator('nav').getByRole('button', { name: /^(EN|中文|FR),/ });
        await toggle.click();
        await toggle.locator('..').getByRole('button', { name: new RegExp(home.label + '$') }).click();
      }
      await expect(page).toHaveURL(url => url.pathname === home.path && url.search === '?ref=language' && url.hash === '#home');
      for (const refresh of [false, true]) {
        if (refresh) await page.reload({ waitUntil: 'domcontentloaded' });
        await expect(page.locator('html')).toHaveAttribute('lang', home.locale);
        const main = page.getByRole('main');
        await expect(main.getByRole('heading', { name: home.title, exact: true })).toBeVisible();
        await expect(main.getByRole('heading', { name: home.owner, exact: true })).toBeVisible();
        await expect(main).toContainText(home.property);
        await expect(main).toContainText(home.service);
        await expect(main).toContainText(home.price);
        if (home.locale !== 'en') {
          await expect(main).not.toContainText("We don't just list properties");
          await expect(main).not.toContainText('Premium 3BR Sky Suite');
          await expect(main).not.toContainText('Built around the places');
        } else {
          await expect(main).not.toContainText(/[\u3400-\u9fff]/);
        }
      }
    }
  });
}

test('Chinese marketing pages translate the cards, forms and tab titles', async ({ page }) => {
  for (const [path, title, translated, leaked] of [
    ['/zh/for-hosts', '业主合作', '稳定的月租收入', 'Steady Monthly Income'],
    ['/zh/for-business', '多伦多企业住房', '项目团队住房', 'Project Team Housing'],
    ['/zh/long-term', '多伦多长租公寓', '每年最多节省 12,600 元', 'Total Savings'],
  ]) {
    await page.goto(path);
    await expect(page).toHaveTitle(new RegExp(title));
    await expect(page.locator('body')).toContainText(translated);
    await expect(page.locator('body')).not.toContainText(leaked);
  }
});
