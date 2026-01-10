/**
 * Billing API Client
 * Handles Stripe Checkout and Billing Portal sessions
 */

export async function createCheckoutSession(
  plan: 'plus' | 'scale',
  billingCycle: 'monthly' | 'annual'
): Promise<string> {
  const token = localStorage.getItem('flipit_token');
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch('/api/billing/checkout/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      plan,
      billing_cycle: billingCycle,
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `Checkout failed: ${response.status}`);
  }

  const data = await response.json();
  return data.url;
}

export async function createBillingPortalSession(): Promise<string> {
  const token = localStorage.getItem('flipit_token');
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch('/api/billing/portal/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `Portal request failed: ${response.status}`);
  }

  const data = await response.json();
  return data.url;
}
