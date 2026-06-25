/**
 * Allegro API Integration
 *
 * Handles Allegro marketplace OAuth connection helpers.
 */

const API_BASE = '/api';
const ALLEGRO_TREE_CACHE_TTL_MS = 5 * 60 * 1000;
const allegroTreeCache = new Map<string, { expiresAt: number; payload: AllegroCategoryTreeResponse }>();

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

/**
 * Get Allegro authorization URL to start OAuth flow.
 * @param marketplaceId - Optional marketplace ID (default: allegro-pl)
 */
export async function getAllegroConnectUrl(
  marketplaceId: string = 'allegro-pl'
): Promise<{ auth_url: string }> {
  const response = await fetch(`${API_BASE}/allegro/connect/?marketplace_id=${marketplaceId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication required');
    }
    throw new Error(`Failed to get Allegro connect URL: ${response.statusText}`);
  }

  return response.json();
}

export interface AllegroCategoryNode {
  category_id: string;
  name: string;
  path: string;
  parent_id: string | null;
  depth: number;
  is_leaf: boolean;
  has_children?: boolean;
  options?: Record<string, unknown>;
}

export interface AllegroCategoryCandidate {
  category_id: string;
  name: string;
  path: string;
  score: number;
  source: string;
  depth: number;
  is_leaf: boolean;
  options?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface AllegroCategoryCandidatesResponse {
  draft_id: string;
  status: string;
  message: string;
  strategy: string;
  selected: AllegroCategoryCandidate | null;
  candidates_count: number;
  candidates: AllegroCategoryCandidate[];
  mapping_input?: {
    source_path?: string;
    normalized_path?: string;
    query?: string;
    search_queries?: string[];
    preferred_root_prefixes?: string[];
    marketplace_id?: string;
    language?: string;
    min_confidence?: number;
  };
}

export interface AllegroCategoryTreeResponse {
  marketplace_id: string;
  language: string;
  parent_id: string | null;
  leaf_only: boolean;
  count: number;
  parent: AllegroCategoryNode | null;
  results: AllegroCategoryNode[];
}

export interface AllegroCategorySearchMatch {
  category_id: string;
  name: string;
  path: string;
  score: number;
  depth: number;
  is_leaf: boolean;
  options?: Record<string, unknown>;
}

export interface AllegroCategorySearchResponse {
  query: string;
  marketplace_id: string;
  language: string;
  leaf_only: boolean;
  count: number;
  results: AllegroCategorySearchMatch[];
}

export interface AllegroProductCategoryPathItem {
  id: string;
  name: string;
}

export interface AllegroProductCategory {
  id: string;
  path: AllegroProductCategoryPathItem[];
  similar?: unknown[];
}

export interface AllegroProductParameter {
  id: string;
  name: string;
  values?: Array<string | number>;
  valuesIds?: Array<string | number>;
  valuesLabels?: string[];
  unit?: string | null;
  options?: Record<string, unknown>;
}

export interface AllegroProductSearchResult {
  id: string;
  name: string;
  category: AllegroProductCategory | null;
  parameters: AllegroProductParameter[];
  images: Array<{ url: string }>;
  publication?: Record<string, unknown>;
  has_protected_brand?: boolean;
}

export interface AllegroProductSearchResponse {
  phrase: string;
  category_id: string | null;
  language: string | null;
  count: number;
  products: AllegroProductSearchResult[];
  categories?: Record<string, unknown>;
  filters?: unknown[];
  next_page?: Record<string, unknown> | null;
}

export interface AllegroSellerSettings {
  id?: number;
  marketplace_id: string;
  shipping_rates_id: string;
  return_policy_id: string;
  warranty_id: string;
  implied_warranty_id: string;
  invoice_type: string;
  handling_time: string;
  location_override?: Record<string, unknown> | null;
}

export interface AllegroResourceOption {
  id: string;
  name: string;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown): string {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : '';
}

function toAllegroOption(value: unknown): AllegroResourceOption | null {
  const record = asRecord(value);
  if (!record) return null;

  const id = asString(record.id);
  if (!id) return null;

  return {
    id,
    name: asString(record.name) || asString(record.label) || id,
  };
}

function extractAllegroOptions(payload: unknown, keys: string[]): AllegroResourceOption[] {
  let rows: unknown[] = [];
  const record = asRecord(payload);

  if (Array.isArray(payload)) {
    rows = payload;
  } else if (record) {
    for (const key of keys) {
      if (Array.isArray(record[key])) {
        rows = record[key] as unknown[];
        break;
      }
    }
  }

  return rows
    .map(toAllegroOption)
    .filter((option): option is AllegroResourceOption => Boolean(option));
}

async function parseJsonError(response: Response, fallback: string): Promise<Error> {
  const errorData = await response.json().catch(() => ({}));
  const message = asRecord(errorData)?.detail;
  return new Error(asString(message) || fallback);
}

export async function getAllegroSellerSettings(
  marketplaceId: string = 'allegro-pl'
): Promise<AllegroSellerSettings> {
  const query = new URLSearchParams({ marketplace_id: marketplaceId });
  const response = await fetch(`${API_BASE}/platforms/allegro/seller-settings/?${query.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw await parseJsonError(response, `Failed to fetch Allegro seller settings: ${response.status}`);
  }

  return response.json();
}

export async function updateAllegroSellerSettings(
  settings: Partial<AllegroSellerSettings>,
  marketplaceId: string = settings.marketplace_id || 'allegro-pl'
): Promise<AllegroSellerSettings> {
  const query = new URLSearchParams({ marketplace_id: marketplaceId });
  const response = await fetch(`${API_BASE}/platforms/allegro/seller-settings/?${query.toString()}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    throw await parseJsonError(response, `Failed to save Allegro seller settings: ${response.status}`);
  }

  return response.json();
}

async function getAllegroResourceOptions(
  path: string,
  keys: string[]
): Promise<AllegroResourceOption[]> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw await parseJsonError(response, `Failed to fetch Allegro resources: ${response.status}`);
  }

  return extractAllegroOptions(await response.json(), keys);
}

export function getAllegroShippingRates(): Promise<AllegroResourceOption[]> {
  return getAllegroResourceOptions('/allegro/shipping-rates/', ['shippingRates']);
}

export function getAllegroReturnPolicies(): Promise<AllegroResourceOption[]> {
  return getAllegroResourceOptions('/allegro/return-policies/', ['returnPolicies']);
}

export function getAllegroImpliedWarranties(): Promise<AllegroResourceOption[]> {
  return getAllegroResourceOptions('/allegro/implied-warranties/', ['impliedWarranties']);
}

export function getAllegroWarranties(): Promise<AllegroResourceOption[]> {
  return getAllegroResourceOptions('/allegro/warranties/', ['warranties']);
}

function buildAllegroTreeCacheKey(params?: {
  parentId?: string | null;
  marketplaceId?: string;
  language?: string;
  leafOnly?: boolean;
  limit?: number;
}): string {
  return JSON.stringify({
    parentId: params?.parentId ?? null,
    marketplaceId: params?.marketplaceId ?? 'allegro-pl',
    language: params?.language ?? '',
    leafOnly: params?.leafOnly ?? false,
    limit: params?.limit ?? 0,
  });
}

export async function getAllegroCategoryCandidates(params: {
  draftId: string;
  marketplaceId?: string;
  language?: string;
  includeMappingInput?: boolean;
  candidatesLimit?: number;
  minConfidence?: number;
}): Promise<AllegroCategoryCandidatesResponse> {
  const response = await fetch(`${API_BASE}/allegro/categories/candidates/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      draft_id: params.draftId,
      marketplace_id: params.marketplaceId,
      language: params.language,
      include_mapping_input: params.includeMappingInput ?? true,
      candidates_limit: params.candidatesLimit ?? 12,
      min_confidence: params.minConfidence,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Failed to fetch Allegro category candidates: ${response.status}`
    );
  }

  return response.json();
}

export async function getAllegroCategoryTree(params?: {
  parentId?: string | null;
  marketplaceId?: string;
  language?: string;
  leafOnly?: boolean;
  limit?: number;
}): Promise<AllegroCategoryTreeResponse> {
  const cacheKey = buildAllegroTreeCacheKey(params);
  const cached = allegroTreeCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.payload;
  }

  const query = new URLSearchParams();
  if (params?.parentId) query.set('parent_id', params.parentId);
  if (params?.marketplaceId) query.set('marketplace_id', params.marketplaceId);
  if (params?.language) query.set('language', params.language);
  if (params?.leafOnly !== undefined) query.set('leaf_only', String(params.leafOnly));
  if (params?.limit) query.set('limit', String(params.limit));

  const response = await fetch(
    `${API_BASE}/allegro/categories/tree/${query.toString() ? `?${query.toString()}` : ''}`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to fetch Allegro category tree: ${response.status}`);
  }

  const payload = (await response.json()) as AllegroCategoryTreeResponse;
  allegroTreeCache.set(cacheKey, {
    expiresAt: Date.now() + ALLEGRO_TREE_CACHE_TTL_MS,
    payload,
  });

  return payload;
}

export async function searchAllegroCategories(params: {
  query: string;
  marketplaceId?: string;
  language?: string;
  leafOnly?: boolean;
  limit?: number;
  signal?: AbortSignal;
}): Promise<AllegroCategorySearchResponse> {
  const queryString = (params.query || '').trim();
  if (!queryString) {
    throw new Error('Missing search query');
  }

  const query = new URLSearchParams();
  query.set('q', queryString);
  if (params.marketplaceId) query.set('marketplace_id', params.marketplaceId);
  if (params.language) query.set('language', params.language);
  if (params.leafOnly !== undefined) query.set('leaf_only', String(params.leafOnly));
  if (params.limit) query.set('limit', String(params.limit));

  const response = await fetch(`${API_BASE}/allegro/categories/search/?${query.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders(),
    signal: params.signal,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to search Allegro categories: ${response.status}`);
  }

  return response.json();
}

export async function searchAllegroProducts(params: {
  phrase: string;
  categoryId?: string | number | null;
  language?: string;
  pageSize?: number;
  signal?: AbortSignal;
}): Promise<AllegroProductSearchResponse> {
  const phrase = (params.phrase || '').trim();
  if (!phrase) {
    throw new Error('Missing product search phrase');
  }

  const query = new URLSearchParams();
  query.set('phrase', phrase);
  if (params.categoryId) query.set('category_id', String(params.categoryId));
  if (params.language) query.set('language', params.language);
  if (params.pageSize) query.set('page_size', String(params.pageSize));

  const response = await fetch(`${API_BASE}/allegro/products/search/?${query.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders(),
    signal: params.signal,
  });

  if (!response.ok) {
    throw await parseJsonError(response, `Failed to search Allegro products: ${response.status}`);
  }

  return response.json();
}
