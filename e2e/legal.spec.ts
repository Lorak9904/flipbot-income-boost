import { expect, test } from '@playwright/test';

const legalRoutes = [
  {
    path: '/terms',
    language: 'en',
    title: 'Terms of Service',
    updatedLabel: 'Last updated: 28 June 2026',
    dateModified: '2026-06-28',
  },
  {
    path: '/pl/regulamin',
    language: 'pl',
    title: 'Regulamin',
    updatedLabel: 'Ostatnia aktualizacja: 28 czerwca 2026',
    dateModified: '2026-06-28',
  },
  {
    path: '/privacy',
    language: 'en',
    title: 'Privacy Policy',
    updatedLabel: 'Last updated: 21 July 2026',
    dateModified: '2026-07-21',
  },
  {
    path: '/pl/polityka-prywatnosci',
    language: 'pl',
    title: 'Polityka prywatności',
    updatedLabel: 'Ostatnia aktualizacja: 21 lipca 2026',
    dateModified: '2026-07-21',
  },
  {
    path: '/cookies',
    language: 'en',
    title: 'Cookie Policy',
    updatedLabel: 'Last updated: 21 July 2026',
    dateModified: '2026-07-21',
  },
  {
    path: '/pl/polityka-cookies',
    language: 'pl',
    title: 'Polityka cookies',
    updatedLabel: 'Ostatnia aktualizacja: 21 lipca 2026',
    dateModified: '2026-07-21',
  },
] as const;

for (const legalRoute of legalRoutes) {
  test(`${legalRoute.path} renders localized legal metadata`, async ({ page }) => {
    await page.goto(legalRoute.path);

    await expect(page).toHaveURL(new RegExp(`${legalRoute.path.replaceAll('/', '\\/')}$`));
    await expect(page.locator('html')).toHaveAttribute('lang', legalRoute.language);
    await expect(page.getByRole('heading', { level: 1, name: legalRoute.title })).toBeVisible();
    await expect(
      page.locator('section > div').first().getByText(legalRoute.updatedLabel, { exact: true }),
    ).toBeVisible();

    const webPageStructuredData = await page.locator('script[type="application/ld+json"]').evaluateAll(
      (scripts) => scripts
        .map((script) => JSON.parse(script.textContent ?? '{}'))
        .find((entry) => entry['@type'] === 'WebPage'),
    );

    expect(webPageStructuredData).toMatchObject({
      '@type': 'WebPage',
      inLanguage: legalRoute.language,
      dateModified: legalRoute.dateModified,
    });
  });
}
