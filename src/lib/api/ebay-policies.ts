const API_BASE = '/api';

export interface EbayMarketplacePolicy {
  marketplace_id: string;
  payment_policy_id: string | null;
  return_policy_id: string | null;
  fulfillment_policy_id: string | null;
}

export async function getEbayMarketplacePolicies(): Promise<EbayMarketplacePolicy[]> {
  const token = localStorage.getItem('flipit_token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE}/platforms/ebay/policies/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
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
  const token = localStorage.getItem('flipit_token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(
    `${API_BASE}/platforms/ebay/policies/${encodeURIComponent(marketplaceId)}/`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to save policy: ${response.status}`);
  }

  return response.json();
}
