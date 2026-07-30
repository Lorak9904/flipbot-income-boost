import type { PriceCheckFailureType } from '@/lib/api/price-checks';

type PriceCheckMode = 'keyword' | 'image';

export const priceCheckStartedProperties = (mode: PriceCheckMode, marketplaceId: string) => ({
  mode,
  marketplace_id: marketplaceId,
  outcome: 'started' as const,
});

export const priceCheckCompletedProperties = (
  mode: PriceCheckMode,
  marketplaceId: string,
  outcome: 'completed' | 'no_results',
  sampleCount: number,
) => ({
  mode,
  marketplace_id: marketplaceId,
  outcome,
  sample_count: sampleCount,
});

export const priceCheckFailedProperties = (
  mode: PriceCheckMode,
  marketplaceId: string,
  failureType: PriceCheckFailureType,
) => ({
  mode,
  marketplace_id: marketplaceId,
  outcome: 'failed' as const,
  failure_type: failureType,
});
