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

  return response.json();
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
