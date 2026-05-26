/**
 * Vinted API Integration
 *
 * Handles Vinted sync actions for importing listings into FlipIt.
 */

import type { MarketplaceAttributeState } from '@/types/item';

const API_BASE = '/api';

export interface VintedSyncSummary {
  inserted: number;
  updated: number;
  skipped: number;
  errors: number;
  total_fetched: number;
}

export interface VintedSyncResponse {
  success: boolean;
  message: string;
  summary?: VintedSyncSummary;
  error?: string;
  action_required?: string | null;
  status?: string;
  status_code?: number;
}

export interface VintedCategoryOption {
  id: number;
  title: string;
  code?: string;
  parent_id?: number | null;
  item_count?: number;
}

export interface VintedCategoryAttributesResponse {
  platform: 'vinted';
  catalog_id: number;
  fields: MarketplaceAttributeState['fields'];
  values: MarketplaceAttributeState['values'];
  marketplace_attributes: {
    vinted: MarketplaceAttributeState;
  };
  required_fields?: MarketplaceAttributeState['fields'];
  errors?: Record<string, string>;
}

const VINTED_CATEGORIES_CACHE_TTL_MS = 10 * 60 * 1000;
let vintedCategoriesCache: { expiresAt: number; categories: VintedCategoryOption[] } | null = null;

export async function syncVintedListings(): Promise<VintedSyncResponse> {
  const token = localStorage.getItem('flipit_token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE}/vinted/sync/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  const data: VintedSyncResponse = await response.json();

  if (!response.ok) {
    if (response.status === 400 && data.error === 'vinted_not_connected') {
      throw new Error('Please connect your Vinted account first');
    }
    if (response.status === 401 || response.status === 403) {
      throw new Error(data.message || 'Authentication required');
    }
    throw new Error(data.message || `Failed to sync Vinted listings: ${response.statusText}`);
  }

  return data;
}

export async function getVintedCategories(options?: {
  forceRefresh?: boolean;
  source?: 'local' | 'remote';
  signal?: AbortSignal;
}): Promise<VintedCategoryOption[]> {
  if (
    !options?.forceRefresh &&
    vintedCategoriesCache &&
    vintedCategoriesCache.expiresAt > Date.now()
  ) {
    return vintedCategoriesCache.categories;
  }

  const token = localStorage.getItem('flipit_token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const params = new URLSearchParams();
  if (options?.source) {
    params.set('source', options.source);
  }

  const response = await fetch(
    `${API_BASE}/vinted/categories/${params.toString() ? `?${params.toString()}` : ''}`,
    {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    signal: options?.signal,
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Failed to fetch Vinted categories: ${response.status}`
    );
  }

  const data = await response.json();
  if (!Array.isArray(data?.categories)) {
    return [];
  }

  const categories = data.categories as VintedCategoryOption[];
  vintedCategoriesCache = {
    expiresAt: Date.now() + VINTED_CATEGORIES_CACHE_TTL_MS,
    categories,
  };

  return categories;
}

export async function getVintedCategoryAttributes(
  catalogId: string | number
): Promise<MarketplaceAttributeState> {
  const token = localStorage.getItem('flipit_token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE}/vinted/categories/${catalogId}/attributes/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Failed to fetch Vinted attributes: ${response.status}`
    );
  }

  const data = (await response.json()) as VintedCategoryAttributesResponse;
  return data.marketplace_attributes?.vinted || {
    platform: 'vinted',
    category_id: data.catalog_id,
    fields: data.fields || [],
    values: data.values || {},
  };
}
