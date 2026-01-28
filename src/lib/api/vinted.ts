/**
 * Vinted API Integration
 *
 * Handles Vinted sync actions for importing listings into FlipIt.
 */

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
