import type { ListingStatisticMetric } from '@/types/item';

export const formatStatisticMetricValue = (metric: ListingStatisticMetric): string => {
  if (metric.value === null || metric.value === undefined) return '-';
  if (metric.kind === 'rate') {
    return `${Number(metric.value).toFixed(2)}${metric.unit || '%'}`;
  }
  return new Intl.NumberFormat().format(Number(metric.value));
};

export const formatStatisticDelta = (metric: ListingStatisticMetric): string | null => {
  if (metric.delta_value === null || metric.delta_value === undefined) return null;
  const value = Number(metric.delta_value);
  const sign = value > 0 ? '+' : '';
  const percent = metric.delta_percent !== null && metric.delta_percent !== undefined
    ? ` (${sign}${Number(metric.delta_percent).toFixed(1)}%)`
    : '';
  const formattedValue = metric.kind === 'rate'
    ? value.toFixed(2)
    : new Intl.NumberFormat().format(value);
  return `${sign}${formattedValue}${metric.unit || ''}${percent}`;
};

export const pickPrimaryStatisticMetric = (
  metrics: ListingStatisticMetric[],
  preferredKeys: string[] = ['views', 'impressions', 'sold_quantity']
): ListingStatisticMetric | undefined => {
  for (const key of preferredKeys) {
    const metric = metrics.find((candidate) => candidate.key === key);
    if (metric) return metric;
  }
  return metrics[0];
};

export const getStatisticMetricNumber = (
  metrics: ListingStatisticMetric[],
  key: string
): number => {
  const metric = metrics.find((candidate) => candidate.key === key);
  const value = metric?.value;
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
};
