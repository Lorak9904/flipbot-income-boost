/**
 * eBay API Integration
 * 
 * Handles eBay marketplace connection, status checks, and token management.
 * Pattern follows OLX integration (src/lib/api/olx.ts).
 */

import { getLocalizedPath, getPathLanguage } from '@/lib/localized-routes';

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

export interface EbaySyncSummary {
  inserted: number;
  updated: number;
  skipped: number;
  errors: number;
  total_fetched: number;
}

export interface EbaySyncResponse {
  success: boolean;
  message: string;
  summary?: EbaySyncSummary;
  code?: string;
  error?: string;
  action_required?: string;
  action_key?: string;
  detail?: string;
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
 * Sync eBay listings with FlipIt database.
 */
export async function syncEbayListings(): Promise<EbaySyncResponse> {
  const token = localStorage.getItem('flipit_token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE}/ebay/sync/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  const data: EbaySyncResponse = await response.json();

  if (!response.ok) {
    if (response.status === 401 || data.action_key === 'reconnect_ebay') {
      if (data.code === 'ebay_reconnect_required' || data.action_key === 'reconnect_ebay') {
        handleEbayTokenExpired();
      }
      throw new Error(data.message || data.detail || 'Authentication required');
    }
    if (response.status === 400 && data.error === 'ebay_not_connected') {
      throw new Error('Please connect your eBay account first');
    }
    throw new Error(data.message || data.detail || `Failed to sync eBay listings: ${response.statusText}`);
  }

  return data;
}

/**
 * Check if an error response indicates eBay token expiration
 */
export function isEbayTokenExpiredError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const payload = error as Record<string, unknown>;
  
  // Check for specific error structure from backend
  if (payload.error === 'ebay_token_expired') return true;
  if (payload.action_required === 'reconnect_ebay') return true;
  
  // Check error message
  const message = [payload.message, payload.detail].find((value): value is string => typeof value === 'string') || '';
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
  const language = getPathLanguage(window.location.pathname) ?? 'en';
  const query = new URLSearchParams({ reconnect: 'ebay', message: 'eBay token expired' });
  window.location.href = `${getLocalizedPath('/connect-accounts', language)}?${query}`;
}
