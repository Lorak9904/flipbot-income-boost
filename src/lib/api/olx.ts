/**
 * OLX API Integration
 * 
 * Handles OLX marketplace connection, status checks, and token management.
 */

// Base URL for API calls
// Update this if your backend is hosted elsewhere
const API_BASE = '/api';

export interface OlxConnectionStatus {
  connected: boolean;
  valid: boolean;
  expires_at: string | null;
  needs_reconnect: boolean;
  message?: string;
}

export interface OlxSyncSummary {
  inserted: number;
  updated: number;
  skipped: number;
  errors: number;
  total_fetched: number;
}

export interface OlxSyncResponse {
  success: boolean;
  message: string;
  summary?: OlxSyncSummary;
  error?: string;
  action_required?: string;
}

/**
 * Get OLX connection status for the current user
 */
export async function getOlxStatus(): Promise<OlxConnectionStatus> {
  const token = localStorage.getItem('flipit_token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE}/olx/status/`, {
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
    throw new Error(`Failed to check OLX status: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get OLX authorization URL to start OAuth flow
 */
export async function getOlxConnectUrl(): Promise<{ auth_url: string }> {
  const token = localStorage.getItem('flipit_token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE}/olx/connect/`, {
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
    throw new Error(`Failed to get OLX connect URL: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Check if an error response indicates OLX token expiration
 */
export function isOlxTokenExpiredError(error: any): boolean {
  if (!error) return false;
  
  // Check for specific error structure from backend
  if (error.error === 'olx_token_expired') return true;
  if (error.action_required === 'reconnect_olx') return true;
  
  // Check error message
  const message = error.message || error.detail || '';
  return message.toLowerCase().includes('olx') && 
         (message.toLowerCase().includes('expired') || 
          message.toLowerCase().includes('invalid') ||
          message.toLowerCase().includes('reconnect'));
}

/**
 * Handle OLX token expiration by redirecting to settings
 */
export function handleOlxTokenExpired(): void {
  // Store the current location to return after reconnecting
  sessionStorage.setItem('olx_reconnect_return', window.location.pathname);
  
  // Redirect to settings with reconnect flag
  window.location.href = '/settings?reconnect=olx&message=OLX+token+expired';
}

/**
 * Sync OLX listings with FlipIt database
 * 
 * Fetches all user's OLX adverts and imports them as DraftItems.
 * Existing items (matched by external_id) are updated with fresh data.
 * New items are created as published drafts.
 */
export async function syncOlxListings(): Promise<OlxSyncResponse> {
  const token = localStorage.getItem('flipit_token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE}/olx/sync/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  const data: OlxSyncResponse = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      if (data.error === 'olx_token_expired' || data.action_required === 'reconnect_olx') {
        handleOlxTokenExpired();
      }
      throw new Error('Authentication required');
    }
    if (response.status === 400 && data.error === 'olx_not_connected') {
      throw new Error('Please connect your OLX account first');
    }
    throw new Error(data.message || `Failed to sync OLX listings: ${response.statusText}`);
  }

  return data;
}
