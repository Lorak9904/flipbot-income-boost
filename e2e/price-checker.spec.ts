import AxeBuilder from '@axe-core/playwright';
import { expect, Page, test } from '@playwright/test';

const comparables = [80, 100, 120, 140, 160].map((price, index) => ({
  provider_item_id: `item-${index + 1}`,
  title: `Comparable phone ${index + 1}`,
  condition: 'Used',
  price: String(price),
  currency: 'USD',
  shipping_price: index === 0 ? '10' : '',
  shipping_currency: 'USD',
  delivered_price: index === 0 ? '90' : '',
  item_url: `https://example.test/item-${index + 1}`,
  image_url: '',
  marketplace_id: 'EBAY_US',
  seller_username: '',
  buying_options: ['FIXED_PRICE'],
  item_end_date: '',
}));

const completedResult = {
  id: 'check-1',
  provider: 'ebay',
  marketplace_id: 'EBAY_US',
  search_mode: 'keyword',
  query: 'private test query',
  condition: '',
  images: [],
  sampled_items: comparables,
  stats: {},
  currency: 'USD',
  sample_count: comparables.length,
  lowest_price: '80',
  highest_price: '160',
  average_price: '120',
  median_price: '120',
  typical_low_price: '90',
  typical_high_price: '130',
  status: 'completed',
  error_message: '',
};

async function prepare(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('flipit_cookie_consent', 'essential');
  });
  await page.route('**/api/auth/user/**', (route) =>
    route.fulfill({ status: 401, contentType: 'application/json', body: '{}' }),
  );
  await page.route('**/api/cookies/consent/**', (route) =>
    route.fulfill({ status: 204, body: '' }),
  );
  await page.route('**/api/observability/**', (route) =>
    route.fulfill({ status: 204, body: '' }),
  );
}

async function submitText(page: Page, query = 'iPhone 13 128 GB used') {
  const input = page.getByLabel('What are you pricing?');
  await input.fill(query);
  await input.press('Enter');
}

test('text search submits only on Enter, prevents duplicates, and leads with a recalculating range', async ({ page }) => {
  await prepare(page);
  let requestCount = 0;
  await page.route(/\/api\/price-checks\/$/, async (route) => {
    requestCount += 1;
    await new Promise((resolve) => setTimeout(resolve, 750));
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(completedResult) });
  });

  await page.goto('/price-checker');
  const input = page.getByLabel('What are you pricing?');
  await input.fill('iPhone 13');
  await expect.poll(() => requestCount).toBe(0);
  await Promise.all([input.press('Enter'), input.press('Enter')]);

  await expect(page.getByText('Typical asking range')).toBeVisible();
  await expect(page.getByText('$90.00 – $130.00')).toBeVisible();
  await expect(page.getByText('Based on 5 comparable listings · Source market: eBay United States')).toBeVisible();
  expect(requestCount).toBe(1);

  await page.getByLabel('Use in estimate').last().click();
  await expect(page.getByText('$95.00 – $125.00')).toBeVisible();
  await expect(page.getByText('Median with delivery')).toHaveCount(0);
});

test('one photo auto-submits once and Polish copy explains the temporary DE/EUR fallback', async ({ page }) => {
  await prepare(page);
  let createCount = 0;
  let payload: Record<string, unknown> | undefined;
  await page.route('**/api/price-checks/images/presign/', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        url: 'http://127.0.0.1:4173/mock-price-upload',
        key: 'price-checks/test/photo.png',
        public_url: 'https://images.example.test/photo.png',
        content_type: 'image/png',
        size: 68,
      }),
    }),
  );
  await page.route('**/mock-price-upload', (route) => route.fulfill({ status: 200, body: '' }));
  await page.route(/\/api\/price-checks\/$/, async (route) => {
    createCount += 1;
    payload = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ...completedResult,
        marketplace_id: 'EBAY_DE',
        search_mode: 'image',
        currency: 'EUR',
        sampled_items: comparables.map((item) => ({ ...item, marketplace_id: 'EBAY_DE', currency: 'EUR' })),
      }),
    });
  });

  await page.goto('/pl/wycena-przedmiotu');
  await page.getByRole('button', { name: 'Wyszukaj po zdjęciu' }).click();
  await expect(page.getByText(/eBay Niemcy w EUR/)).toBeVisible();
  await page.getByLabel('Wybierz wyraźne zdjęcie').setInputFiles({
    name: 'phone.png',
    mimeType: 'image/png',
    buffer: Buffer.from('89504e470d0a1a0a', 'hex'),
  });

  await expect(page.getByText('Typowy zakres cen ofertowych')).toBeVisible();
  expect(createCount).toBe(1);
  expect(payload).toMatchObject({ search_mode: 'image', marketplace_id: 'EBAY_DE' });
  expect((payload?.images as unknown[]).length).toBe(1);

  await page.getByRole('button', { name: 'Wpisz, co sprzedajesz' }).click();
  await page.getByLabel('Co chcesz wycenić?').fill('używany telefon');
  await page.getByLabel('Co chcesz wycenić?').press('Enter');
  await expect.poll(() => payload?.marketplace_id).toBe('EBAY_PL');
});

test('safe localized errors preserve input and the client stops a stalled request', async ({ page }) => {
  test.setTimeout(20_000);
  await prepare(page);
  await page.clock.install();
  let responseMode: 'rate_limited' | 'stalled' = 'rate_limited';
  await page.route(/\/api\/price-checks\/$/, async (route) => {
    if (responseMode === 'rate_limited') {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'provider-specific details must not be displayed' }),
      });
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 15_000));
  });

  await page.goto('/price-checker');
  await submitText(page, 'Keep this private description');
  await expect(page.getByRole('alert')).toContainText('Too many price checks were requested');
  await expect(page.getByRole('alert')).not.toContainText('provider-specific');
  await expect(page.getByLabel('What are you pricing?')).toHaveValue('Keep this private description');

  responseMode = 'stalled';
  await page.getByLabel('What are you pricing?').press('Enter');
  await page.clock.fastForward(10_100);
  await expect(page.getByRole('alert')).toContainText('took too long to respond');
  await expect(page.getByLabel('What are you pricing?')).toHaveValue('Keep this private description');
});

test('mobile flow has no overflow or critical accessibility violations', async ({ page }) => {
  await prepare(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route(/\/api\/price-checks\/$/, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(completedResult) }),
  );

  await page.goto('/price-checker');
  await submitText(page);
  await expect(page.getByText('Typical asking range')).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);

  const results = await new AxeBuilder({ page }).include('main').disableRules(['color-contrast']).analyze();
  expect(results.violations.filter((violation) => violation.impact === 'critical')).toEqual([]);
});

test('analytics properties are low-cardinality and exclude item text or image data', async ({ page }) => {
  await prepare(page);
  await page.goto('/price-checker');
  const properties = await page.evaluate(async () => {
    const analytics = await import('/src/lib/analytics/price-checker.ts');
    return {
      started: analytics.priceCheckStartedProperties('keyword', 'EBAY_US'),
      completed: analytics.priceCheckCompletedProperties('image', 'EBAY_DE', 'completed', 5),
      failed: analytics.priceCheckFailedProperties('image', 'EBAY_DE', 'timeout'),
    };
  });

  expect(properties).toEqual({
    started: { mode: 'keyword', marketplace_id: 'EBAY_US', outcome: 'started' },
    completed: { mode: 'image', marketplace_id: 'EBAY_DE', outcome: 'completed', sample_count: 5 },
    failed: { mode: 'image', marketplace_id: 'EBAY_DE', outcome: 'failed', failure_type: 'timeout' },
  });
  expect(JSON.stringify(properties)).not.toMatch(/query|description|filename|photo_url|item_title|storage_key/i);
});
