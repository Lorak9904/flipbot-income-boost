/**
 * OLX API Integration
 * 
 * Handles OLX marketplace connection, status checks, and token management.
 */

// Base URL for API calls
// Update this if your backend is hosted elsewhere
const API_BASE = '/api';
const OLX_TREE_CACHE_TTL_MS = 5 * 60 * 1000;

const olxTreeCache = new Map<string, { expiresAt: number; payload: OlxCategoryTreeResponse }>();

export interface OlxConnectionStatus {
  connected: boolean;
  valid: boolean;
  expires_at: string | null;
  needs_reconnect: boolean;
  message?: string;
}

export interface OlxSyncSummary {
  inserted: number;
  updated: number;
  skipped: number;
  errors: number;
  total_fetched: number;
}

export interface OlxSyncResponse {
  success: boolean;
  message: string;
  summary?: OlxSyncSummary;
  error?: string;
  action_required?: string;
}

export interface OlxCategoryNode {
  category_id: number;
  name: string;
  path: string;
  parent_id: number | null;
  photos_limit?: number | null;
  is_leaf: boolean;
  has_children?: boolean;
  ancestors?: OlxCategoryNode[];
  score?: number;
  source?: string;
}

export interface OlxCategoryTreeResponse {
  parent_id: number | null;
  count: number;
  parent: OlxCategoryNode | null;
  results: OlxCategoryNode[];
  source?: 'local' | 'remote';
}

export interface OlxCategoryPathResponse {
  category_id: number;
  selected: OlxCategoryNode | null;
  path: OlxCategoryNode[];
  path_text: string;
  source?: 'local' | 'remote';
}

export interface OlxCategorySearchResponse {
  query: string;
  count: number;
  results: OlxCategoryNode[];
  source?: 'local' | 'remote';
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('flipit_token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

function buildOlxTreeCacheKey(params?: { parentId?: number | null; limit?: number }): string {
  return JSON.stringify({
    parentId: params?.parentId ?? null,
    limit: params?.limit ?? 0,
  });
}

/**
 * Get OLX connection status for the current user
 */
export async function getOlxStatus(): Promise<OlxConnectionStatus> {
  const response = await fetch(`${API_BASE}/olx/status/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication required');
    }
    throw new Error(`Failed to check OLX status: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get OLX authorization URL to start OAuth flow
 */
export async function getOlxConnectUrl(): Promise<{ auth_url: string }> {
  const response = await fetch(`${API_BASE}/olx/connect/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication required');
    }
    throw new Error(`Failed to get OLX connect URL: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Check if an error response indicates OLX token expiration
 */
type OlxErrorPayload = {
  error?: string;
  action_required?: string;
  message?: string;
  detail?: string;
};

export function isOlxTokenExpiredError(error: unknown): boolean {
  if (!error) return false;
  if (typeof error !== 'object') return false;

  const payload = error as OlxErrorPayload;
  
  // Check for specific error structure from backend
  if (payload.error === 'olx_token_expired') return true;
  if (payload.action_required === 'reconnect_olx') return true;
  
  // Check error message
  const message = payload.message || payload.detail || '';
  return message.toLowerCase().includes('olx') && 
         (message.toLowerCase().includes('expired') || 
          message.toLowerCase().includes('invalid') ||
          message.toLowerCase().includes('reconnect'));
}

/**
 * Handle OLX token expiration by redirecting to settings
 */
export function handleOlxTokenExpired(): void {
  // Store the current location to return after reconnecting
  sessionStorage.setItem('olx_reconnect_return', window.location.pathname);
  
  // Redirect to settings with reconnect flag
  window.location.href = '/settings?reconnect=olx&message=OLX+token+expired';
}

/**
 * Sync OLX listings with FlipIt database
 * 
 * Fetches all user's OLX adverts and imports them as DraftItems.
 * Existing items (matched by external_id) are updated with fresh data.
 * New items are created as published drafts.
 */
export async function syncOlxListings(): Promise<OlxSyncResponse> {
  const response = await fetch(`${API_BASE}/olx/sync/`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  const data: OlxSyncResponse = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      if (data.error === 'olx_token_expired' || data.action_required === 'reconnect_olx') {
        handleOlxTokenExpired();
      }
      throw new Error('Authentication required');
    }
    if (response.status === 400 && data.error === 'olx_not_connected') {
      throw new Error('Please connect your OLX account first');
    }
    throw new Error(data.message || `Failed to sync OLX listings: ${response.statusText}`);
  }

  return data;
}

export async function getOlxCategoryTree(params?: {
  parentId?: number | null;
  signal?: AbortSignal;
}): Promise<OlxCategoryTreeResponse> {
  const cacheKey = buildOlxTreeCacheKey(params);
  const cached = olxTreeCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.payload;
  }

  const query = new URLSearchParams();
  if (params?.parentId !== undefined && params.parentId !== null) {
    query.set('parent_id', String(params.parentId));
  }

  const response = await fetch(
    `${API_BASE}/olx/categories/tree/${query.toString() ? `?${query.toString()}` : ''}`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
      signal: params?.signal,
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.message || `Failed to fetch OLX categories: ${response.status}`);
  }

  const payload = (await response.json()) as OlxCategoryTreeResponse;
  olxTreeCache.set(cacheKey, {
    expiresAt: Date.now() + OLX_TREE_CACHE_TTL_MS,
    payload,
  });
  return payload;
}

export async function getOlxCategoryPath(params: {
  categoryId: string | number;
  signal?: AbortSignal;
}): Promise<OlxCategoryPathResponse> {
  const query = new URLSearchParams({ category_id: String(params.categoryId) });
  const response = await fetch(`${API_BASE}/olx/categories/path/?${query.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders(),
    signal: params.signal,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.message || `Failed to resolve OLX category: ${response.status}`);
  }

  return response.json();
}

export async function searchOlxCategories(params: {
  query: string;
  limit?: number;
  signal?: AbortSignal;
}): Promise<OlxCategorySearchResponse> {
  const queryString = params.query.trim();
  if (queryString.length < 2) {
    return { query: queryString, count: 0, results: [] };
  }

  const query = new URLSearchParams({ q: queryString });
  if (params.limit) {
    query.set('limit', String(params.limit));
  }

  const response = await fetch(`${API_BASE}/olx/categories/search/?${query.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders(),
    signal: params.signal,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.message || `Failed to search OLX categories: ${response.status}`);
  }

  return response.json();
}
