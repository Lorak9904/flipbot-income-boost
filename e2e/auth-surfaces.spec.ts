import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('flipit_cookie_consent', 'essential'));
  await page.route('https://posthog.invalid/**', (route) => route.fulfill({ status: 204, body: '' }));
  await page.route('https://embed.tawk.to/**', (route) => route.fulfill({ status: 200, contentType: 'application/javascript', body: '' }));
  await page.route('**/api/observability/app-route/', (route) => route.fulfill({ status: 204, body: '' }));
});

const languageCases = [
  {
    language: 'en', login: '/login', forgot: '/forgot-password', reset: '/reset-password?token=test-token',
    email: 'Email Address', password: 'Password', forgotTitle: 'Forgot Password', resetTitle: 'Reset Password',
    newPassword: 'New Password', confirm: 'Confirm Password', forgotSubmit: 'Send reset link', resetSubmit: 'Update password',
    forgotSuccess: 'Check your inbox', resetSuccess: 'Password updated',
  },
  {
    language: 'pl', login: '/pl/logowanie', forgot: '/pl/odzyskaj-haslo', reset: '/pl/ustaw-nowe-haslo?token=test-token',
    email: 'Adres e-mail', password: 'Hasło', forgotTitle: 'Nie pamiętasz hasła?', resetTitle: 'Resetuj hasło',
    newPassword: 'Nowe hasło', confirm: 'Potwierdź hasło', forgotSubmit: 'Wyślij link resetu', resetSubmit: 'Zapisz hasło',
    forgotSuccess: 'Sprawdź skrzynkę', resetSuccess: 'Hasło zaktualizowane',
  },
] as const;

for (const authCase of languageCases) {
  test(`${authCase.language} auth labels and password success states remain localized`, async ({ page }) => {
    await page.goto(authCase.login);
    await expect(page.getByLabel(authCase.email)).toBeVisible();
    await expect(page.getByLabel(authCase.password)).toBeVisible();

    await page.route('**/api/auth/forgot-password/', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
    await page.goto(authCase.forgot);
    await expect(page.getByRole('heading', { name: authCase.forgotTitle })).toBeVisible();
    await page.getByLabel(authCase.email).fill('seller@example.com');
    await page.getByRole('button', { name: authCase.forgotSubmit }).click();
    await expect(page.getByRole('alert')).toContainText(authCase.forgotSuccess);

    let resetPayload: Record<string, unknown> | null = null;
    await page.route('**/api/auth/reset-password/', async (route) => {
      resetPayload = route.request().postDataJSON();
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });
    await page.goto(authCase.reset);
    await expect(page.getByRole('heading', { name: authCase.resetTitle })).toBeVisible();
    await page.getByLabel(authCase.newPassword).fill('SafePhrase!42');
    await page.getByLabel(authCase.confirm).fill('SafePhrase!42');
    await page.getByRole('button', { name: authCase.resetSubmit }).click();
    await expect(page.getByRole('alert')).toContainText(authCase.resetSuccess);
    expect(resetPayload).toEqual({ token: 'test-token', password: 'SafePhrase!42' });
  });

  test(`${authCase.language} forgot and reset errors remain persistent alerts`, async ({ page }) => {
    await page.route('**/api/auth/login/email/', (route) => route.fulfill({ status: 401, contentType: 'application/json', body: '{}' }));
    await page.goto(authCase.login);
    await page.getByLabel(authCase.email).fill('seller@example.com');
    await page.getByLabel(authCase.password).fill('WrongPhrase!42');
    await page.getByRole('button', { name: authCase.language === 'pl' ? 'Zaloguj się' : 'Sign In' }).click();
    await expect(page.getByRole('alert')).toHaveText('Invalid email or password');

    await page.route('**/api/auth/forgot-password/', (route) => route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ detail: 'Mock forgot error' }) }));
    await page.goto(authCase.forgot);
    await page.getByLabel(authCase.email).fill('seller@example.com');
    await page.getByRole('button', { name: authCase.forgotSubmit }).click();
    await expect(page.getByRole('alert')).toHaveText('Mock forgot error');

    await page.goto(authCase.reset);
    await page.getByLabel(authCase.newPassword).fill('SafePhrase!42');
    await page.getByLabel(authCase.confirm).fill('DifferentPhrase!42');
    await page.getByRole('button', { name: authCase.resetSubmit }).click();
    await expect(page.getByRole('alert')).toBeVisible();
  });
}

test('login preserves returnTo, focus visibility, and disabled loading state', async ({ page }) => {
  let resolveLogin: (() => void) | undefined;
  await page.route('**/api/auth/login/email/', async (route) => {
    await new Promise<void>((resolve) => { resolveLogin = resolve; });
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ userData: { id: 'seller', name: 'Seller', email: 'seller@example.com', language: 'en' }, token: 'access', refresh_token: 'refresh' }),
    });
  });
  await page.goto('/login?returnTo=%2Fuser%2Fitems');
  const email = page.getByLabel('Email Address');
  await email.focus();
  await expect(email).toBeFocused();
  await email.fill('seller@example.com');
  await page.getByLabel('Password').fill('SafePhrase!42');
  const submit = page.getByRole('button', { name: 'Sign In' });
  const loginClick = submit.click();
  await expect(page.getByRole('button', { name: 'Signing in…' })).toBeDisabled();
  resolveLogin?.();
  await loginClick;
  await expect(page).toHaveURL('/user/items');
});
