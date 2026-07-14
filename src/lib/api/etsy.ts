import { waitForMarketplaceImport, type QueuedImportResponse } from '@/lib/api/import-jobs';

const API_BASE = '/api';
const ETSY_TREE_CACHE_TTL_MS = 5 * 60 * 1000;

const etsyTreeCache = new Map<string, { expiresAt: number; payload: EtsyCategoryTreeResponse }>();

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('flipit_token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

async function parseJsonError(response: Response, fallback: string): Promise<Error> {
  const errorData = await response.json().catch(() => ({}));
  const detail = typeof errorData.detail === 'string' ? errorData.detail : '';
  const message = typeof errorData.message === 'string' ? errorData.message : '';
  return new Error(detail || message || fallback);
}

export interface EtsyConnectionStatus {
  connected: boolean;
  valid: boolean;
  expires_at: string | null;
  needs_reconnect: boolean;
  shop_id: string | null;
  shop_name?: string;
  message?: string;
}

export interface EtsySyncSummary {
  inserted: number;
  updated: number;
  skipped: number;
  errors: number;
  total_fetched: number;
}

export interface EtsySyncResponse extends QueuedImportResponse {
  summary?: EtsySyncSummary;
  detail?: string;
}

export interface EtsyCategoryNode {
  category_id: number;
  name: string;
  path: string;
  parent_id: number | null;
  depth: number;
  is_leaf: boolean;
  has_children?: boolean;
  score?: number;
  source?: string;
}

export interface EtsyCategoryTreeResponse {
  parent_id: number | null;
  count: number;
  results: EtsyCategoryNode[];
}

export interface EtsyCategorySearchResponse {
  query: string;
  leaf_only: boolean;
  count: number;
  results: EtsyCategoryNode[];
}

export interface EtsyCategoryPathResponse {
  taxonomy_id: number;
  path: EtsyCategoryNode[];
}

export interface EtsyShippingProfile {
  shipping_profile_id?: number | string;
  title?: string;
  name?: string;
  [key: string]: unknown;
}

export interface EtsySellerSettings {
  id?: number;
  shop_id: string;
  shipping_profile_id: string;
  return_policy_id: string;
  readiness_state_id: string;
  who_made: string;
  when_made: string;
  is_supply: boolean;
  should_auto_renew: boolean;
}

export async function getEtsyConnectUrl(): Promise<{ auth_url: string }> {
  const response = await fetch(`${API_BASE}/etsy/connect/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw await parseJsonError(response, `Failed to get Etsy connect URL: ${response.status}`);
  }

  return response.json();
}

export async function getEtsyStatus(): Promise<EtsyConnectionStatus> {
  const response = await fetch(`${API_BASE}/etsy/status/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw await parseJsonError(response, `Failed to fetch Etsy status: ${response.status}`);
  }

  return response.json();
}

export async function getEtsySellerSettings(): Promise<EtsySellerSettings> {
  const response = await fetch(`${API_BASE}/platforms/etsy/seller-settings/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw await parseJsonError(response, `Failed to fetch Etsy seller settings: ${response.status}`);
  }

  return response.json();
}

export async function updateEtsySellerSettings(
  settings: Partial<EtsySellerSettings>
): Promise<EtsySellerSettings> {
  const response = await fetch(`${API_BASE}/platforms/etsy/seller-settings/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    throw await parseJsonError(response, `Failed to save Etsy seller settings: ${response.status}`);
  }

  return response.json();
}

export async function syncEtsyListings(): Promise<EtsySyncResponse> {
  const response = await fetch(`${API_BASE}/etsy/sync/`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  const data = (await response.json().catch(() => ({}))) as EtsySyncResponse;

  if (!response.ok) {
    if (response.status === 400 && data.error === 'etsy_not_connected') {
      throw new Error('Please connect your Etsy account first');
    }
    if (response.status === 401 || data.action_required === 'reconnect_etsy') {
      throw new Error(data.message || data.detail || 'Etsy authentication required');
    }
    throw new Error(data.message || data.detail || `Failed to sync Etsy listings: ${response.status}`);
  }

  return waitForMarketplaceImport(data, { platformLabel: 'Etsy' });
}

export async function getEtsyShippingProfiles(): Promise<{
  shop_id: string;
  selected_shipping_profile_id: string;
  profiles: EtsyShippingProfile[];
}> {
  const response = await fetch(`${API_BASE}/etsy/shipping-profiles/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw await parseJsonError(response, `Failed to fetch Etsy shipping profiles: ${response.status}`);
  }

  return response.json();
}

function buildEtsyTreeCacheKey(params?: { parentId?: number | null }): string {
  return JSON.stringify({ parentId: params?.parentId ?? null });
}

export async function getEtsyCategoryTree(params?: {
  parentId?: number | null;
  signal?: AbortSignal;
}): Promise<EtsyCategoryTreeResponse> {
  const cacheKey = buildEtsyTreeCacheKey(params);
  const cached = etsyTreeCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.payload;
  }

  const query = new URLSearchParams();
  if (params?.parentId !== undefined && params.parentId !== null) {
    query.set('parent_id', String(params.parentId));
  }

  const response = await fetch(
    `${API_BASE}/etsy/categories/tree/${query.toString() ? `?${query.toString()}` : ''}`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
      signal: params?.signal,
    }
  );

  if (!response.ok) {
    throw await parseJsonError(response, `Failed to fetch Etsy categories: ${response.status}`);
  }

  const payload = (await response.json()) as EtsyCategoryTreeResponse;
  etsyTreeCache.set(cacheKey, {
    expiresAt: Date.now() + ETSY_TREE_CACHE_TTL_MS,
    payload,
  });
  return payload;
}

export async function getEtsyCategoryPath(params: {
  taxonomyId: string | number;
  signal?: AbortSignal;
}): Promise<EtsyCategoryPathResponse> {
  const query = new URLSearchParams({ taxonomy_id: String(params.taxonomyId) });
  const response = await fetch(`${API_BASE}/etsy/categories/path/?${query.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders(),
    signal: params.signal,
  });

  if (!response.ok) {
    throw await parseJsonError(response, `Failed to resolve Etsy category: ${response.status}`);
  }

  return response.json();
}

export async function searchEtsyCategories(params: {
  query: string;
  leafOnly?: boolean;
  limit?: number;
  signal?: AbortSignal;
}): Promise<EtsyCategorySearchResponse> {
  const queryString = params.query.trim();
  if (queryString.length < 2) {
    return { query: queryString, leaf_only: params.leafOnly ?? true, count: 0, results: [] };
  }

  const query = new URLSearchParams({ q: queryString });
  if (params.leafOnly !== undefined) {
    query.set('leaf_only', String(params.leafOnly));
  }
  if (params.limit) {
    query.set('limit', String(params.limit));
  }

  const response = await fetch(`${API_BASE}/etsy/categories/search/?${query.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders(),
    signal: params.signal,
  });

  if (!response.ok) {
    throw await parseJsonError(response, `Failed to search Etsy categories: ${response.status}`);
  }

  return response.json();
}
