import { UserItemsListResponse, UserItem, ItemStats, Platform, ItemStatus, PlatformOverrides } from '@/types/item';

const API_BASE = '/api';

export interface FetchItemsParams {
  page?: number;
  page_size?: number;
  status?: ItemStatus;
  platform?: Platform;
}

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

  const data: any = await response.json();
  
  // Transform backend response to frontend format (map 'id' to 'uuid')
  if (data.items && Array.isArray(data.items)) {
    data.items = data.items.map((item: any) => {
      const transformed = {
        ...item,
        uuid: item.id || item.uuid,
      };
      
      // Debug logging
      if (!transformed.uuid) {
        console.warn('Item missing UUID:', item);
      }
      
      return transformed;
    });
  }
  
  console.log('Fetched items:', data.items?.length || 0, 'items');
  
  return data;
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

  const item: any = await response.json();
  
  // Transform backend response to frontend format (map 'id' to 'uuid')
  const transformed = {
    ...item,
    uuid: item.id || item.uuid,
  };
  
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

  const item: any = await response.json();
  return {
    ...item,
    uuid: item.id || item.uuid,
  };
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
  size?: string;
  catalog_path?: string;
  images?: string[];
  description_full?: string;
  dimensions_cm?: Record<string, unknown>;
  weight_kg?: number;
  shipping_advice?: Record<string, unknown>;
  image_enhancement_prompt?: string;
  platform_listing_overrides?: PlatformOverrides;
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
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to update item: ${response.statusText}`);
  }

  const item: any = await response.json();
  return {
    ...item,
    uuid: item.id || item.uuid,
  };
}

/**
 * Enhance item images using AI (Gemini).
 * Costs 1 credit per enhancement.
 */
export async function enhanceItemImages(
  uuid: string,
  imageUrls?: string[]
): Promise<{ enhanced_images: string[]; all_images: string[]; message: string }> {
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
      image_urls: imageUrls, // Send current image order from frontend
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
 * Update listing on specific platforms (eBay/OLX).
 */
export async function updatePlatformListings(uuid: string, platforms: Platform[]): Promise<any> {
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
 * Sync item changes to specific platforms (OLX/eBay) without re-publishing.
 * If platforms is omitted or empty, syncs only dirty platforms.
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
    throw new Error(errorData.detail || `Failed to sync platform listings: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Delete listing from specific platforms (eBay/OLX).
 */
export async function deletePlatformListings(uuid: string, platforms: Platform[]): Promise<any> {
  const token = localStorage.getItem('flipit_token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE}/items/${uuid}/platforms/delete/`, {
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
    throw new Error(errorData.detail || `Failed to delete platform listing: ${response.statusText}`);
  }

  return response.json();
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
    description: string;
    category: string;
    catalog_path?: string;
    vinted_field_mappings?: Record<string, unknown>;
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
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to publish: ${response.statusText}`);
  }

  return response.json();
}
