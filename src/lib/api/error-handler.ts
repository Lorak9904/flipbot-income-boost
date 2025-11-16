/**
 * API Error Handler Utilities
 * Centralized error parsing for consistent error handling across the app
 */

export interface InsufficientCreditsError {
  error: 'insufficient_credits';
  required: number;
  available: number;
  platform?: string;
}

/**
 * Check if an error response indicates insufficient credits (402 Payment Required)
 */
export function isInsufficientCreditsError(error: any): boolean {
  // Check HTTP response status
  if (error?.response?.status === 402) {
    return true;
  }
  
  // Check error object directly
  if (error?.error === 'insufficient_credits') {
    return true;
  }
  
  return false;
}

/**
 * Extract insufficient credits details from API error response
 * Returns null if error is not a credits error
 */
export function parseInsufficientCreditsError(error: any): InsufficientCreditsError | null {
  // Try response.data first (axios-style)
  if (error?.response?.status === 402 && error?.response?.data?.error === 'insufficient_credits') {
    return {
      error: 'insufficient_credits',
      required: error.response.data.required || 1,
      available: error.response.data.available || 0,
      platform: error.response.data.platform,
    };
  }
  
  // Try direct error object (fetch-style)
  if (error?.error === 'insufficient_credits') {
    return {
      error: 'insufficient_credits',
      required: error.required || 1,
      available: error.available || 0,
      platform: error.platform,
    };
  }
  
  return null;
}

/**
 * Parse error response from fetch API
 */
export async function parseErrorResponse(response: Response): Promise<any> {
  try {
    const data = await response.json();
    return {
      status: response.status,
      data,
      response: {
        status: response.status,
        data,
      },
    };
  } catch {
    return {
      status: response.status,
      data: { error: 'Unknown error' },
      response: {
        status: response.status,
        data: { error: 'Unknown error' },
      },
    };
  }
}
