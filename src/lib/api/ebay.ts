/**
 * eBay API Integration
 * 
 * Handles eBay marketplace connection, status checks, and token management.
 * Pattern follows OLX integration (src/lib/api/olx.ts).
 */

// Base URL for API calls
const API_BASE = '/api';

export interface EbayConnectionStatus {
  connected: boolean;
  valid: boolean;
  expires_at: string | null;
  needs_reconnect: boolean;
  marketplace_id: string | null;
  message?: string;
}

export interface EbayDisconnectResponse {
  success: boolean;
  message: string;
}

/**
 * Get eBay connection status for the current user
 */
export async function getEbayStatus(): Promise<EbayConnectionStatus> {
  const token = localStorage.getItem('flipit_token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE}/ebay/status/`, {
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
    throw new Error(`Failed to check eBay status: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get eBay authorization URL to start OAuth flow
 * @param marketplace - Optional marketplace ID (default: EBAY_PL)
 */
export async function getEbayConnectUrl(marketplace: string = 'EBAY_PL'): Promise<{ auth_url: string }> {
  const token = localStorage.getItem('flipit_token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE}/ebay/connect/?marketplace=${marketplace}`, {
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
    throw new Error(`Failed to get eBay connect URL: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Disconnect eBay account
 */
export async function disconnectEbay(): Promise<EbayDisconnectResponse> {
  const token = localStorage.getItem('flipit_token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE}/ebay/disconnect/`, {
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
    throw new Error(`Failed to disconnect eBay: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Check if an error response indicates eBay token expiration
 */
export function isEbayTokenExpiredError(error: any): boolean {
  if (!error) return false;
  
  // Check for specific error structure from backend
  if (error.error === 'ebay_token_expired') return true;
  if (error.action_required === 'reconnect_ebay') return true;
  
  // Check error message
  const message = error.message || error.detail || '';
  return message.toLowerCase().includes('ebay') && 
         (message.toLowerCase().includes('expired') || 
          message.toLowerCase().includes('invalid') ||
          message.toLowerCase().includes('reconnect'));
}

/**
 * Handle eBay token expiration by redirecting to settings
 */
export function handleEbayTokenExpired(): void {
  // Store the current location to return after reconnecting
  sessionStorage.setItem('ebay_reconnect_return', window.location.pathname);
  
  // Redirect to connect-accounts with reconnect flag
  window.location.href = '/connect-accounts?reconnect=ebay&message=eBay+token+expired';
}
