import { Platform } from '@/types/item';

export type PlatformHealthStatus = 'valid' | 'expired' | 'invalid' | null | undefined;

export interface PlatformHealthInfo {
  connected?: boolean;
  stored?: boolean;
  status?: PlatformHealthStatus;
  reason?: string | null;
  invalid_reason?: string | null;
  code?: string;
  message?: string;
  action_key?: string;
  app_configured?: boolean;
  marketplace_id?: string | null;
  shop_id?: string | null;
  shop_name?: string | null;
  accounts?: Array<{
    id?: number | null;
    country_code?: string;
    country_name?: string;
    base_url?: string;
    currency?: string;
    is_default?: boolean;
    connected?: boolean;
    stored?: boolean;
    status?: PlatformHealthStatus;
    reason?: string | null;
    profile?: {
      name?: string;
      email?: string;
      status?: string;
      is_business?: boolean;
    } | null;
  }>;
  countries?: Array<{
    country_code: string;
    country_name: string;
    base_url: string;
    currency: string;
  }>;
}

export interface PlatformHealthResponse {
  checked_at?: string;
  platforms: Record<Platform, PlatformHealthInfo>;
}

const HEALTH_URL = '/api/platforms/health-check/';

export async function fetchPlatformHealth(): Promise<PlatformHealthResponse> {
  const token = localStorage.getItem('flipit_token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(HEALTH_URL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication required');
    }
    throw new Error(`Failed to fetch platform health: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    checked_at: data?.checked_at,
    platforms: data?.platforms || {},
  };
}

export function toPlatformConnectedMap(
  platforms: Record<string, PlatformHealthInfo> | undefined
): Record<Platform, boolean> {
  const platformList: Platform[] = ['facebook', 'olx', 'vinted', 'ebay', 'allegro', 'etsy'];
  const result: Record<Platform, boolean> = {
    facebook: false,
    olx: false,
    vinted: false,
    ebay: false,
    allegro: false,
    etsy: false,
  };

  for (const platform of platformList) {
    const info = platforms?.[platform];
    const stored = !!info?.stored;
    const status = info?.status;
    result[platform] = stored && status !== 'expired' && status !== 'invalid';
  }

  return result;
}
