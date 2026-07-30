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

type JsonObject = Record<string, unknown>;

interface OlxAccountFixture {
  country_code: string;
  country_name: string;
  connected: boolean;
  status: string;
  is_default?: boolean;
}

interface OlxEditorOptions {
  accounts?: OlxAccountFixture[];
  citySearchResults?: Array<{ id: number; name: string }>;
  failFirstCitySearch?: boolean;
  failFirstWarsawDistrictLookup?: boolean;
  initialOlxOverrides?: JsonObject;
}

const cloneJson = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const isJsonObject = (value: unknown): value is JsonObject =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

function makeJwtToken() {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const payload = Buffer.from(
    JSON.stringify({ sub: AUTH_USER.id, exp: Math.floor(Date.now() / 1000) + 3600 }),
  ).toString('base64');
  return `${header}.${payload}.signature`;
}

async function prepareOlxEditor(page: Page, options: OlxEditorOptions = {}) {
  const accounts =
    options.accounts ||
    [
      { country_code: 'PL', country_name: 'Poland', connected: true, status: 'valid', is_default: true },
      { country_code: 'BG', country_name: 'Bulgaria', connected: true, status: 'valid' },
    ];
  let storedPlatformOverrides: Record<string, JsonObject> = {
    olx: cloneJson(
      options.initialOlxOverrides || {
        country_code: 'PL',
        category_id: 100,
        category_path: 'Fashion > Jackets',
        attributes: { legacy_attribute: 'stale' },
        ad_delivery: { delivery_package_ids: ['legacy-package'] },
      },
    ),
    vinted: {
      catalog_id: 900,
      field_overrides: { title: 'Vinted-only title' },
      remote_listing_id: 'vinted-remote-123',
    },
  };
  const patchPayloads: JsonObject[] = [];
  let warsawDistrictAttempts = 0;
  let citySearchAttempts = 0;

  const applyPlatformOverrides = (incomingOverrides: JsonObject) => {
    const nextOverrides = cloneJson(storedPlatformOverrides);

    for (const [platform, incomingValue] of Object.entries(incomingOverrides)) {
      if (!isJsonObject(incomingValue)) continue;

      if (platform !== 'olx') {
        nextOverrides[platform] = {
          ...(nextOverrides[platform] || {}),
          ...cloneJson(incomingValue),
        };
        continue;
      }

      const { _replace, ...cleanOlxOverrides } = incomingValue;
      nextOverrides.olx =
        _replace === true
          ? cloneJson(cleanOlxOverrides)
          : { ...(nextOverrides.olx || {}), ...cloneJson(cleanOlxOverrides) };
    }

    storedPlatformOverrides = nextOverrides;
    return cloneJson(storedPlatformOverrides);
  };

  const itemResponse = () => ({
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
    platform_listing_overrides: cloneJson(storedPlatformOverrides),
    marketplace_attributes: {},
    platforms: [],
    publish_results: [],
  });

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
            accounts,
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
  await page.route(new RegExp(`/api/items/${TEST_ITEM_UUID}/$`), (route) => {
    if (route.request().method() === 'PATCH') {
      const payload = route.request().postDataJSON() as JsonObject;
      patchPayloads.push(payload);
      if (isJsonObject(payload.platform_listing_overrides)) {
        applyPlatformOverrides(payload.platform_listing_overrides);
      }
    }

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(itemResponse()),
    });
  });
  await page.route('**/api/olx/categories/path/**', (route) => {
    const categoryId = Number(new URL(route.request().url()).searchParams.get('category_id') || 100);
    const selected = {
      category_id: categoryId,
      name: categoryId === 200 ? 'Coats' : 'Jackets',
      path: categoryId === 200 ? 'Fashion > Coats' : 'Fashion > Jackets',
      parent_id: null,
      is_leaf: true,
    };
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ path: [selected], selected }),
    });
  });
  await page.route('**/api/olx/categories/search/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        query: 'Coa',
        count: 1,
        results: [
          {
            category_id: 200,
            name: 'Coats',
            path: 'Fashion > Coats',
            parent_id: null,
            is_leaf: true,
            has_children: false,
            ancestors: [],
          },
        ],
      }),
    }),
  );
  await page.route('**/api/olx/categories/tree/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ count: 0, results: [] }),
    }),
  );
  await page.route('**/api/platforms/olx/attributes/**', (route) => {
    const categoryId = new URL(route.request().url()).searchParams.get('category_id') || '100';
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        platform: 'olx',
        category_id: categoryId,
        fields: [
          {
            key: 'delivery',
            label: 'Delivery package',
            required: categoryId !== '100',
            type: 'multi_select',
            options: [
              { value: 'courier', label: 'Courier' },
              { value: 'parcel-locker', label: 'Parcel locker' },
            ],
          },
        ],
        required_fields: [],
      }),
    });
  });
  await page.route('**/api/olx/locations/cities/**', (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.includes('/districts/')) {
      const cityHasDistricts = url.pathname.includes('/cities/10/');
      if (cityHasDistricts) {
        warsawDistrictAttempts += 1;
      }
      if (
        cityHasDistricts &&
        options.failFirstWarsawDistrictLookup &&
        warsawDistrictAttempts === 1
      ) {
        return route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({ detail: 'Temporary OLX district failure' }),
        });
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          city_id: cityHasDistricts ? 10 : 11,
          count: cityHasDistricts ? 1 : 0,
          results: cityHasDistricts ? [{ id: 20, name: 'Old Town' }] : [],
        }),
      });
    }
    citySearchAttempts += 1;
    if (options.failFirstCitySearch && citySearchAttempts === 1) {
      return route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Temporary OLX city failure' }),
      });
    }
    const cityResults = options.citySearchResults || [
      { id: 10, name: 'Warsaw' },
      { id: 11, name: 'Wroclaw' },
    ];
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ count: cityResults.length, results: cityResults }),
    });
  });

  return {
    applyPlatformOverrides,
    getStoredPlatformOverrides: () => cloneJson(storedPlatformOverrides),
    getWarsawDistrictAttempts: () => warsawDistrictAttempts,
    getCitySearchAttempts: () => citySearchAttempts,
    patchPayloads,
  };
}

test('OLX city keyboard navigation keeps the active overflow option visible', async ({ page }) => {
  const citySearchResults = Array.from({ length: 12 }, (_, index) => ({
    id: 100 + index,
    name: `Test city ${index + 1}`,
  }));
  await prepareOlxEditor(page, { citySearchResults });
  await page.goto(`/add-item?edit=${TEST_ITEM_UUID}&mode=republish&publish=olx`);

  const cityInput = page.getByRole('combobox', { name: 'OLX city' });
  await cityInput.fill('Te');
  const listbox = page.getByRole('listbox');
  await expect(listbox).toBeVisible();
  for (let index = 0; index < 10; index += 1) await cityInput.press('ArrowDown');

  const activeId = await cityInput.getAttribute('aria-activedescendant');
  expect(activeId).toBeTruthy();
  const activeOption = page.locator(`#${activeId}`);
  await expect(activeOption).toHaveText('Test city 10');
  await expect
    .poll(() =>
      activeOption.evaluate((option) => {
        const optionRect = option.getBoundingClientRect();
        const listboxRect = option.parentElement!.getBoundingClientRect();
        return optionRect.top >= listboxRect.top && optionRect.bottom <= listboxRect.bottom;
      }),
    )
    .toBe(true);
});

test('OLX city search failure is retryable and remains required until selection', async ({ page }) => {
  const editor = await prepareOlxEditor(page, { failFirstCitySearch: true });
  await page.goto(`/add-item?edit=${TEST_ITEM_UUID}&mode=republish&publish=olx`);

  const cityInput = page.getByRole('combobox', { name: 'OLX city' });
  await cityInput.fill('Wa');
  await expect(page.getByText('Could not search OLX cities.')).toBeVisible();
  await expect(cityInput).toHaveAttribute('aria-required', 'true');
  await expect(cityInput).toHaveAttribute('aria-expanded', 'false');
  const retry = page.getByRole('button', { name: 'Try again' });
  await expect(retry).toHaveCSS('height', '44px');

  await retry.click();
  await expect.poll(() => editor.getCitySearchAttempts()).toBe(2);
  await page.getByRole('option', { name: 'Warsaw' }).click();
  await expect(cityInput).toHaveValue('Warsaw');
  await expect(page.getByText('Could not search OLX cities.')).toBeHidden();
  await expect(page.getByText('An OLX city is required before publishing.')).toBeHidden();
});

test('OLX city, district, and delivery reach publish payload and reset with city or country', async ({ page }) => {
  const editor = await prepareOlxEditor(page, { failFirstWarsawDistrictLookup: true });
  const publishPayloads: Array<Record<string, unknown>> = [];
  const canonicalOverridesAfterPublish: Array<Record<string, JsonObject>> = [];
  await page.route('**/api/items/publish/', async (route) => {
    const payload = route.request().postDataJSON() as Record<string, unknown>;
    publishPayloads.push(payload);
    if (isJsonObject(payload.platform_listing_overrides)) {
      canonicalOverridesAfterPublish.push(
        editor.applyPlatformOverrides(payload.platform_listing_overrides),
      );
    }
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

  const cityInput = page.getByRole('combobox', { name: 'OLX city' });
  const districtSelect = page.getByRole('combobox', { name: 'OLX district' });
  await cityInput.fill('Wr');
  await expect(page.getByRole('listbox')).toBeVisible();
  await cityInput.press('ArrowUp');
  const activeWroclawId = await cityInput.getAttribute('aria-activedescendant');
  expect(activeWroclawId).toBeTruthy();
  await expect(page.getByRole('option', { name: 'Wroclaw' })).toHaveAttribute(
    'id',
    activeWroclawId || '',
  );
  await cityInput.press('Escape');
  await expect(cityInput).toHaveAttribute('aria-expanded', 'false');
  await expect(cityInput).not.toHaveAttribute('aria-activedescendant', /.+/);
  await expect(page.getByRole('listbox')).toBeHidden();

  await cityInput.fill('Wro');
  await cityInput.press('Escape');
  await page.waitForTimeout(500);
  await expect(cityInput).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('listbox')).toBeHidden();

  await cityInput.fill('War');
  await expect(page.getByRole('listbox')).toBeVisible();
  await cityInput.press('ArrowDown');
  const activeWarsawId = await cityInput.getAttribute('aria-activedescendant');
  expect(activeWarsawId).toBeTruthy();
  await expect(page.getByRole('option', { name: 'Warsaw' })).toHaveAttribute(
    'id',
    activeWarsawId || '',
  );
  await cityInput.press('Enter');
  await expect(cityInput).toHaveValue('Warsaw');

  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Try again' })).toHaveCSS('height', '44px');
  await expect(districtSelect).toBeDisabled();
  await expect(page.locator('button[aria-pressed="true"]').filter({ hasText: /^OLX/ })).toContainText(
    'Could not verify',
  );
  await page.getByRole('button', { name: 'Publish Item' }).click();
  await expect.poll(() => publishPayloads.length).toBe(0);

  await page.getByRole('button', { name: 'Try again' }).click();
  await expect.poll(() => editor.getWarsawDistrictAttempts()).toBe(2);
  await expect(districtSelect).toBeEnabled();
  await expect(districtSelect).toHaveAttribute('aria-required', 'true');
  await page.getByText('Optional details (1)').click();
  await page.getByRole('checkbox', { name: 'Courier' }).click();
  await expect(page.getByRole('button', { name: /OLX 1 required/ })).toBeVisible();
  await page.getByRole('button', { name: 'Publish Item' }).click();
  await expect.poll(() => publishPayloads.length).toBe(0);
  await expect(page.getByText('OLX still requires: OLX district.')).toBeVisible();

  await districtSelect.click();
  await page.getByRole('option', { name: 'Old Town' }).click();

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

  await page.getByRole('textbox', { name: 'OLX category' }).click();
  const categoryDialog = page.getByRole('dialog', { name: 'Choose OLX category' });
  await categoryDialog.getByPlaceholder('Search').fill('Coa');
  await categoryDialog.getByRole('button', { name: /Coats/ }).click();

  await expect(page.getByRole('checkbox', { name: 'Courier' })).not.toBeChecked();
  const olxReadiness = page.locator('button[aria-pressed="true"]').filter({ hasText: /^OLX/ });
  for (let sample = 0; sample < 8; sample += 1) {
    expect(await olxReadiness.textContent()).not.toContain('Ready');
    await page.waitForTimeout(50);
  }
  await expect(page.getByRole('button', { name: /OLX 1 required/ })).toBeVisible();
  await page.getByRole('button', { name: 'Publish Item' }).click();
  await expect.poll(() => publishPayloads.length).toBe(1);

  await page.getByRole('checkbox', { name: 'Parcel locker' }).click();
  await page.getByRole('button', { name: 'Publish Item' }).click();
  await expect.poll(() => publishPayloads.length).toBe(2);
  expect(publishPayloads[1]).toMatchObject({
    platform_listing_overrides: {
      olx: {
        _replace: true,
        category_id: 200,
        ad_delivery: { delivery_package_ids: ['parcel-locker'] },
      },
    },
  });
  expect(JSON.stringify(publishPayloads[1])).not.toContain('courier');
  expect(canonicalOverridesAfterPublish[1]).toEqual({
    olx: {
      country_code: 'PL',
      category_id: 200,
      category_path: 'Fashion > Coats',
      attributes: { delivery: ['parcel-locker'] },
      location: {
        city_id: 10,
        city_name: 'Warsaw',
        district_id: '20',
        district_name: 'Old Town',
      },
      ad_delivery: { delivery_package_ids: ['parcel-locker'] },
    },
    vinted: {
      catalog_id: 900,
      field_overrides: { title: 'Vinted-only title' },
      remote_listing_id: 'vinted-remote-123',
    },
  });
  expect(canonicalOverridesAfterPublish[1].olx).not.toHaveProperty('_replace');
  expect(canonicalOverridesAfterPublish[1].olx).not.toHaveProperty(
    'attributes.legacy_attribute',
  );

  await cityInput.fill('Wro');
  await expect(districtSelect).toBeDisabled();
  await page.getByRole('button', { name: 'Publish Item' }).click();
  await expect.poll(() => publishPayloads.length).toBe(2);
  await expect(page.getByText('OLX still requires: OLX city.')).toBeVisible();

  await page.getByRole('option', { name: 'Wroclaw' }).click();
  await expect(districtSelect).toBeDisabled();
  await expect(districtSelect).toHaveAttribute('aria-required', 'false');
  await expect(page.getByRole('button', { name: /OLX Ready/ })).toBeVisible();
  await page.getByRole('button', { name: 'Publish Item' }).click();
  await expect.poll(() => publishPayloads.length).toBe(3);
  expect(publishPayloads[2]).toMatchObject({
    platform_listing_overrides: {
      olx: {
        category_id: 200,
        location: { city_id: 11, city_name: 'Wroclaw' },
        ad_delivery: { delivery_package_ids: ['parcel-locker'] },
      },
    },
  });
  const cityOnlyLocation = (
    publishPayloads[2].platform_listing_overrides as { olx: { location: Record<string, unknown> } }
  ).olx.location;
  expect(cityOnlyLocation).not.toHaveProperty('district_id');

  const countrySelect = page.getByRole('combobox', { name: 'OLX country', exact: true });
  await countrySelect.click();
  await page.getByRole('option', { name: 'Bulgaria' }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Change country' }).click();

  await expect(page.getByRole('combobox', { name: 'OLX city' })).toHaveValue('');
  await expect(page.getByRole('combobox', { name: 'OLX district' })).toBeDisabled();
  await expect(page.getByText('No OLX category selected.')).toBeVisible();

  await page.getByRole('button', { name: 'Save in FlipIt' }).click();
  await expect.poll(() => editor.patchPayloads.length).toBe(1);
  expect(editor.patchPayloads[0]).toMatchObject({
    platform_listing_overrides: {
      olx: { _replace: true, country_code: 'BG' },
    },
  });
  expect(
    (editor.patchPayloads[0].platform_listing_overrides as JsonObject).olx,
  ).toEqual({ _replace: true, country_code: 'BG' });
  expect(editor.getStoredPlatformOverrides()).toEqual({
    olx: { country_code: 'BG' },
    vinted: {
      catalog_id: 900,
      field_overrides: { title: 'Vinted-only title' },
      remote_listing_id: 'vinted-remote-123',
    },
  });
});

test('a stale persisted OLX country can be replaced by the only connected account', async ({ page }) => {
  const editor = await prepareOlxEditor(page, {
    accounts: [
      {
        country_code: 'PL',
        country_name: 'Poland',
        connected: true,
        status: 'valid',
        is_default: true,
      },
    ],
    initialOlxOverrides: {
      country_code: 'UA',
      category_id: 100,
      category_path: 'Fashion > Jackets',
      attributes: { legacy_attribute: 'stale' },
      location: {
        city_id: 10,
        city_name: 'Kyiv',
        district_id: 99,
        district_name: 'Stale district',
      },
      ad_delivery: { delivery_package_ids: ['legacy-package'] },
    },
  });

  await page.goto(`/add-item?edit=${TEST_ITEM_UUID}&mode=republish&publish=olx`);

  const countryControl = page.getByRole('combobox', { name: 'OLX country', exact: true });
  await expect(countryControl).toBeVisible();
  await countryControl.click();
  await page.getByRole('option', { name: /Poland/ }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Change country' }).click();

  await expect(page.getByRole('combobox', { name: 'OLX city' })).toHaveValue('');
  await expect(page.getByText('No OLX category selected.')).toBeVisible();
  await page.getByRole('button', { name: 'Save in FlipIt' }).click();
  await expect.poll(() => editor.patchPayloads.length).toBe(1);

  expect(
    (editor.patchPayloads[0].platform_listing_overrides as JsonObject).olx,
  ).toEqual({ _replace: true, country_code: 'PL' });
  expect(editor.getStoredPlatformOverrides()).toEqual({
    olx: { country_code: 'PL' },
    vinted: {
      catalog_id: 900,
      field_overrides: { title: 'Vinted-only title' },
      remote_listing_id: 'vinted-remote-123',
    },
  });
});

test('saving an OLX category reset removes stored category-scoped data canonically', async ({ page }) => {
  const editor = await prepareOlxEditor(page);

  await page.goto(`/add-item?edit=${TEST_ITEM_UUID}&mode=republish&publish=olx`);
  await page.getByRole('textbox', { name: 'OLX category' }).click();
  const categoryDialog = page.getByRole('dialog', { name: 'Choose OLX category' });
  await categoryDialog.getByPlaceholder('Search').fill('Coa');
  await categoryDialog.getByRole('button', { name: /Coats/ }).click();
  await page.getByRole('button', { name: 'Save in FlipIt' }).click();
  await expect.poll(() => editor.patchPayloads.length).toBe(1);

  expect(
    (editor.patchPayloads[0].platform_listing_overrides as JsonObject).olx,
  ).toEqual({
    _replace: true,
    country_code: 'PL',
    category_id: 200,
    category_path: 'Fashion > Coats',
  });
  expect(editor.getStoredPlatformOverrides()).toEqual({
    olx: {
      country_code: 'PL',
      category_id: 200,
      category_path: 'Fashion > Coats',
    },
    vinted: {
      catalog_id: 900,
      field_overrides: { title: 'Vinted-only title' },
      remote_listing_id: 'vinted-remote-123',
    },
  });
});
