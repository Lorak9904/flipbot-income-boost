/**
 * Credits API Client
 * Handles all credits-related backend communication
 */

export type PlanSlug = 'start' | 'plus' | 'scale';

export interface CreditsBalance {
  plan: PlanSlug | string;
  effective_plan?: PlanSlug | string;
  subscription_status?: string | null;
  current_period_start?: number | null;
  current_period_end?: number | null;
  cancel_at_period_end?: boolean;
  grace_period_end?: number | null;
  billing_interval?: 'month' | 'year' | null;
  // Publishing credits
  publish_credits_used: number;
  publish_limit: number | null;
  publish_remaining: number | null;
  // Image credits
  image_credits_used: number;
  image_limit: number | null;
  image_remaining: number | null;
}

export interface CreditTransaction {
  id: number;
  action_type: 'publish_listing' | 'enhance_image' | 'refill' | 'refund' | 'plan_upgrade' | 'subscription_renewal';
  amount: number; // negative = consumption, positive = addition
  balance_before: number;
  balance_after: number;
  metadata: {
    platform?: string;
    draft_id?: string;
    image_url?: string;
    prompt?: string;
    reason?: string;
    [key: string]: any;
  };
  created_at: string; // ISO datetime
}

export interface TransactionResponse {
  count: number;
  transactions: CreditTransaction[];
}

export interface InsufficientCreditsError {
  error: 'insufficient_credits';
  required: number;
  available: number;
  message: string;
}

/**
 * Fetch current user's credit balance and plan details
 */
export async function fetchCreditsBalance(): Promise<CreditsBalance> {
  const token = localStorage.getItem('flipit_token');
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch('/api/credits/', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch credits: ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch credit transaction history with optional limit
 */
export async function fetchTransactions(limit = 50): Promise<TransactionResponse> {
  const token = localStorage.getItem('flipit_token');
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`/api/credits/transactions/?limit=${Math.min(limit, 100)}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch transactions: ${response.status}`);
  }

  return response.json();
}

/**
 * Check if an error response is an insufficient credits error
 */
export function isInsufficientCreditsError(error: any): error is InsufficientCreditsError {
  return error?.error === 'insufficient_credits' && 
         typeof error?.required === 'number' &&
         typeof error?.available === 'number';
}

/**
 * Get user-friendly plan name
 */
export function normalizePlan(plan?: string | null): PlanSlug {
  const key = (plan || '').toLowerCase();
  const mapping: Record<string, PlanSlug> = {
    start: 'start',
    plus: 'plus',
    scale: 'scale',
    starter: 'start',
    pro: 'plus',
    business: 'scale',
    free: 'start',
  };
  return mapping[key] || 'start';
}

export function getPlanDisplayName(plan: string): string {
  const names: Record<string, string> = {
    start: 'Start',
    plus: 'Plus',
    scale: 'Scale',
  };
  const normalized = normalizePlan(plan);
  return names[normalized] || plan;
}

/**
 * Get plan color for UI theming
 */
export function getPlanColor(plan: string): string {
  const colors: Record<string, string> = {
    start: 'text-neutral-400',
    plus: 'text-cyan-400',
    scale: 'text-purple-400',
  };
  const normalized = normalizePlan(plan);
  return colors[normalized] || 'text-neutral-400';
}

/**
 * Calculate credits health status for color coding
 */
export function getCreditsHealthStatus(
  remaining: number | null,
  limit: number | null
): 'unlimited' | 'healthy' | 'warning' | 'critical' {
  if (remaining === null || limit === null) return 'unlimited';
  if (limit === 0) return 'critical';
  
  const percentage = (remaining / limit) * 100;
  
  if (percentage > 25) return 'healthy';
  if (percentage > 10) return 'warning';
  return 'critical';
}

/**
 * Format action type for display
 */
export function formatActionType(actionType: string): string {
  const formatted: Record<string, string> = {
    publish_listing: 'Publish Listing',
    enhance_image: 'Enhance Image',
    refill: 'Credit Refill',
    refund: 'Refund',
    plan_upgrade: 'Plan Upgrade',
    subscription_renewal: 'Subscription Renewal',
  };
  return formatted[actionType] || actionType;
}
