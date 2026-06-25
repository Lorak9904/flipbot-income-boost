const API_BASE = '/api';

export interface EbayMarketplacePolicy {
  marketplace_id: string;
  payment_policy_id: string | null;
  return_policy_id: string | null;
  fulfillment_policy_id: string | null;
}

export interface EbayPolicyOption {
  id: string;
  name: string;
  description?: string;
  marketplace_id?: string;
}

export interface EbayInventoryLocation {
  marketplace_id?: string;
  merchant_location_key: string;
  name: string;
  status?: string;
  enabled?: boolean;
  address_summary?: string;
  raw?: Record<string, unknown>;
}

export interface EbayPolicyResources {
  marketplace_id: string;
  selected_policy: EbayMarketplacePolicy | null;
  program?: {
    program_type: string;
    opted_in: boolean;
    status: string;
    action_key: string;
  };
  payment_policies: EbayPolicyOption[];
  return_policies: EbayPolicyOption[];
  fulfillment_policies: EbayPolicyOption[];
}

export interface EbayInventoryLocationsResponse {
  marketplace_id: string;
  selected_location: EbayInventoryLocation | null;
  locations: EbayInventoryLocation[];
}

export interface EbayReadinessSection {
  key: string;
  label: string;
  status: 'ready' | 'needs_setup' | 'unavailable' | 'blocked_by_app_config' | 'reconnect_required' | string;
  message: string;
  action_key?: string;
  code?: string;
  missing: Array<{ key: string; label: string }>;
}

export interface EbayReadiness {
  platform: 'ebay';
  marketplace_id: string;
  ready: boolean;
  status: 'ready' | 'needs_setup' | 'reconnect_required' | 'blocked_by_app_config' | string;
  sections: EbayReadinessSection[];
  missing: Array<{ key: string; label: string }>;
}

function getAuthHeaders() {
  const token = localStorage.getItem('flipit_token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

export async function getEbayMarketplacePolicies(): Promise<EbayMarketplacePolicy[]> {
  const response = await fetch(`${API_BASE}/platforms/ebay/policies/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to load eBay policies: ${response.status}`);
  }

  return response.json();
}

export async function updateEbayMarketplacePolicy(
  marketplaceId: string,
  payload: Partial<EbayMarketplacePolicy>
): Promise<EbayMarketplacePolicy> {
  const response = await fetch(
    `${API_BASE}/platforms/ebay/policies/${encodeURIComponent(marketplaceId)}/`,
    {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to save policy: ${response.status}`);
  }

  return response.json();
}

export async function getEbayReadiness(marketplaceId = 'EBAY_PL'): Promise<EbayReadiness> {
  const response = await fetch(
    `${API_BASE}/platforms/ebay/readiness/?marketplace_id=${encodeURIComponent(marketplaceId)}`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to load eBay readiness: ${response.status}`);
  }

  return response.json();
}

export async function getEbayPolicyResources(marketplaceId = 'EBAY_PL'): Promise<EbayPolicyResources> {
  const response = await fetch(
    `${API_BASE}/platforms/ebay/policy-resources/?marketplace_id=${encodeURIComponent(marketplaceId)}`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to load eBay policy resources: ${response.status}`);
  }

  return response.json();
}

export async function getEbayInventoryLocations(
  marketplaceId = 'EBAY_PL'
): Promise<EbayInventoryLocationsResponse> {
  const response = await fetch(
    `${API_BASE}/platforms/ebay/locations/?marketplace_id=${encodeURIComponent(marketplaceId)}`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to load eBay inventory locations: ${response.status}`);
  }

  return response.json();
}

export async function optInEbayPolicyProgram(marketplaceId = 'EBAY_PL'): Promise<{
  program_type: string;
  marketplace_id: string;
  status: string;
  message: string;
}> {
  const response = await fetch(`${API_BASE}/platforms/ebay/policy-program/opt-in/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ marketplace_id: marketplaceId }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to request eBay policy opt-in: ${response.status}`);
  }

  return response.json();
}

export async function updateEbayInventoryLocation(
  marketplaceId: string,
  payload: Pick<EbayInventoryLocation, 'merchant_location_key' | 'name' | 'address_summary' | 'raw'>
): Promise<EbayInventoryLocation> {
  const response = await fetch(
    `${API_BASE}/platforms/ebay/locations/${encodeURIComponent(marketplaceId)}/`,
    {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to save eBay dispatch location: ${response.status}`);
  }

  return response.json();
}

export async function createOrUpdateEbayDispatchLocation(payload: {
  marketplace_id?: string;
  merchant_location_key?: string;
  name?: string;
  address: {
    address_line_1?: string;
    address_line_2?: string;
    street?: string;
    city: string;
    postal_code: string;
    country: string;
  };
}): Promise<EbayInventoryLocation> {
  const response = await fetch(`${API_BASE}/platforms/ebay/locations/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to create eBay dispatch location: ${response.status}`);
  }

  return response.json();
}
