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

const isPostHogRequest = (url: string) => {
  const host = new URL(url).hostname;
  return host === 'eu.i.posthog.com' || host === 'eu.posthog.com';
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

const pricingCases = [
  {
    language: 'en',
    path: '/pricing',
    renewal: 'renews automatically until cancelled',
    terms: 'Terms',
    privacy: 'Privacy Policy',
  },
  {
    language: 'pl',
    path: '/pl/cennik',
    renewal: 'odnawia się automatycznie do czasu anulowania',
    terms: 'Regulamin',
    privacy: 'Politykę prywatności',
  },
] as const;

for (const pricingCase of pricingCases) {
  test(`${pricingCase.language} pricing shows disclosures only for paid checkout actions`, async ({ page }) => {
    await page.goto(pricingCase.path);
    const disclosures = page.getByTestId('checkout-disclosure-subscription');
    await expect(disclosures).toHaveCount(3);
    await expect(disclosures.first()).toContainText(pricingCase.renewal);
    await expect(disclosures.first().getByRole('link', { name: pricingCase.terms })).toBeVisible();
    await expect(disclosures.first().getByRole('link', { name: pricingCase.privacy })).toBeVisible();
    const freeCard = page.getByText(pricingCase.language === 'pl' ? 'Darmowy' : 'Free', { exact: true }).locator('..').locator('..');
    await expect(freeCard.getByTestId('checkout-disclosure-subscription')).toHaveCount(0);
  });
}

function makeJwtToken() {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const payload = Buffer.from(JSON.stringify({ sub: 'legal-e2e', exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64');
  return `${header}.${payload}.signature`;
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

test('image add-on is disclosed as one-time while portal management has no subscription checkout disclosure', async ({ page }) => {
  await mockUnlimitedAccount(page);
  await page.goto('/settings');
  await page.getByRole('button', { name: 'Change Plan' }).click();

  await expect(page.getByTestId('checkout-disclosure-one-time')).toContainText('one-time payment with no recurring charge');
  await expect(page.getByRole('button', { name: 'Open Stripe Billing Portal' })).toBeVisible();
  await expect(page.getByTestId('checkout-disclosure-subscription')).toHaveCount(0);
});
