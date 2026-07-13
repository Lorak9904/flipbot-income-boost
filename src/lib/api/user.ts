/**
 * User-related API client functions
 */

const API_BASE = '/api';

export interface UpdateLanguageRequest {
  language: string;
}

export interface UpdateLanguageResponse {
  language: string;
}

export type FirstListingCoachStatus = 'active' | 'snoozed' | 'dismissed' | 'completed';

export interface FirstListingCoachState {
  status?: FirstListingCoachStatus;
  open?: boolean;
  source?: 'settings' | 'tutorial' | 'widget';
  hidden_at?: string;
  restart_at?: string;
  updated_at?: string;
}

export interface UserProfile {
  id: number | string;
  name?: string;
  email?: string;
  language?: string;
  address_city?: string | null;
  address_postal_code?: string | null;
  address_country?: string | null;
  address_street?: string | null;
  newsletter_opt_in?: boolean;
  first_listing_coach_state?: FirstListingCoachState;
  last_login?: string | null;
  last_seen_at?: string | null;
}

/**
 * Update the authenticated user's language preference
 * Saves to database and updates cookie via backend
 */
export async function updateUserLanguage(language: string): Promise<UpdateLanguageResponse> {
  const token = localStorage.getItem('flipit_token');
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE}/user/language/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include', // Important: allows backend to set cookie
    body: JSON.stringify({ language }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Failed to update language' }));
    throw new Error(errorData.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function fetchUserProfile(): Promise<UserProfile> {
  const token = localStorage.getItem('flipit_token');
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE}/user/profile/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Failed to load profile' }));
    throw new Error(errorData.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function updateUserProfile(payload: Partial<UserProfile>): Promise<UserProfile> {
  const token = localStorage.getItem('flipit_token');
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE}/user/profile/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Failed to update profile' }));
    throw new Error(errorData.detail || `HTTP ${response.status}`);
  }

  return response.json();
}
