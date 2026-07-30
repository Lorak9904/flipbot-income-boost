import AxeBuilder from '@axe-core/playwright';
import { expect, Page, test } from '@playwright/test';

async function seedEssentialConsent(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('flipit_cookie_consent', 'essential');
  });
}

for (const viewport of [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet boundary', width: 768, height: 1024 },
] as const) {
test(`${viewport.name} pricing controls remain accessible and preserve billing behavior`, async ({ page }) => {
  await seedEssentialConsent(page);
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
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

  const controlSizes = await page.locator('main button[aria-pressed]').evaluateAll((buttons) =>
    buttons.map((button) => {
      const box = button.getBoundingClientRect();
      return { width: box.width, height: box.height };
    })
  );
  expect(controlSizes).toHaveLength(5);
  for (const size of controlSizes) {
    expect(size.width).toBeGreaterThanOrEqual(44);
    expect(size.height).toBeGreaterThanOrEqual(44);
  }
});
}

for (const viewport of [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet boundary', width: 768, height: 1024 },
] as const) {
test(`${viewport.name} cookie consent choices meet the minimum touch target`, async ({ page }) => {
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  await page.goto('/pricing');

  const choices = page.getByRole('button').filter({
    hasText: /Allow optional|Only necessary/,
  });
  await expect(choices).toHaveCount(2);
  const choiceSizes = await choices.evaluateAll((buttons) =>
    buttons.map((button) => {
      const box = button.getBoundingClientRect();
      return { width: box.width, height: box.height };
    })
  );
  for (const size of choiceSizes) {
    expect(size.width).toBeGreaterThanOrEqual(44);
    expect(size.height).toBeGreaterThanOrEqual(44);
  }
});
}

for (const viewport of [
  { name: 'desktop EN', width: 1440, height: 1024, path: '/pricing' },
  { name: 'tablet EN', width: 1024, height: 1024, path: '/pricing' },
  { name: 'tablet boundary EN', width: 768, height: 1024, path: '/pricing' },
  { name: 'mobile PL', width: 390, height: 844, path: '/pl/cennik' },
] as const) {
  test(`${viewport.name} pricing has no horizontal overflow`, async ({ page }, testInfo) => {
    await seedEssentialConsent(page);
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto(viewport.path);

    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }));

    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
    await expect(page.locator('[data-pricing-card-index]')).toHaveCount(4);

    const navigationToggle = page.getByRole('button', {
      name: /Toggle navigation|Otwórz lub zamknij nawigację/,
    });
    if (viewport.width < 1280) {
      await expect(navigationToggle).toBeVisible();
    } else {
      await expect(navigationToggle).toBeHidden();
    }

    if (viewport.width === 768) {
      await page.screenshot({ path: testInfo.outputPath('pricing-en-768x1024.png') });
    }
  });
}

test('pricing honors reduced motion and passes scoped color contrast', async ({ page }) => {
  await seedEssentialConsent(page);
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
