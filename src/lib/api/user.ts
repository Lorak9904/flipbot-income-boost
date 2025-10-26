/**
 * User-related API client functions
 */

const API_BASE = '/api/FlipIt/api';

export interface UpdateLanguageRequest {
  language: string;
}

export interface UpdateLanguageResponse {
  language: string;
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
