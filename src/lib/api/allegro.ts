/**
 * Allegro API Integration
 *
 * Handles Allegro marketplace OAuth connection helpers.
 */

const API_BASE = '/api';

/**
 * Get Allegro authorization URL to start OAuth flow.
 * @param marketplaceId - Optional marketplace ID (default: allegro-pl)
 */
export async function getAllegroConnectUrl(
  marketplaceId: string = 'allegro-pl'
): Promise<{ auth_url: string }> {
  const token = localStorage.getItem('flipit_token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE}/allegro/connect/?marketplace_id=${marketplaceId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication required');
    }
    throw new Error(`Failed to get Allegro connect URL: ${response.statusText}`);
  }

  return response.json();
}
