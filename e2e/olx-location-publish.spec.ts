import { expect, Page, test } from '@playwright/test';

const TEST_ITEM_UUID = 'olx-location-item';
const TEST_IMAGE_DATA_URI =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
const AUTH_USER = {
  id: 'olx-location-user',
  name: 'OLX Location User',
  email: 'olx-location@example.com',
  provider: 'email',
  language: 'en',
};

function makeJwtToken() {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const payload = Buffer.from(
    JSON.stringify({ sub: AUTH_USER.id, exp: Math.floor(Date.now() / 1000) + 3600 }),
  ).toString('base64');
  return `${header}.${payload}.signature`;
}

async function prepareOlxEditor(page: Page) {
  await page.addInitScript(
    ({ authToken, user }) => {
      localStorage.setItem('flipit_token', authToken);
      localStorage.setItem('flipit_refresh_token', 'refresh-e2e');
      localStorage.setItem('flipit_user', JSON.stringify(user));
      localStorage.setItem('flipit_cookie_consent', 'essential');
    },
    { authToken: makeJwtToken(), user: AUTH_USER },
  );

  await page.route('**/api/auth/user/', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(AUTH_USER) }),
  );
  await page.route('**/api/auth/ping/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"ok"}' }),
  );
  await page.route('**/api/cookies/visitor/ping/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"ok"}' }),
  );
  await page.route('**/api/observability/app-route/', (route) => route.fulfill({ status: 204, body: '' }));
  await page.route('**/api/credits/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ plan: 'start', publish_remaining: 5, image_remaining: 5 }),
    }),
  );
  await page.route('**/api/user/profile/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(AUTH_USER) }),
  );
  await page.route('**/api/items/stats/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '{"total_items":0,"published_items":0,"draft_items":0}',
    }),
  );
  await page.route(/\/api\/items\/\?.*$/, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '{"items":[],"total":0,"total_pages":0,"page":1}',
    }),
  );
  await page.route('**/api/platforms/health-check/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        platforms: {
          facebook: { stored: false, status: null },
          olx: {
            stored: true,
            status: 'valid',
            accounts: [
              { country_code: 'PL', country_name: 'Poland', connected: true, status: 'valid', is_default: true },
              { country_code: 'BG', country_name: 'Bulgaria', connected: true, status: 'valid' },
            ],
            countries: [],
          },
          vinted: { stored: false, status: null },
          ebay: { stored: false, status: null },
          allegro: { stored: false, status: null },
          etsy: { stored: false, status: null, app_configured: true },
        },
      }),
    }),
  );
  await page.route('**/api/platforms/capabilities/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        version: 1,
        statuses: ['certified', 'beta', 'experimental', 'unavailable'],
        operations: ['publish'],
        marketplaces: {
          facebook: { integration_method: 'session_based', overall_status: 'unavailable', capabilities: {} },
          olx: {
            integration_method: 'official_api',
            overall_status: 'experimental',
            capabilities: {
              publish: { status: 'experimental', available: true, reason_code: 'implemented_not_certified' },
            },
          },
          vinted: { integration_method: 'session_based', overall_status: 'unavailable', capabilities: {} },
          ebay: { integration_method: 'official_api', overall_status: 'unavailable', capabilities: {} },
          allegro: { integration_method: 'official_api', overall_status: 'unavailable', capabilities: {} },
          etsy: { integration_method: 'official_api', overall_status: 'unavailable', capabilities: {} },
        },
      }),
    }),
  );
  await page.route(new RegExp(`/api/items/${TEST_ITEM_UUID}/$`), (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: TEST_ITEM_UUID,
        uuid: TEST_ITEM_UUID,
        title: 'OLX location jacket',
        description: 'A jacket prepared for OLX location testing.',
        price: 49,
        currency: 'PLN',
        status: 'draft',
        stage: 'draft',
        brand: 'Other',
        category: 'Jackets',
        condition: 'good',
        size: 'M',
        images: [TEST_IMAGE_DATA_URI],
        platform_listing_overrides: {
          olx: { country_code: 'PL', category_id: 100, category_path: 'Fashion > Jackets' },
        },
        marketplace_attributes: {},
        platforms: [],
        publish_results: [],
      }),
    }),
  );
  await page.route('**/api/olx/categories/path/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ selected: { category_id: 100, path: 'Fashion > Jackets' } }),
    }),
  );
  await page.route('**/api/platforms/olx/attributes/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        platform: 'olx',
        category_id: '100',
        fields: [
          {
            key: 'delivery',
            label: 'Delivery package',
            required: true,
            type: 'multi_select',
            options: [
              { value: 'courier', label: 'Courier' },
              { value: 'parcel-locker', label: 'Parcel locker' },
            ],
          },
        ],
        required_fields: [],
      }),
    }),
  );
  await page.route('**/api/olx/locations/cities/**', (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.includes('/districts/')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ city_id: 10, count: 1, results: [{ id: 20, name: 'Old Town' }] }),
      });
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ count: 2, results: [{ id: 10, name: 'Warsaw' }, { id: 11, name: 'Wroclaw' }] }),
    });
  });
}

test('OLX city, district, and delivery reach publish payload and reset with city or country', async ({ page }) => {
  await prepareOlxEditor(page);
  const publishPayloads: Array<Record<string, unknown>> = [];
  await page.route('**/api/items/publish/', async (route) => {
    publishPayloads.push(route.request().postDataJSON() as Record<string, unknown>);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        uuid: TEST_ITEM_UUID,
        platforms: { olx: 'error' },
        platform_details: { olx: { platform: 'olx', status: 'error', detail: 'OLX test failure' } },
      }),
    });
  });

  await page.goto(`/add-item?edit=${TEST_ITEM_UUID}&mode=republish&publish=olx`);

  const cityInput = page.getByLabel('OLX city');
  const districtSelect = page
    .getByText('OLX district', { exact: true })
    .locator('..')
    .getByRole('combobox')
    .first();
  await cityInput.fill('War');
  await page.getByRole('button', { name: 'Warsaw' }).click();
  await districtSelect.click();
  await page.getByRole('option', { name: 'Old Town' }).click();
  await page.getByText('Courier', { exact: true }).click();

  await page.getByRole('button', { name: 'Publish Item' }).click();
  await expect.poll(() => publishPayloads.length).toBe(1);
  expect(publishPayloads[0]).toMatchObject({
    platforms: ['olx'],
    platform_listing_overrides: {
      olx: {
        country_code: 'PL',
        category_id: 100,
        location: { city_id: 10, city_name: 'Warsaw', district_id: '20', district_name: 'Old Town' },
        ad_delivery: { delivery_package_ids: ['courier'] },
      },
    },
  });

  await cityInput.fill('Wro');
  await expect(districtSelect).toBeDisabled();
  await page.getByRole('button', { name: 'Publish Item' }).click();
  await expect.poll(() => publishPayloads.length).toBe(2);
  const cityResetOverrides = publishPayloads[1].platform_listing_overrides as {
    olx: Record<string, unknown>;
  };
  expect(cityResetOverrides.olx).not.toHaveProperty('location');

  const countrySelect = page
    .getByText('OLX country', { exact: true })
    .locator('..')
    .locator('..')
    .getByRole('combobox')
    .first();
  await countrySelect.click();
  await page.getByRole('option', { name: 'Bulgaria' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Change country' }).click();

  await expect(page.getByLabel('OLX city')).toHaveValue('');
  await expect(
    page.getByText('OLX district', { exact: true }).locator('..').getByRole('combobox').first(),
  ).toBeDisabled();
  await expect(page.getByText('No OLX category selected.')).toBeVisible();
});
