export type BillingCycle = 'monthly' | 'annual';
export type BillingCurrency = 'pln' | 'eur' | 'usd';
export type PaidPlan = 'plus' | 'scale' | 'unlimited';

export const BILLING_CURRENCY_STORAGE_KEY = 'flipit_billing_currency';
export const CHECKOUT_CURRENCY_STORAGE_KEY = 'flipit_checkout_currency';

export const billingCurrencies: BillingCurrency[] = ['pln', 'eur', 'usd'];

const planPrices: Record<PaidPlan, Record<BillingCurrency, Record<BillingCycle, number>>> = {
  plus: {
    pln: { monthly: 29, annual: 279 },
    eur: { monthly: 7, annual: 67 },
    usd: { monthly: 8, annual: 77 },
  },
  scale: {
    pln: { monthly: 59, annual: 569 },
    eur: { monthly: 14, annual: 135 },
    usd: { monthly: 16, annual: 154 },
  },
  unlimited: {
    pln: { monthly: 149, annual: 1430 },
    eur: { monthly: 35, annual: 336 },
    usd: { monthly: 41, annual: 394 },
  },
};

export function normalizeBillingCurrency(value: string | null | undefined): BillingCurrency | null {
  if (!value) return null;
  const normalized = value.toLowerCase();
  return normalized === 'pln' || normalized === 'eur' || normalized === 'usd' ? normalized : null;
}

export function getStoredBillingCurrency(): BillingCurrency | null {
  if (typeof window === 'undefined') return null;
  return normalizeBillingCurrency(window.localStorage.getItem(BILLING_CURRENCY_STORAGE_KEY));
}

export function persistBillingCurrency(currency: BillingCurrency) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(BILLING_CURRENCY_STORAGE_KEY, currency);
}

export function getInitialBillingCurrency(language?: string): BillingCurrency {
  const stored = getStoredBillingCurrency();
  if (stored) return stored;

  if (typeof window === 'undefined') return 'eur';

  const languageCandidates = [
    language,
    document.cookie
      .split('; ')
      .find((item) => item.startsWith('lang='))
      ?.split('=')[1],
    navigator.language,
    ...(navigator.languages || []),
  ].filter(Boolean);

  if (languageCandidates.some((candidate) => candidate?.toLowerCase().startsWith('pl'))) {
    return 'pln';
  }
  if (languageCandidates.some((candidate) => candidate?.toLowerCase() === 'en-us')) {
    return 'usd';
  }

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if ([
    'America/New_York',
    'America/Detroit',
    'America/Kentucky/Louisville',
    'America/Kentucky/Monticello',
    'America/Indiana/Indianapolis',
    'America/Indiana/Vincennes',
    'America/Indiana/Winamac',
    'America/Indiana/Marengo',
    'America/Indiana/Petersburg',
    'America/Indiana/Vevay',
    'America/Chicago',
    'America/Indiana/Tell_City',
    'America/Indiana/Knox',
    'America/Menominee',
    'America/North_Dakota/Center',
    'America/North_Dakota/New_Salem',
    'America/North_Dakota/Beulah',
    'America/Denver',
    'America/Boise',
    'America/Phoenix',
    'America/Los_Angeles',
    'America/Anchorage',
    'America/Juneau',
    'America/Sitka',
    'America/Metlakatla',
    'America/Yakutat',
    'America/Nome',
    'America/Adak',
    'Pacific/Honolulu',
  ].includes(timeZone)) {
    return 'usd';
  }

  return timeZone === 'Europe/Warsaw' ? 'pln' : 'eur';
}

export function getPlanPrice(plan: PaidPlan, currency: BillingCurrency, cycle: BillingCycle): number {
  return planPrices[plan][currency][cycle];
}

export function formatPlanPrice(plan: PaidPlan, currency: BillingCurrency, cycle: BillingCycle): string {
  return `${getPlanPrice(plan, currency, cycle)} ${currency.toUpperCase()}`;
}

export function formatPlanPriceWithPeriod(
  plan: PaidPlan,
  currency: BillingCurrency,
  cycle: BillingCycle,
): string {
  const period = cycle === 'monthly' ? 'month' : 'year';
  return `${formatPlanPrice(plan, currency, cycle)}/${period}`;
}
