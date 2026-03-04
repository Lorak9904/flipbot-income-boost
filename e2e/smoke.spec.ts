import AxeBuilder from '@axe-core/playwright';
import { expect, Page, test } from '@playwright/test';

const TEST_ITEM_UUID = 'item-e2e-1';
const TEST_IMAGE_DATA_URI = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
const AUTH_USER = {
  id: 'u-e2e-1',
  name: 'E2E User',
  email: 'e2e@example.com',
  provider: 'email',
  language: 'en',
};

const mockItemsResponse = {
  items: [
    {
      id: TEST_ITEM_UUID,
      uuid: TEST_ITEM_UUID,
      title: 'E2E Jacket',
      description: 'Denim jacket used for local Playwright checks',
      price: 129.5,
      status: 'active',
      stage: 'published',
      brand: 'Levis',
      category: 'Jackets',
      condition: 'used',
      size: 'M',
      gender: 'men',
      images: [TEST_IMAGE_DATA_URI],
      platforms: ['olx', 'allegro', 'ebay'],
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-02T00:00:00Z',
      published_at: '2026-01-03T00:00:00Z',
      publish_results: [
        {
          platform: 'allegro',
          status: 'success',
          listing_url: 'https://allegro.pl/oferta/e2e-jacket',
          external_id: 'A123',
          updated_at: '2026-01-03T00:00:00Z',
          message: 'Published successfully',
        },
      ],
    },
  ],
  total: 1,
  total_pages: 1,
  page: 1,
};

const mockItemDetail = mockItemsResponse.items[0];

const mockCredits = {
  plan: 'plus',
  effective_plan: 'plus',
  subscription_status: 'active',
  current_period_start: 1767225600,
  current_period_end: 1769904000,
  cancel_at_period_end: false,
  billing_interval: 'month',
  publish_credits_used: 3,
  publish_limit: 25,
  publish_remaining: 22,
  image_credits_used: 2,
  image_limit: 40,
  image_remaining: 38,
};

const ignoredConsoleErrorPatterns = [
  /ResizeObserver loop limit exceeded/i,
  /Non-Error promise rejection captured/i,
  /\[GSI_LOGGER\]: The given origin is not allowed for the given client ID\./i,
];

function makeJwtToken(expirationOffsetSeconds = 60 * 60 * 24) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const payload = Buffer.from(
    JSON.stringify({
      sub: AUTH_USER.id,
      exp: Math.floor(Date.now() / 1000) + expirationOffsetSeconds,
    })
  ).toString('base64');
  return `${header}.${payload}.signature`;
}

async function disableAnimations(page: Page) {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
        scroll-behavior: auto !important;
      }
    `,
  });
}

function createRuntimeTracker(page: Page) {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const failedLocalImageRequests: string[] = [];

  const isLocalAsset = (url: string) =>
    (url.startsWith('http://127.0.0.1:4173/') || url.startsWith('http://localhost:4173/')) &&
    !url.endsWith('/favicon.ico');

  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });

  page.on('requestfailed', (request) => {
    if (request.resourceType() === 'image' && isLocalAsset(request.url())) {
      failedLocalImageRequests.push(`${request.url()} (request failed)`);
    }
  });

  page.on('response', (response) => {
    const request = response.request();
    if (
      request.resourceType() === 'image' &&
      isLocalAsset(response.url()) &&
      response.status() >= 400
    ) {
      failedLocalImageRequests.push(`${response.url()} (${response.status()})`);
    }
  });

  return {
    checkpoint: () => ({
      console: consoleErrors.length,
      page: pageErrors.length,
      images: failedLocalImageRequests.length,
    }),
    assertNoNewIssues: (checkpoint: { console: number; page: number; images: number }, context: string) => {
      const newConsoleErrors = consoleErrors
        .slice(checkpoint.console)
        .filter((entry) => !ignoredConsoleErrorPatterns.some((pattern) => pattern.test(entry)));
      const newPageErrors = pageErrors.slice(checkpoint.page);
      const newImageErrors = failedLocalImageRequests.slice(checkpoint.images);

      expect(newConsoleErrors, `Unexpected console errors on ${context}`).toEqual([]);
      expect(newPageErrors, `Unexpected uncaught runtime errors on ${context}`).toEqual([]);
      expect(newImageErrors, `Failed local image requests on ${context}`).toEqual([]);
    },
  };
}

async function assertNoBrokenLocalImages(page: Page) {
  await page.waitForLoadState('networkidle');
  const brokenImages = await page.evaluate(() => {
    return Array.from(document.images)
      .filter((img) => {
        if (!img.src) return false;
        try {
          const url = new URL(img.currentSrc || img.src, window.location.href);
          return url.origin === window.location.origin && url.pathname !== '/favicon.ico';
        } catch {
          return false;
        }
      })
      .filter((img) => img.complete && img.naturalWidth === 0)
      .map((img) => img.currentSrc || img.src);
  });

  expect(brokenImages).toEqual([]);
}

async function installCommonMocks(page: Page, { authenticated }: { authenticated: boolean }) {
  const authToken = makeJwtToken();

  await page.route('**/api/cookies/visitor/ping/**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"status":"ok"}' });
  });

  await page.route('**/api/auth/ping/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '{"status":"ok","last_seen_at":"2026-01-01T00:00:00Z"}',
    });
  });

  await page.route('**/api/platforms/health-check/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        checked_at: '2026-01-01T00:00:00Z',
        platforms: {
          facebook: { stored: false, status: null },
          olx: { stored: true, status: 'valid', reason: null },
          vinted: { stored: true, status: 'valid', reason: null },
          ebay: { stored: true, status: 'valid', reason: null },
          allegro: { stored: true, status: 'valid', reason: null },
        },
      }),
    });
  });

  await page.route('**/api/auth/user', async (route) => {
    if (!authenticated) {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Unauthorized' }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(AUTH_USER),
    });
  });

  await page.route('**/api/auth/refresh', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ token: authToken }),
    });
  });

  await page.route('**/api/connected-platforms**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        facebook: false,
        olx: true,
        vinted: true,
        ebay: true,
        allegro: true,
      }),
    });
  });

  await page.route('**/api/items/stats/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        total_items: 1,
        published_items: 1,
        draft_items: 0,
        publish_success_rate: 100,
      }),
    });
  });

  await page.route(/\/api\/items\/\?.*$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockItemsResponse),
    });
  });

  await page.route(new RegExp(`/api/items/${TEST_ITEM_UUID}/$`), async (route) => {
    const request = route.request();
    if (request.method() === 'DELETE') {
      await route.fulfill({ status: 204 });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockItemDetail),
    });
  });

  await page.route(/\/api\/credits\/transactions\/\?limit=\d+$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        count: 1,
        transactions: [
          {
            id: 1,
            action_type: 'publish_listing',
            amount: -1,
            balance_before: 23,
            balance_after: 22,
            metadata: { platform: 'allegro', draft_id: TEST_ITEM_UUID },
            created_at: '2026-01-01T00:00:00Z',
          },
        ],
      }),
    });
  });

  await page.route(/\/api\/credits\/$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockCredits),
    });
  });

  await page.route('**/api/user/profile/**', async (route) => {
    const request = route.request();
    if (request.method() === 'PATCH') {
      const body = request.postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...body,
          address_city: body?.address_city || 'Warsaw',
          address_postal_code: body?.address_postal_code || '00-001',
          address_country: body?.address_country || 'Poland',
          address_street: body?.address_street || 'Marszalkowska 1',
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        name: AUTH_USER.name,
        email: AUTH_USER.email,
        address_city: 'Warsaw',
        address_postal_code: '00-001',
        address_country: 'Poland',
        address_street: 'Marszalkowska 1',
      }),
    });
  });

  await page.route('https://eu.i.posthog.com/**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });
}

async function seedAuthenticatedSession(page: Page) {
  const token = makeJwtToken();
  await page.addInitScript(
    ({ user, authToken }) => {
      localStorage.setItem('flipit_token', authToken);
      localStorage.setItem('flipit_refresh_token', 'refresh-e2e');
      localStorage.setItem('flipit_user', JSON.stringify(user));
      document.cookie = 'lang=en; path=/; max-age=31536000';
    },
    { user: AUTH_USER, authToken: token }
  );
}

async function preparePage(page: Page, { authenticated }: { authenticated: boolean }) {
  await installCommonMocks(page, { authenticated });
  if (authenticated) {
    await seedAuthenticatedSession(page);
  }
  return createRuntimeTracker(page);
}

test('public pages render and remain runtime-clean', async ({ page }) => {
  const tracker = await preparePage(page, { authenticated: false });
  const routes = ['/', '/pricing', '/how-it-works', '/faq', '/articles'];

  for (const route of routes) {
    const checkpoint = tracker.checkpoint();
    await page.goto(route);
    await disableAnimations(page);
    await expect(page).toHaveURL(route);
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1').first()).toBeVisible();
    await assertNoBrokenLocalImages(page);
    tracker.assertNoNewIssues(checkpoint, route);
  }
});

test('protected route redirects to login when unauthenticated', async ({ page }) => {
  await preparePage(page, { authenticated: false });
  await page.goto('/user/items');
  await expect(page).toHaveURL('/login');
});

test('email login flow stores token and redirects home', async ({ page }) => {
  await preparePage(page, { authenticated: false });

  await page.route('**/api/auth/login/email', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        userData: {
          id: AUTH_USER.id,
          name: AUTH_USER.name,
          email: AUTH_USER.email,
          language: AUTH_USER.language,
        },
        token: 'test-access-token',
        refresh_token: 'test-refresh-token',
      }),
    });
  });

  await page.goto('/login');
  await page.locator('#email').fill(AUTH_USER.email);
  await page.locator('#password').fill('strong-pass-123');
  await page.getByRole('button', { name: /sign in/i }).click();

  await expect(page).toHaveURL('/');
  const token = await page.evaluate(() => localStorage.getItem('flipit_token'));
  expect(token).toBe('test-access-token');
});

test('authenticated pages render expected core sections', async ({ page }) => {
  const tracker = await preparePage(page, { authenticated: true });

  const assertions = [
    {
      route: '/connect-accounts',
      assert: async () => {
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.getByRole('heading', { name: /OLX/i })).toBeVisible();
        await expect(page.getByRole('heading', { name: /^Vinted$/i })).toBeVisible();
      },
    },
    {
      route: '/add-item',
      assert: async () => {
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.getByText(/Upload Images/i)).toBeVisible();
      },
    },
    {
      route: '/settings',
      assert: async () => {
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.getByRole('heading', { name: /Subscription & Credits/i })).toBeVisible();
        await expect(page.getByText(/Listings Remaining/i)).toBeVisible();
      },
    },
  ];

  for (const entry of assertions) {
    const checkpoint = tracker.checkpoint();
    await page.goto(entry.route);
    await expect(page).toHaveURL(entry.route);
    await entry.assert();
    await assertNoBrokenLocalImages(page);
    tracker.assertNoNewIssues(checkpoint, entry.route);
  }
});

test('user items and item detail load with mocked data', async ({ page }) => {
  const tracker = await preparePage(page, { authenticated: true });
  const listCheckpoint = tracker.checkpoint();

  await page.goto('/user/items');
  await expect(page).toHaveURL('/user/items');
  await expect(page.getByText('E2E Jacket')).toBeVisible();
  await expect(page.getByText('published', { exact: true })).toBeVisible();
  tracker.assertNoNewIssues(listCheckpoint, '/user/items');

  const detailCheckpoint = tracker.checkpoint();
  await page.goto(`/user/items/${TEST_ITEM_UUID}`);
  await expect(page).toHaveURL(`/user/items/${TEST_ITEM_UUID}`);
  await expect(page.getByText('E2E Jacket')).toBeVisible();
  await expect(page.getByText(/Publishing Status/i)).toBeVisible();
  await expect(page.getByRole('link', { name: /View listing on allegro/i })).toBeVisible();
  await assertNoBrokenLocalImages(page);
  tracker.assertNoNewIssues(detailCheckpoint, `/user/items/${TEST_ITEM_UUID}`);
});

test('pricing page preserves gradient accent styling', async ({ page }) => {
  const tracker = await preparePage(page, { authenticated: false });
  const checkpoint = tracker.checkpoint();

  await page.goto('/pricing');
  await expect(page).toHaveURL('/pricing');

  const gradientPrices = page.locator(
    '.bg-gradient-to-r.from-cyan-400.to-fuchsia-400.bg-clip-text.text-transparent'
  );
  await expect(gradientPrices.first()).toBeVisible();
  expect(await gradientPrices.count()).toBeGreaterThan(1);

  const hasComputedGradient = await gradientPrices.first().evaluate((element) =>
    getComputedStyle(element).backgroundImage.includes('gradient')
  );
  expect(hasComputedGradient).toBeTruthy();
  tracker.assertNoNewIssues(checkpoint, '/pricing');
});

test('core pages have no critical accessibility violations', async ({ page }) => {
  const tracker = await preparePage(page, { authenticated: true });

  const routes = ['/', '/pricing', '/settings'];

  for (const route of routes) {
    const checkpoint = tracker.checkpoint();
    await page.goto(route);
    await expect(page.locator('main')).toBeVisible();

    const results = await new AxeBuilder({ page })
      .include('main')
      .disableRules(['color-contrast'])
      .analyze();
    const criticalViolations = results.violations.filter((violation) => violation.impact === 'critical');

    expect(
      criticalViolations,
      `Critical accessibility violations found on ${route}: ${JSON.stringify(
        criticalViolations.map((violation) => violation.id)
      )}`
    ).toEqual([]);
    tracker.assertNoNewIssues(checkpoint, `${route} (a11y run)`);
  }
});

test('capture visual checkpoints for pricing and how-it-works', async ({ page }, testInfo) => {
  await preparePage(page, { authenticated: false });

  await page.goto('/pricing');
  await disableAnimations(page);
  await expect(page.locator('h1')).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath('pricing-page.png'),
    fullPage: true,
  });

  await page.goto('/how-it-works');
  await disableAnimations(page);
  await expect(page.locator('h1')).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath('how-it-works-page.png'),
    fullPage: true,
  });
});
