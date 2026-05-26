export const SUPPORTED_CURRENCIES = ['PLN', 'USD', 'EUR', 'GBP'] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export function normalizeCurrency(value?: string | null): SupportedCurrency | undefined {
  const normalized = value?.trim().toUpperCase();
  return SUPPORTED_CURRENCIES.find((currency) => currency === normalized);
}

export function defaultCurrencyForLanguage(language?: string | null): SupportedCurrency {
  return language?.trim().toLowerCase().startsWith('pl') ? 'PLN' : 'USD';
}

export function resolveCurrency(value?: string | null, language?: string | null): SupportedCurrency {
  return normalizeCurrency(value) || defaultCurrencyForLanguage(language);
}

export function formatMoney(value: string | number | null | undefined, currency?: string | null): string {
  const amount = typeof value === 'number' ? value : Number(value);
  const resolvedCurrency = normalizeCurrency(currency) || 'USD';

  if (!Number.isFinite(amount)) {
    return `-- ${resolvedCurrency}`;
  }

  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: resolvedCurrency,
      maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(Number.isInteger(amount) ? 0 : 2)} ${resolvedCurrency}`;
  }
}
