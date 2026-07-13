import {
  UserItemsListResponse,
  UserItem,
  ItemStats,
  Platform,
  ItemStatus,
  ItemStatusGroup,
  ListingStatisticsResponse,
  MarketplaceAttributes,
  PlatformStatisticsResponse,
  PlatformOverrides,
} from '@/types/item';

const API_BASE = '/api';

type RawUserItem = Partial<UserItem> & {
  id?: string;
  uuid?: string;
};

interface RawUserItemsResponse {
  items?: unknown[];
  total?: number;
  count?: number;
  page?: number;
  page_size?: number;
  total_pages?: number;
}

interface ApiErrorPayload {
  detail?: string;
}

const isRawUserItem = (value: unknown): value is RawUserItem =>
  typeof value === 'object' && value !== null;

const withUuid = (item: RawUserItem): UserItem => ({
  ...item,
  uuid: item.id || item.uuid || '',
}) as UserItem;

export interface FetchItemsParams {
  page?: number;
  page_size?: number;
  status?: ItemStatus;
  status_group?: ItemStatusGroup;
  platform?: Platform;
}

export interface RefreshListingStatusesParams {
  item_ids?: string[];
  platforms?: Platform[];
}

export interface PlatformStatusRefreshResult {
  status: 'success' | 'partial_success' | 'unsupported' | 'skipped' | 'error';
  message?: string;
  error?: string;
  summary?: Record<string, unknown>;
}

export interface RefreshListingStatusesResponse {
  status: 'success' | 'partial_success' | 'unsupported' | 'error';
  supported_platforms: Platform[];
  results: Partial<Record<Platform, PlatformStatusRefreshResult>>;
  items: UserItem[];
}

export interface DuplicateSuggestionItem {
  id: string;
  uuid: string;
  title?: string | null;
  description?: string | null;
  price?: string | number | null;
  currency?: string | null;
  images?: UserItem['images'];
  platforms: Platform[];
  status?: ItemStatus;
}

export interface DuplicateFieldConflict {
  field: string;
  primary_value?: unknown;
  duplicate_value?: unknown;
  resolution?: 'primary_kept' | string;
}

export interface DuplicateSuggestion {
  key: string;
  score: number;
  confidence: 'high' | 'medium';
  reasons: string[];
  field_conflicts?: DuplicateFieldConflict[];
  primary_item: DuplicateSuggestionItem;
  duplicate_item: DuplicateSuggestionItem;
  merged_platforms: Platform[];
}

export interface DuplicateSuggestionsResponse {
  count: number;
  suggestions: DuplicateSuggestion[];
}

export interface MergeDuplicateItemsResponse {
  status: 'merged';
  merged_item_id: string;
  score: number;
  reasons: string[];
  item: UserItem;
}

export interface DismissDuplicateSuggestionResponse {
  status: 'dismissed';
  pair_key: string;
}

export interface UnmergeDuplicateItemResponse {
  status: 'unmerged';
  primary_item: UserItem;
  restored_item: UserItem;
}

export interface BulkMergeDuplicateResult {
  status: 'merged' | 'error';
  primary_item_id: string;
  duplicate_item_id?: string;
  merged_item_id?: string;
  score?: number;
  message?: string;
}

export interface BulkMergeDuplicateSuggestionsResponse {
  status: 'success' | 'partial_success';
  merged_count: number;
  results: BulkMergeDuplicateResult[];
}

const withSuggestionItemUuid = (item: Omit<DuplicateSuggestionItem, 'uuid'> & { uuid?: string }): DuplicateSuggestionItem => ({
  ...item,
  uuid: item.id || item.uuid || '',
});

/**
 * Fetch user's items with optional filtering and pagination
 */
export async function fetchUserItems(params: FetchItemsParams = {}): Promise<UserItemsListResponse> {
  const token = localStorage.getItem('flipit_token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const searchParams = new URLSearchParams();
  if (params.page !== undefined) searchParams.set('page', params.page.toString());
  if (params.page_size !== undefined) searchParams.set('page_size', params.page_size.toString());
  if (params.status) searchParams.set('status', params.status);
  if (params.status_group) searchParams.set('status_group', params.status_group);
  if (params.platform) searchParams.set('platform', params.platform);

  const url = `${API_BASE}/items/?${searchParams.toString()}`;
  
  const response = await fetch(url, {
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
    throw new Error(`Failed to fetch items: ${response.statusText}`);
  }

  const data = (await response.json()) as RawUserItemsResponse;
  const rawItems = Array.isArray(data.items) ? data.items.filter(isRawUserItem) : [];

  const items = rawItems.map((item) => {
    const transformed = withUuid(item);
    if (!transformed.uuid) {
      console.warn('Item missing UUID:', item);
    }
    return transformed;
  });

  const defaultPage = params.page ?? 1;
  const defaultPageSize = params.page_size ?? 10;
  const total =
    typeof data.total === 'number'
      ? data.total
      : typeof data.count === 'number'
        ? data.count
        : items.length;
  const page = typeof data.page === 'number' ? data.page : defaultPage;
  const pageSize = typeof data.page_size === 'number' ? data.page_size : defaultPageSize;
  const totalPages =
    typeof data.total_pages === 'number'
      ? data.total_pages
      : Math.max(1, Math.ceil(total / Math.max(pageSize, 1)));

  console.log('Fetched items:', items.length, 'items');

  return {
    items,
    total,
    page,
    page_size: pageSize,
    total_pages: totalPages,
  };
}

/**
 * Refresh remote marketplace statuses for selected listing cards.
 */
export async function refreshListingStatuses(
  params: RefreshListingStatusesParams = {}
): Promise<RefreshListingStatusesResponse> {
  const token = localStorage.getItem('flipit_token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE}/items/refresh-statuses/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication required');
    }
    const errorData = (await response.json().catch(() => ({}))) as ApiErrorPayload;
    throw new Error(errorData.detail || `Failed to refresh listing statuses: ${response.statusText}`);
  }

  const data = (await response.json()) as Omit<RefreshListingStatusesResponse, 'items'> & { items?: unknown[] };
  const rawItems = Array.isArray(data.items) ? data.items.filter(isRawUserItem) : [];
  return {
    ...data,
    items: rawItems.map(withUuid),
  };
}

export async function fetchDuplicateSuggestions(params: {
  item_ids?: string[];
  limit?: number;
} = {}): Promise<DuplicateSuggestionsResponse> {
  const token = localStorage.getItem('flipit_token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const searchParams = new URLSearchParams();
  if (params.item_ids && params.item_ids.length > 0) {
    searchParams.set('item_ids', params.item_ids.join(','));
  }
  if (params.limit !== undefined) {
    searchParams.set('limit', params.limit.toString());
  }

  const query = searchParams.toString();
  const response = await fetch(`${API_BASE}/items/duplicate-suggestions/${query ? `?${query}` : ''}`, {
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
    const errorData = (await response.json().catch(() => ({}))) as ApiErrorPayload;
    throw new Error(errorData.detail || `Failed to fetch duplicate suggestions: ${response.statusText}`);
  }

  const data = (await response.json()) as DuplicateSuggestionsResponse;
  return {
    ...data,
    suggestions: (data.suggestions || []).map((suggestion) => ({
      ...suggestion,
      primary_item: withSuggestionItemUuid(suggestion.primary_item),
      duplicate_item: withSuggestionItemUuid(suggestion.duplicate_item),
    })),
  };
}

export async function mergeDuplicateItems(
  primaryItemId: string,
  duplicateItemId: string
): Promise<MergeDuplicateItemsResponse> {
  const token = localStorage.getItem('flipit_token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE}/items/duplicates/merge/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      primary_item_id: primaryItemId,
      duplicate_item_id: duplicateItemId,
    }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication required');
    }
    const errorData = (await response.json().catch(() => ({}))) as ApiErrorPayload;
    throw new Error(errorData.detail || `Failed to merge duplicate listings: ${response.statusText}`);
  }

  const data = (await response.json()) as Omit<MergeDuplicateItemsResponse, 'item'> & { item?: RawUserItem };
  return {
    ...data,
    item: withUuid(data.item || {}),
  };
}

export async function dismissDuplicateSuggestion(
  primaryItemId: string,
  duplicateItemId: string
): Promise<DismissDuplicateSuggestionResponse> {
  const token = localStorage.getItem('flipit_token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE}/items/duplicates/dismiss/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      primary_item_id: primaryItemId,
      duplicate_item_id: duplicateItemId,
    }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication required');
    }
    const errorData = (await response.json().catch(() => ({}))) as ApiErrorPayload;
    throw new Error(errorData.detail || `Failed to dismiss duplicate suggestion: ${response.statusText}`);
  }

  return response.json();
}

export async function unmergeDuplicateItem(mergedItemId: string): Promise<UnmergeDuplicateItemResponse> {
  const token = localStorage.getItem('flipit_token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE}/items/duplicates/unmerge/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      merged_item_id: mergedItemId,
    }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication required');
    }
    const errorData = (await response.json().catch(() => ({}))) as ApiErrorPayload;
    throw new Error(errorData.detail || `Failed to undo duplicate merge: ${response.statusText}`);
  }

  const data = (await response.json()) as Omit<UnmergeDuplicateItemResponse, 'primary_item' | 'restored_item'> & {
    primary_item?: RawUserItem;
    restored_item?: RawUserItem;
  };
  return {
    ...data,
    primary_item: withUuid(data.primary_item || {}),
    restored_item: withUuid(data.restored_item || {}),
  };
}

export async function bulkMergeDuplicateSuggestions(
  pairs: Array<{ primary_item_id: string; duplicate_item_id: string }>
): Promise<BulkMergeDuplicateSuggestionsResponse> {
  const token = localStorage.getItem('flipit_token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE}/items/duplicates/bulk-merge/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ pairs }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication required');
    }
    const errorData = (await response.json().catch(() => ({}))) as ApiErrorPayload;
    throw new Error(errorData.detail || `Failed to bulk merge duplicate listings: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch a single item by UUID
 */
export async function fetchItemDetail(uuid: string): Promise<UserItem> {
  const token = localStorage.getItem('flipit_token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE}/items/${uuid}/`, {
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
    if (response.status === 404) {
      throw new Error('Item not found');
    }
    throw new Error(`Failed to fetch item: ${response.statusText}`);
  }

  const item = (await response.json()) as RawUserItem;
  
  // Transform backend response to frontend format (map 'id' to 'uuid')
  const transformed = withUuid(item);
  
  console.log('Fetched item detail:', transformed.uuid, transformed.title);
  
  return transformed;
}

/**
 * Fetch statistics about user's items
 */
export async function fetchItemStats(): Promise<ItemStats> {
  const token = localStorage.getItem('flipit_token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE}/items/stats/`, {
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
    throw new Error(`Failed to fetch stats: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch stored marketplace statistics for one listing.
 */
export async function fetchListingStatistics(
  uuid: string,
  platforms?: Platform[]
): Promise<ListingStatisticsResponse> {
  const token = localStorage.getItem('flipit_token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const searchParams = new URLSearchParams();
  if (platforms && platforms.length > 0) {
    searchParams.set('platforms', platforms.join(','));
  }
  const query = searchParams.toString();
  const response = await fetch(`${API_BASE}/items/${uuid}/statistics/${query ? `?${query}` : ''}`, {
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
    if (response.status === 404) {
      throw new Error('Item not found');
    }
    throw new Error(`Failed to fetch listing statistics: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch stored marketplace statistics for all listings on a platform.
 */
export async function fetchPlatformStatistics(platform: Platform): Promise<PlatformStatisticsResponse> {
  const token = localStorage.getItem('flipit_token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE}/statistics/platforms/${platform}/`, {
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
    if (response.status === 404) {
      throw new Error('Platform statistics not found');
    }
    throw new Error(`Failed to fetch platform statistics: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Duplicate an item (create a new draft copy)
 */
export async function duplicateItem(uuid: string): Promise<UserItem> {
  const token = localStorage.getItem('flipit_token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE}/items/${uuid}/duplicate/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication required');
    }
    if (response.status === 404) {
      throw new Error('Item not found');
    }
    throw new Error(`Failed to duplicate item: ${response.statusText}`);
  }

  const item = (await response.json()) as RawUserItem;
  return withUuid(item);
}

/**
 * Delete an item
 */
export async function deleteItem(uuid: string): Promise<void> {
  const token = localStorage.getItem('flipit_token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE}/items/${uuid}/`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication required');
    }
    if (response.status === 404) {
      throw new Error('Item not found');
    }
    throw new Error(`Failed to delete item: ${response.statusText}`);
  }
}

export interface UpdateItemPayload {
  title?: string;
  description?: string;
  brand?: string;
  condition?: string;
  category?: string;
  price?: number;
  currency?: string;
  size?: string;
  catalog_path?: string;
  images?: string[];
  description_full?: string;
  dimensions_cm?: Record<string, unknown>;
  weight_kg?: number;
  shipping_advice?: Record<string, unknown>;
  image_enhancement_prompt?: string;
  platform_listing_overrides?: PlatformOverrides;
  marketplace_attributes?: MarketplaceAttributes;
}

export type RegeneratableItemField =
  | 'title'
  | 'description';

export interface RegenerateItemFieldPayload {
  field: RegeneratableItemField;
  language?: string;
  context?: Record<string, unknown>;
}

export interface RegenerateItemFieldResponse {
  field: RegeneratableItemField;
  value: string;
  language: string;
}

/**
 * Update an existing item (draft/published fields only).
 */
export async function updateItem(uuid: string, data: UpdateItemPayload): Promise<UserItem> {
  const token = localStorage.getItem('flipit_token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE}/items/${uuid}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication required');
    }
    if (response.status === 404) {
      throw new Error('Item not found');
    }
    const errorData = (await response.json().catch(() => ({}))) as ApiErrorPayload;
    throw new Error(errorData.detail || `Failed to update item: ${response.statusText}`);
  }

  const item = (await response.json()) as RawUserItem;
  return withUuid(item);
}

/**
 * Regenerate one editable listing field with AI.
 */
export async function regenerateItemField(
  uuid: string,
  payload: RegenerateItemFieldPayload
): Promise<RegenerateItemFieldResponse> {
  const token = localStorage.getItem('flipit_token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE}/items/${uuid}/regenerate-field/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication required');
    }
    if (response.status === 404) {
      throw new Error('Item not found');
    }
    const errorData = (await response.json().catch(() => ({}))) as ApiErrorPayload;
    throw new Error(errorData.detail || `Failed to regenerate field: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Enhance item images using AI (Gemini).
 * Costs 1 credit per enhancement.
 */
export async function enhanceItemImages(
  uuid: string,
  imageUrls?: string[],
  sourceImageUrl?: string,
): Promise<{
  enhanced_images: string[];
  all_images: string[];
  source_image_url?: string;
  message: string;
}> {
  const token = localStorage.getItem('flipit_token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE}/items/${uuid}/enhance-images/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      image_urls: imageUrls,
      source_image_url: sourceImageUrl,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    // Handle insufficient credits
    if (response.status === 402) {
      throw new Error(errorData.detail || 'Insufficient credits for image enhancement');
    }
    
    throw new Error(errorData.detail || `Failed to enhance images: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Update listing on specific platforms (eBay/OLX/Allegro).
 */
export async function updatePlatformListings(uuid: string, platforms: Platform[]): Promise<unknown> {
  const token = localStorage.getItem('flipit_token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE}/items/${uuid}/platforms/update/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ platforms }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication required');
    }
    if (response.status === 404) {
      throw new Error('Item not found');
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to update platform listing: ${response.statusText}`);
  }

  return response.json();
}

/** Sync result for a single platform */
export interface PlatformSyncResult {
  status: 'success' | 'error';
  message?: string;
  error?: string;
  missing_fields?: Array<{ key: string; label?: string }>;
}

/** Response from the sync API */
export interface SyncPlatformsResponse {
  results: Record<Platform, PlatformSyncResult>;
  sync_status?: Record<Platform, { dirty: boolean; last_synced_at?: string; last_payload_hash?: string }>;
  detail?: string;
  validation_errors?: Record<Platform, { error: string; message?: string; missing_fields?: Array<{ key: string; label?: string }> }>;
}

/**
 * Push saved item changes to specific marketplace listings without re-publishing.
 * If platforms is omitted or empty, updates only dirty marketplace listings.
 */
export async function syncPlatformListings(uuid: string, platforms?: Platform[]): Promise<SyncPlatformsResponse> {
  const token = localStorage.getItem('flipit_token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const body: { platforms?: Platform[] } = {};
  if (platforms && platforms.length > 0) {
    body.platforms = platforms;
  }

  const response = await fetch(`${API_BASE}/items/${uuid}/platforms/sync/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication required');
    }
    if (response.status === 404) {
      throw new Error('Item not found');
    }
    // For 400 (validation errors), we still want to return the response body
    if (response.status === 400) {
      return response.json();
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to update marketplace listings: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Delete listing from specific platforms (eBay/OLX/Allegro).
 */
export interface MarketplaceRemovalResult {
  status: 'success' | 'removed' | 'manual_required' | 'error' | string;
  message?: string;
}

export interface MarketplaceRemovalResponse {
  results: Partial<Record<Platform, MarketplaceRemovalResult>>;
}

export async function removeListingFromMarketplaces(
  uuid: string,
  platforms: Platform[]
): Promise<MarketplaceRemovalResponse> {
  const token = localStorage.getItem('flipit_token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE}/items/${uuid}/remove-from-marketplaces/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ platforms }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication required');
    }
    if (response.status === 404) {
      throw new Error('Item not found');
    }
    const errorData = (await response.json().catch(() => ({}))) as ApiErrorPayload;
    throw new Error(errorData.detail || `Failed to remove marketplace listing: ${response.statusText}`);
  }

  return response.json();
}

export async function deletePlatformListings(
  uuid: string,
  platforms: Platform[]
): Promise<MarketplaceRemovalResponse> {
  return removeListingFromMarketplaces(uuid, platforms);
}

/**
 * Publish item to a specific platform
 */
export async function publishItemToPlatform(
  uuid: string, 
  platform: Platform,
  itemData: {
    images: string[];
    title: string;
    price: string;
    currency?: string;
    description: string;
    category: string;
    catalog_path?: string;
    marketplace_attributes?: MarketplaceAttributes;
  }
): Promise<{ success: boolean; message?: string; listing_url?: string }> {
  const token = localStorage.getItem('flipit_token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE}/items/publish/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      draft_id: uuid,
      platforms: [platform],
      ...itemData,
    }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication required');
    }
    if (response.status === 402) {
      throw new Error('Insufficient credits');
    }
    if (response.status === 404) {
      throw new Error('Item not found');
    }
    const errorData = (await response.json().catch(() => ({}))) as ApiErrorPayload;
    throw new Error(errorData.detail || `Failed to publish: ${response.statusText}`);
  }

  return response.json();
}
