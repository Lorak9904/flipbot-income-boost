import type { PriceCheckComparable } from '@/lib/api/price-checks';

export const IMAGE_SEARCH_MARKETS = new Set(['EBAY_AU', 'EBAY_DE', 'EBAY_GB', 'EBAY_US']);

export const EBAY_PRICE_CHECK_MARKETS = [
  { id: 'EBAY_PL', currency: 'PLN', en: 'eBay Poland', pl: 'eBay Polska' },
  { id: 'EBAY_DE', currency: 'EUR', en: 'eBay Germany', pl: 'eBay Niemcy' },
  { id: 'EBAY_GB', currency: 'GBP', en: 'eBay United Kingdom', pl: 'eBay Wielka Brytania' },
  { id: 'EBAY_US', currency: 'USD', en: 'eBay United States', pl: 'eBay USA' },
  { id: 'EBAY_AU', currency: 'AUD', en: 'eBay Australia', pl: 'eBay Australia' },
  { id: 'EBAY_FR', currency: 'EUR', en: 'eBay France', pl: 'eBay Francja' },
  { id: 'EBAY_IT', currency: 'EUR', en: 'eBay Italy', pl: 'eBay Włochy' },
  { id: 'EBAY_ES', currency: 'EUR', en: 'eBay Spain', pl: 'eBay Hiszpania' },
  { id: 'EBAY_NL', currency: 'EUR', en: 'eBay Netherlands', pl: 'eBay Holandia' },
  { id: 'EBAY_BE', currency: 'EUR', en: 'eBay Belgium', pl: 'eBay Belgia' },
  { id: 'EBAY_AT', currency: 'EUR', en: 'eBay Austria', pl: 'eBay Austria' },
  { id: 'EBAY_CH', currency: 'CHF', en: 'eBay Switzerland', pl: 'eBay Szwajcaria' },
  { id: 'EBAY_IE', currency: 'EUR', en: 'eBay Ireland', pl: 'eBay Irlandia' },
  { id: 'EBAY_CA', currency: 'CAD', en: 'eBay Canada', pl: 'eBay Kanada' },
] as const;

export interface SelectedPriceStats {
  count: number;
  currency: string;
  median: number | null;
  typicalLow: number | null;
  typicalHigh: number | null;
  deliveredMedian: number | null;
  deliveredCount: number;
}

const percentile = (values: number[], fraction: number): number => {
  if (values.length === 1) return values[0];
  const position = (values.length - 1) * fraction;
  const lower = Math.floor(position);
  const upper = Math.min(lower + 1, values.length - 1);
  return values[lower] + (values[upper] - values[lower]) * (position - lower);
};

export const calculateSelectedPriceStats = (
  items: PriceCheckComparable[],
  selectedIds: Set<string>,
): SelectedPriceStats => {
  const selected = items.filter((item) => selectedIds.has(item.provider_item_id));
  const currency = selected.find((item) => item.currency)?.currency || '';
  const prices = selected
    .filter((item) => !currency || item.currency === currency)
    .map((item) => Number(item.price))
    .filter(Number.isFinite)
    .sort((a, b) => a - b);
  const delivered = selected
    .filter((item) => !currency || item.currency === currency)
    .map((item) => Number(item.delivered_price))
    .filter(Number.isFinite)
    .sort((a, b) => a - b);

  return {
    count: prices.length,
    currency,
    median: prices.length ? percentile(prices, 0.5) : null,
    typicalLow: prices.length ? percentile(prices, 0.25) : null,
    typicalHigh: prices.length ? percentile(prices, 0.75) : null,
    deliveredMedian: delivered.length ? percentile(delivered, 0.5) : null,
    deliveredCount: delivered.length,
  };
};

export const formatPrice = (value: number | null, currency: string, language: 'en' | 'pl') => {
  if (value === null || !Number.isFinite(value)) return '—';
  return new Intl.NumberFormat(language === 'pl' ? 'pl-PL' : 'en-US', {
    style: 'currency',
    currency: currency || 'USD',
    maximumFractionDigits: 2,
  }).format(value);
};
