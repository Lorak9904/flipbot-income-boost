/**
 * OLX API Integration
 * 
 * Handles OLX marketplace connection, status checks, and token management.
 */

import type { Platform } from '@/types/item';
import type { ConnectPlatformResponse, DeleteSessionResponse } from '@/types/api';

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
