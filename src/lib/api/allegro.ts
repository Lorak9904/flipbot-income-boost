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
