/**
 * Platform Metadata API
 * 
 * Fetches category-specific required attributes for OLX and eBay platforms.
 * Used by the Per-Platform Override Editor to show dynamic fields.
 */

const API_BASE = '/api';

export interface PlatformAttributeOption {
  value: string | number;
  label: string;
}

export interface PlatformAttributeField {
  key: string;
  label: string;
  required: boolean;
  type: 'text' | 'select' | 'multi_select' | 'number';
  options?: PlatformAttributeOption[];
}

export interface PlatformAttributesResponse {
  platform: string;
  category_id: string;
  required_fields: PlatformAttributeField[];
  error?: string;
}

/**
 * Get required attributes for an OLX category
 */
export async function getOlxCategoryAttributes(
  categoryId: string | number
): Promise<PlatformAttributesResponse> {
  const token = localStorage.getItem('flipit_token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(
    `${API_BASE}/platforms/olx/attributes/?category_id=${categoryId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to fetch OLX attributes: ${response.status}`);
  }

  return response.json();
}

/**
 * Get required aspects/attributes for an eBay category
 */
export async function getEbayCategoryAttributes(
  categoryId: string,
  marketplaceId: string = 'EBAY_PL'
): Promise<PlatformAttributesResponse> {
  const token = localStorage.getItem('flipit_token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const params = new URLSearchParams({
    category_id: categoryId,
    marketplace_id: marketplaceId,
  });

  const response = await fetch(
    `${API_BASE}/platforms/ebay/attributes/?${params}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to fetch eBay attributes: ${response.status}`);
  }

  return response.json();
}

/**
 * Get required attributes for any supported platform
 */
export async function getPlatformCategoryAttributes(
  platform: 'olx' | 'ebay',
  categoryId: string | number,
  options?: { marketplaceId?: string }
): Promise<PlatformAttributesResponse> {
  if (platform === 'olx') {
    return getOlxCategoryAttributes(categoryId);
  } else if (platform === 'ebay') {
    return getEbayCategoryAttributes(String(categoryId), options?.marketplaceId);
  }
  
  throw new Error(`Unsupported platform: ${platform}`);
}
