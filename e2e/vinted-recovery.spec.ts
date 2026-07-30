import { expect, Page, test } from '@playwright/test';

const AUTH_USER = {
  id: 'vinted-recovery-user',
  name: 'Vinted Recovery User',
  email: 'vinted-recovery@example.com',
  provider: 'email',
  language: 'en',
};

function makeJwtToken() {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const payload = Buffer.from(
    JSON.stringify({
      sub: AUTH_USER.id,
      exp: Math.floor(Date.now() / 1000) + 3600,
    }),
  ).toString('base64');
  return `${header}.${payload}.signature`;
}

async function prepareAuthenticatedPage(page: Page) {
  const token = makeJwtToken();
  await page.addInitScript(
    ({ authToken, user }) => {
      localStorage.setItem('flipit_token', authToken);
      localStorage.setItem('flipit_refresh_token', 'refresh-e2e');
      localStorage.setItem('flipit_user', JSON.stringify(user));
      localStorage.setItem('flipit_cookie_consent', 'essential');
    },
    { authToken: token, user: AUTH_USER },
  );

  await page.route('**/api/auth/user/', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(AUTH_USER),
    }),
  );
  await page.route('**/api/auth/ping/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"ok"}' }),
  );
  await page.route('**/api/cookies/visitor/ping/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"ok"}' }),
  );
  await page.route('**/api/observability/app-route/', (route) =>
    route.fulfill({ status: 204, body: '' }),
  );
  await page.route('**/api/credits/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        plan: 'start',
        publish_remaining: 5,
        image_remaining: 5,
      }),
    }),
  );
  await page.route('**/api/user/profile/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(AUTH_USER),
    }),
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
          olx: { stored: false, status: null, accounts: [], countries: [] },
          vinted: { stored: false, status: null, invalid_reason: null },
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
        operations: [],
        marketplaces: Object.fromEntries(
          ['facebook', 'olx', 'vinted', 'ebay', 'allegro', 'etsy'].map((platform) => [
            platform,
            {
              integration_method:
                platform === 'vinted' || platform === 'facebook'
                  ? 'session_based'
                  : 'official_api',
              overall_status: 'experimental',
              capabilities: {},
            },
          ]),
        ),
      }),
    }),
  );
}

test('canonical Vinted 403 keeps the modal open, then verified retry returns to the listing', async ({
  page,
}) => {
  await prepareAuthenticatedPage(page);
  let attempts = 0;
  await page.route('**/api/manual-connect/', async (route) => {
    attempts += 1;
    if (attempts === 1) {
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({
          reason: 'forbidden',
          error_code: 'vinted_verification_required',
          action_required: 'verify_vinted_session',
          detail: "Complete Vinted's security check in your browser, then try connecting again.",
        }),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ connected: true, status: 'valid' }),
    });
  });

  await page.goto(
    '/connect-accounts?reconnect=vinted&reason=verification_required&returnTo=%2Fuser%2Fitems',
  );
  const modal = page.getByRole('dialog');
  await expect(modal.getByRole('heading', { name: 'Connect your Vinted account' })).toBeVisible();
  await modal.getByPlaceholder('Paste Vinted cookies here...').fill('cookie=value');
  await modal.getByRole('button', { name: 'Connect Vinted' }).click();

  const warning = page.locator('[data-sonner-toast][data-type="warning"][data-visible="true"]').filter({
    hasText: "Complete Vinted's security check",
  }).first();
  await expect(warning).toBeVisible();
  await expect(modal).toBeVisible();
  await expect(page).toHaveURL(/\/connect-accounts/);

  await modal.getByRole('button', { name: 'Connect Vinted' }).click();
  await expect(page).toHaveURL('/user/items');
  expect(attempts).toBe(2);
});

test('Vinted reconnect notices use warning only for explicit verification reason', async ({ page }) => {
  await prepareAuthenticatedPage(page);

  await page.goto('/connect-accounts?reconnect=vinted&reason=verification_required');
  await expect(
    page.locator('[data-sonner-toast][data-type="warning"][data-visible="true"]').filter({
      hasText: 'Vinted verification required',
    }).first(),
  ).toBeVisible();

  await page.goto('/connect-accounts?reconnect=vinted&reason=auth_failed');
  await expect(
    page.locator('[data-sonner-toast][data-type="error"][data-visible="true"]').filter({
      hasText: 'Vinted Reconnection Required',
    }).first(),
  ).toBeVisible();
});

test('invalid Vinted credentials are shown as an error and keep the modal open', async ({ page }) => {
  await prepareAuthenticatedPage(page);
  await page.route('**/api/manual-connect/', (route) =>
    route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({
        reason: 'auth_failed',
        error_code: 'vinted_auth_failed',
        action_required: 'reconnect_vinted',
        detail: 'Vinted rejected these connection details. Please update them and try again.',
      }),
    }),
  );

  await page.goto('/connect-accounts?reconnect=vinted&reason=auth_failed');
  const modal = page.getByRole('dialog');
  await modal.getByPlaceholder('Paste Vinted cookies here...').fill('expired-cookie=value');
  await modal.getByRole('button', { name: 'Connect Vinted' }).click();

  await expect(
    page.locator('[data-sonner-toast][data-type="error"][data-visible="true"]').filter({
      hasText: 'Vinted rejected these connection details',
    }).first(),
  ).toBeVisible();
  await expect(modal).toBeVisible();
});
