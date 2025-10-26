import { UserItemsListResponse, UserItem, ItemStats, Platform, ItemStage } from '@/types/item';

const API_BASE = '/api/FlipIt/api';

export interface FetchItemsParams {
  page?: number;
  page_size?: number;
  stage?: ItemStage;
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
  if (params.stage) searchParams.set('stage', params.stage);
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

  const data = await response.json();

  // Normalize API shape to frontend types
  const rawItems: any[] = data.items || [];
  const mappedItems: UserItem[] = rawItems.map((it: any) => {
    // Images may be an array of strings or objects with url
    let images: string[] = [];
    if (Array.isArray(it.images)) {
      if (it.images.length > 0 && typeof it.images[0] === 'string') {
        images = it.images as string[];
      } else if (it.images.length > 0 && typeof it.images[0] === 'object' && it.images[0] !== null) {
        images = (it.images as any[]).map((img: any) => img?.url).filter(Boolean);
      }
    }

    // Determine platforms array from various backend shapes
    const platforms: Platform[] =
      (it.platforms as Platform[])
      || (it.platforms_published as Platform[])
      || [
        it.platform_facebook ? 'facebook' as Platform : undefined,
        it.platform_vinted ? 'vinted' as Platform : undefined,
        it.platform_olx ? 'olx' as Platform : undefined,
      ].filter(Boolean) as Platform[];

    const uuid: string = String(it.id ?? it.uuid ?? '');

    return {
      uuid,
      title: it.title ?? '',
      description: it.description ?? '',
      price: String(it.price ?? ''),
      brand: it.brand ?? undefined,
      condition: it.condition ?? undefined,
      category: it.category ?? undefined,
      size: it.size ?? undefined,
      gender: it.gender ?? undefined,
      stage: it.stage ?? 'draft',
      images,
      platforms,
      publish_results: it.publish_results ?? undefined,
      created_at: it.created_at ?? '',
      updated_at: it.updated_at ?? it.created_at ?? '',
    };
  });

  const total = typeof data.total === 'number' ? data.total : (typeof data.count === 'number' ? data.count : mappedItems.length);
  const page = params.page ?? 1;
  const page_size = params.page_size ?? mappedItems.length;
  const total_pages = typeof data.total_pages === 'number' ? data.total_pages : 1;

  return {
    items: mappedItems,
    total,
    page,
    page_size,
    total_pages,
  };
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

  const it = await response.json();

  // Normalize single item to expected shape
  let images: string[] = [];
  if (Array.isArray(it.images)) {
    if (it.images.length > 0 && typeof it.images[0] === 'string') {
      images = it.images as string[];
    } else if (it.images.length > 0 && typeof it.images[0] === 'object' && it.images[0] !== null) {
      images = (it.images as any[]).map((img: any) => img?.url).filter(Boolean);
    }
  }

  const platforms: Platform[] =
    (it.platforms as Platform[])
    || (it.platforms_published as Platform[])
    || [
      it.platform_facebook ? 'facebook' as Platform : undefined,
      it.platform_vinted ? 'vinted' as Platform : undefined,
      it.platform_olx ? 'olx' as Platform : undefined,
    ].filter(Boolean) as Platform[];

  return {
    uuid: String(it.id ?? it.uuid ?? uuid),
    title: it.title ?? '',
    description: it.description ?? '',
    price: String(it.price ?? ''),
    brand: it.brand ?? undefined,
    condition: it.condition ?? undefined,
    category: it.category ?? undefined,
    size: it.size ?? undefined,
    gender: it.gender ?? undefined,
    stage: it.stage ?? 'draft',
    images,
    platforms,
    publish_results: it.publish_results ?? undefined,
    created_at: it.created_at ?? '',
    updated_at: it.updated_at ?? it.created_at ?? '',
  };
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
