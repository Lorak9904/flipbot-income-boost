import { queryOptions } from '@tanstack/react-query';

import { ALL_PLATFORMS } from '@/lib/platforms';
import type { Platform } from '@/types/item';

export type CapabilityStatus = 'certified' | 'beta' | 'experimental' | 'unavailable';
export type IntegrationMethod = 'official_api' | 'session_based';

export type MarketplaceOperation =
  | 'connection'
  | 'connection_health'
  | 'import'
  | 'draft_creation'
  | 'metadata'
  | 'image_handling'
  | 'publish'
  | 'update'
  | 'delete'
  | 'sold_state_sync'
  | 'inventory_order_sync'
  | 'error_recovery'
  | 'disconnect'
  | 'sandbox_testing'
  | 'production_verification';

export interface MarketplaceCapability {
  status: CapabilityStatus;
  available: boolean;
  reason_code: string | null;
}

export interface MarketplaceCapabilitySet {
  integration_method: IntegrationMethod;
  overall_status: CapabilityStatus;
  capabilities: Record<MarketplaceOperation, MarketplaceCapability>;
}

export type MarketplaceCapabilities = Record<Platform, MarketplaceCapabilitySet>;

export interface MarketplaceCapabilitiesResponse {
  version: number;
  statuses: CapabilityStatus[];
  operations: MarketplaceOperation[];
  marketplaces: MarketplaceCapabilities;
}

const CAPABILITIES_URL = '/api/platforms/capabilities/';

export async function fetchPlatformCapabilities(): Promise<MarketplaceCapabilitiesResponse> {
  const response = await fetch(CAPABILITIES_URL, {
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch marketplace capabilities: ${response.statusText}`);
  }

  const data = (await response.json()) as MarketplaceCapabilitiesResponse;
  if (!data?.marketplaces || !ALL_PLATFORMS.every((platform) => data.marketplaces[platform])) {
    throw new Error('Marketplace capability response is incomplete');
  }
  return data;
}

export const platformCapabilitiesQueryOptions = () =>
  queryOptions({
    queryKey: ['marketplace-capabilities'],
    queryFn: fetchPlatformCapabilities,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

export function getMarketplaceCapability(
  marketplaces: MarketplaceCapabilities | null | undefined,
  platform: Platform,
  operation: MarketplaceOperation
): MarketplaceCapability | null {
  return marketplaces?.[platform]?.capabilities?.[operation] ?? null;
}

export function canUseMarketplaceCapability(
  marketplaces: MarketplaceCapabilities | null | undefined,
  platform: Platform,
  operation: MarketplaceOperation
): boolean {
  return getMarketplaceCapability(marketplaces, platform, operation)?.available === true;
}
