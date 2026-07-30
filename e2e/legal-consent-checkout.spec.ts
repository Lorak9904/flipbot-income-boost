import { expect, Page, test } from '@playwright/test';
import { buildGoogleLoginPayload } from '../src/lib/legal-acceptance';

const TERMS_VERSION = '2026-06-28';
const PRIVACY_VERSION = '2026-07-21';

const registrationCases = [
  {
    language: 'en',
    path: '/login?register=1',
    termsPath: '/terms',
    privacyPath: '/privacy',
    errorCode: 'legal_acceptance_required',
    errorText: 'Accept the Terms and acknowledge the Privacy Policy',
  },
  {
    language: 'pl',
    path: '/pl/logowanie?register=1',
    termsPath: '/pl/regulamin',
    privacyPath: '/pl/polityka-prywatnosci',
    errorCode: 'legal_version_outdated',
    errorText: 'Dokumenty prawne zostały zaktualizowane.',
  },
] as const;

for (const registrationCase of registrationCases) {
  test(`${registrationCase.language} registration requires and submits current legal acceptance`, async ({ page }) => {
    let payload: Record<string, unknown> | null = null;
    await page.route('**/api/auth/register', async (route) => {
      payload = route.request().postDataJSON();
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    await page.goto(registrationCase.path);

    const checkbox = page.getByRole('checkbox');
    const createAccount = page.getByRole('button', {
      name: registrationCase.language === 'pl' ? 'Utwórz konto' : 'Create Account',
      exact: true,
    });
    await expect(checkbox).not.toBeChecked();
    await expect(createAccount).toBeDisabled();
    const legalCopy = page.locator('#registration-legal-copy');
    await expect(legalCopy.getByRole('link', { name: registrationCase.language === 'pl' ? 'Regulamin' : 'Terms' }))
      .toHaveAttribute('href', registrationCase.termsPath);
    await expect(legalCopy.getByRole('link', { name: registrationCase.language === 'pl' ? 'Polityką prywatności' : 'Privacy Policy' }))
      .toHaveAttribute('href', registrationCase.privacyPath);

    await page.getByLabel(registrationCase.language === 'pl' ? 'Imię' : 'Name').fill('Legal User');
    await page.getByLabel(registrationCase.language === 'pl' ? 'Adres e-mail' : 'Email Address').fill('legal@example.com');
    await page.getByLabel(registrationCase.language === 'pl' ? 'Hasło' : 'Password').fill('SafePhrase!42');
    await checkbox.check();
    await createAccount.click();

    await expect.poll(() => payload).not.toBeNull();
    expect(payload).toMatchObject({
      email: 'legal@example.com',
      name: 'Legal User',
      legal_acceptance: {
        accepted: true,
        terms_version: TERMS_VERSION,
        privacy_notice_version: PRIVACY_VERSION,
      },
    });
  });

  test(`${registrationCase.language} registration maps stable legal errors`, async ({ page }) => {
    await page.route('**/api/auth/register', (route) => route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({ code: registrationCase.errorCode, detail: 'internal detail must not be shown' }),
    }));
    await page.goto(registrationCase.path);
    await page.getByLabel(registrationCase.language === 'pl' ? 'Imię' : 'Name').fill('Legal User');
    await page.getByLabel(registrationCase.language === 'pl' ? 'Adres e-mail' : 'Email Address').fill('legal@example.com');
    await page.getByLabel(registrationCase.language === 'pl' ? 'Hasło' : 'Password').fill('SafePhrase!42');
    await page.getByRole('checkbox').check();
    await page.getByRole('button', {
      name: registrationCase.language === 'pl' ? 'Utwórz konto' : 'Create Account',
      exact: true,
    }).click();

    await expect(page.getByText(new RegExp(registrationCase.errorText))).toBeVisible();
    await expect(page.getByText('internal detail must not be shown')).toHaveCount(0);
  });
}

test('Google signup payload is versioned while sign-in stays unchanged', () => {
  expect(buildGoogleLoginPayload('credential', true)).toEqual({
    credential: 'credential',
    legal_acceptance: {
      accepted: true,
      terms_version: TERMS_VERSION,
      privacy_notice_version: PRIVACY_VERSION,
    },
  });
  expect(buildGoogleLoginPayload('credential', false)).toEqual({ credential: 'credential' });
});

test('Google signup endpoint receives exact legal acceptance', async ({ page }) => {
  await installMockGoogle(page);
  let payload: Record<string, unknown> | null = null;
  await page.route('**/api/auth/login/google', async (route) => {
    payload = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: makeJwtToken(),
        refresh_token: 'refresh',
        userData: { id: 'google-user', name: 'Google User', email: 'google@example.com', provider: 'google' },
      }),
    });
  });
  await page.goto('/login?register=1');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Mock Google' }).first().click();
  await expect.poll(() => payload).not.toBeNull();
  expect(payload).toEqual(buildGoogleLoginPayload('mock-google-credential', true));
});

test('normal Google sign-in endpoint sends only the credential', async ({ page }) => {
  await installMockGoogle(page);
  let payload: Record<string, unknown> | null = null;
  await page.route('**/api/auth/login/google', async (route) => {
    payload = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: makeJwtToken(),
        refresh_token: 'refresh',
        userData: { id: 'existing-google-user', name: 'Existing User', email: 'existing@example.com', provider: 'google' },
      }),
    });
  });
  await page.goto('/login');
  await page.getByRole('button', { name: 'Mock Google' }).first().click();
  await expect.poll(() => payload).not.toBeNull();
  expect(payload).toEqual({ credential: 'mock-google-credential' });
});

const isPostHogRequest = (url: string) => {
  const host = new URL(url).hostname;
  return host === 'eu.i.posthog.com' || host === 'eu.posthog.com' || host === 'posthog.invalid';
};

test('PostHog stays uninitialized before choice and for essential-only', async ({ page }) => {
  const postHogRequests: string[] = [];
  let essentialRouteObservations = 0;
  await page.route('**/api/observability/app-route/', (route) => {
    essentialRouteObservations += 1;
    return route.fulfill({ status: 204, body: '' });
  });
  await page.route('**/api/cookies/consent/', (route) => route.fulfill({ status: 204, body: '' }));
  page.on('request', (request) => {
    if (isPostHogRequest(request.url())) postHogRequests.push(request.url());
  });
  const consentRequest = page.waitForRequest('**/api/cookies/consent/');
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Only necessary' })).toBeVisible();
  expect(postHogRequests).toEqual([]);
  await page.getByRole('button', { name: 'Only necessary' }).click();
  expect((await consentRequest).postDataJSON()).toMatchObject({ consent: false, lang: 'en' });
  await page.waitForTimeout(750);
  expect(postHogRequests).toEqual([]);
  expect(essentialRouteObservations).toBeGreaterThan(0);
  await expect(page.locator('nav').first()).toBeVisible();
});

test('PostHog starts after optional consent without a reload', async ({ page }) => {
  const postHogRequests: string[] = [];
  page.on('request', (request) => {
    if (isPostHogRequest(request.url())) postHogRequests.push(request.url());
  });
  await page.route('**/api/observability/app-route/', (route) => route.fulfill({ status: 204, body: '' }));
  await page.route('**/api/cookies/consent/', (route) => route.fulfill({ status: 204, body: '' }));
  await page.goto('/');
  expect(postHogRequests).toEqual([]);
  await page.getByRole('button', { name: 'Allow optional' }).click();
  await expect.poll(() => postHogRequests.length, { timeout: 10_000 }).toBeGreaterThan(0);
  await expect(page.locator('nav').first()).toBeVisible();
});

test('consented account can withdraw and leaves no identity or later optional requests', async ({ page }) => {
  await mockAuthenticatedAccount(page);
  await installMockTawk(page);
  const postHogRequests: string[] = [];
  page.on('request', (request) => {
    if (isPostHogRequest(request.url())) postHogRequests.push(request.url());
  });
  await page.route('**/api/cookies/consent/', (route) => route.fulfill({ status: 204, body: '' }));
  await page.route('**/api/observability/app-route/', (route) => route.fulfill({ status: 204, body: '' }));

  await page.goto('/');
  await page.getByRole('button', { name: 'Allow optional' }).click();
  await expect.poll(async () => page.evaluate(() =>
    Array.from({ length: localStorage.length }, (_, index) => {
      const key = localStorage.key(index);
      return key ? [key, localStorage.getItem(key) || ''] : ['', ''];
    }).some(([key, value]) => key.startsWith('ph_') && value.includes('legal-e2e'))
  )).toBe(true);

  await page.goto('/cookies');
  await page.getByRole('button', { name: 'Withdraw optional consent' }).click();
  const requestCountAfterWithdrawal = postHogRequests.length;
  await page.getByRole('link', { name: 'Pricing', exact: true }).first().click();
  await page.waitForTimeout(750);

  expect(postHogRequests).toHaveLength(requestCountAfterWithdrawal);
  expect(await page.evaluate(() => ({
    visitorId: localStorage.getItem('visitor_id'),
    postHogKeys: Object.keys(localStorage).filter((key) => key.startsWith('ph_') || key.startsWith('__ph')),
    tawkLoaded: Boolean(document.querySelector('script[src*="tawk.to"], iframe[src*="tawk.to"]')),
  }))).toEqual({ visitorId: null, postHogKeys: [], tawkLoaded: false });
});

test('cold logged-out boot clears a former PostHog account before its first request', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('flipit_cookie_consent', 'accepted');
    localStorage.setItem('ph_phc_playwright_test_only_posthog', JSON.stringify({
      distinct_id: 'old-account',
      $user_id: 'old-account',
    }));
  });
  const postBodies: string[] = [];
  page.on('request', (request) => {
    if (isPostHogRequest(request.url())) postBodies.push(request.postData() || '');
  });
  await page.route('**/api/observability/app-route/', (route) => route.fulfill({ status: 204, body: '' }));
  await page.goto('/');
  await expect.poll(() => postBodies.length, { timeout: 10_000 }).toBeGreaterThan(0);

  expect(postBodies[0]).not.toContain('old-account');
  expect(await page.evaluate(() =>
    Array.from({ length: localStorage.length }, (_, index) => {
      const key = localStorage.key(index);
      return key ? localStorage.getItem(key) || '' : '';
    }).some((value) => value.includes('old-account'))
  )).toBe(false);
});

const pricingCases = [
  {
    language: 'en',
    path: '/pricing',
    renewal: 'renews automatically until cancelled',
    terms: 'Terms',
    privacy: 'Privacy Policy',
    cta: 'Start Plus',
  },
  {
    language: 'pl',
    path: '/pl/cennik',
    renewal: 'odnawia się automatycznie do czasu anulowania',
    terms: 'Regulamin',
    privacy: 'Politykę prywatności',
    cta: 'Wybierz Plus',
  },
] as const;

for (const pricingCase of pricingCases) {
  test(`${pricingCase.language} pricing shows disclosure in final paid checkout confirmation`, async ({ page }) => {
    await mockAuthenticatedAccount(page);
    await page.goto(pricingCase.path);
    await expect(page.getByTestId('checkout-disclosure-subscription')).toHaveCount(0);
    await page.getByRole('button', { name: pricingCase.cta }).click();
    const disclosure = page.getByTestId('checkout-disclosure-subscription');
    await expect(disclosure).toHaveCount(1);
    await expect(disclosure).toContainText(pricingCase.renewal);
    await expect(disclosure.getByRole('link', { name: pricingCase.terms })).toBeVisible();
    await expect(disclosure.getByRole('link', { name: pricingCase.privacy })).toBeVisible();
  });
}

test('logged-out paid pricing action stores intent without showing a checkout disclosure', async ({ page }) => {
  await page.goto('/pricing');
  await page.getByRole('button', { name: 'Start Plus' }).click();
  await expect(page).toHaveURL(/\/login\?register=1/);
  await expect(page.getByTestId('checkout-disclosure-subscription')).toHaveCount(0);
});

test('saved post-registration plan intent reopens confirmation before Checkout', async ({ page }) => {
  await mockAuthenticatedAccount(page, { checkoutPlan: 'plus' });
  let checkoutRequests = 0;
  await page.route('**/api/billing/checkout/', (route) => {
    checkoutRequests += 1;
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ url: '/pricing' }) });
  });
  await page.goto('/pricing?checkout=1&plan=plus&billing=monthly');

  await expect(page.getByTestId('checkout-disclosure-subscription')).toBeVisible();
  expect(checkoutRequests).toBe(0);
  await page.getByRole('button', { name: 'Continue to secure checkout' }).click();
  await expect.poll(() => checkoutRequests).toBe(1);
});

function makeJwtToken() {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const payload = Buffer.from(JSON.stringify({ sub: 'legal-e2e', exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64');
  return `${header}.${payload}.signature`;
}

async function installMockGoogle(page: Page) {
  await page.route('https://accounts.google.com/gsi/client', (route) => route.fulfill({
    status: 200,
    contentType: 'application/javascript',
    body: `
      window.google = { accounts: { id: {
        initialize(options) { window.__flipitGoogleCallback = options.callback; },
        renderButton(parent) {
          const button = document.createElement('button');
          button.type = 'button';
          button.textContent = 'Mock Google';
          button.addEventListener('click', () => window.__flipitGoogleCallback({ credential: 'mock-google-credential' }));
          parent.appendChild(button);
        },
        prompt() {}, cancel() {}, disableAutoSelect() {}, revoke() {}
      } } };
    `,
  }));
}

async function installMockTawk(page: Page) {
  await page.route('https://embed.tawk.to/**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/javascript',
    body: `
      window.Tawk_API = {
        hideWidget() {}, showWidget() {},
        shutdown() { document.querySelectorAll('iframe[src*="tawk.to"]').forEach((node) => node.remove()); }
      };
      localStorage.setItem('twk_test', 'optional');
      const iframe = document.createElement('iframe');
      iframe.src = 'https://mock.tawk.to/widget';
      document.body.appendChild(iframe);
    `,
  }));
}

async function mockUnlimitedAccount(page: Page) {
  await page.addInitScript(({ token }) => {
    localStorage.setItem('flipit_token', token);
    localStorage.setItem('flipit_refresh_token', 'refresh');
  }, { token: makeJwtToken() });
  await page.route('**/api/auth/user', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ id: 'legal-e2e', name: 'Legal User', email: 'legal@example.com', provider: 'email', language: 'en' }),
  }));
  await page.route('**/api/credits/', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      plan: 'unlimited',
      effective_plan: 'unlimited',
      subscription_status: 'active',
      billing_interval: 'month',
      publish_credits_used: 0,
      publish_limit: null,
      publish_remaining: null,
      image_credits_used: 0,
      image_limit: 150,
      image_remaining: 150,
    }),
  }));
  await page.route('**/api/user/profile/', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ name: 'Legal User', email: 'legal@example.com' }),
  }));
}

async function mockAuthenticatedAccount(page: Page, options: { checkoutPlan?: string } = {}) {
  await page.addInitScript(({ token, checkoutPlan }) => {
    localStorage.setItem('flipit_token', token);
    localStorage.setItem('flipit_refresh_token', 'refresh');
    if (checkoutPlan) sessionStorage.setItem('flipit_checkout_plan', checkoutPlan);
  }, { token: makeJwtToken(), checkoutPlan: options.checkoutPlan });
  await page.route('**/api/auth/user', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ id: 'legal-e2e', name: 'Legal User', email: 'legal@example.com', provider: 'email', language: 'en' }),
  }));
}

test('image add-on is disclosed as one-time while portal management has no subscription checkout disclosure', async ({ page }) => {
  await mockUnlimitedAccount(page);
  await page.goto('/settings');
  await page.getByRole('button', { name: 'Change Plan' }).click();

  await expect(page.getByTestId('checkout-disclosure-one-time')).toContainText('one-time payment with no recurring charge');
  await expect(page.getByRole('button', { name: 'Open Stripe Billing Portal' })).toBeVisible();
  await expect(page.getByTestId('checkout-disclosure-subscription')).toHaveCount(0);
});
