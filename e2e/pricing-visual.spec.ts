import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('flipit_cookie_consent', 'essential');
  });
});

test('pricing controls remain accessible and preserve billing behavior', async ({ page }) => {
  await page.goto('/pricing');

  const annual = page.getByRole('button', { name: 'Annual', exact: true });
  const monthly = page.getByRole('button', { name: 'Monthly', exact: true });
  await annual.click();
  await expect(annual).toHaveAttribute('aria-pressed', 'true');
  await expect(monthly).toHaveAttribute('aria-pressed', 'false');

  const usd = page.getByRole('button', { name: 'USD', exact: true });
  await usd.click();
  await expect(usd).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('77 USD', { exact: true })).toBeVisible();

  await monthly.press('Tab');
  await expect(annual).toBeFocused();
  await expect(annual).toHaveCSS('box-shadow', /rgb/);
});

for (const viewport of [
  { name: 'desktop EN', width: 1440, height: 1024, path: '/pricing' },
  { name: 'tablet EN', width: 1024, height: 1024, path: '/pricing' },
  { name: 'mobile PL', width: 390, height: 844, path: '/pl/cennik' },
] as const) {
  test(`${viewport.name} pricing has no horizontal overflow`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto(viewport.path);

    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }));

    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
    await expect(page.locator('[data-pricing-card-index]')).toHaveCount(4);
  });
}

test('pricing honors reduced motion and passes scoped color contrast', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/pricing');

  const toggleIndicator = page.locator('[role="group"]').locator('[aria-hidden="true"]');
  await expect(toggleIndicator).toHaveCSS('transition-property', 'none');

  const results = await new AxeBuilder({ page })
    .include('main')
    .withRules(['color-contrast'])
    .analyze();

  expect(results.violations).toEqual([]);
});
