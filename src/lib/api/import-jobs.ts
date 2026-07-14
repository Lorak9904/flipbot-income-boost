const API_BASE = '/api';

export interface QueuedImportResponse {
  success: boolean;
  status?: 'queued' | 'pending' | 'received' | 'started' | 'retry' | 'success' | 'partial_success' | 'error' | string;
  message: string;
  job_token?: string;
  reused?: boolean;
  error?: string;
  action_required?: string | null;
  action_key?: string;
}

interface ImportPollingOptions {
  platformLabel: string;
  onActionRequired?: (payload: QueuedImportResponse) => void;
}

const IMPORT_POLL_INTERVAL_MS = 5_000;

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('flipit_token');
  if (!token) throw new Error('No authentication token found');
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

export async function waitForMarketplaceImport<T extends QueuedImportResponse>(
  queuedResponse: T,
  options: ImportPollingOptions,
): Promise<T> {
  if (queuedResponse.status !== 'queued' || !queuedResponse.job_token) return queuedResponse;

  const deadline = Date.now() + 10 * 60 * 1000;
  while (Date.now() < deadline) {
    await new Promise((resolve) => window.setTimeout(resolve, IMPORT_POLL_INTERVAL_MS));
    const response = await fetch(
      `${API_BASE}/imports/status/${encodeURIComponent(queuedResponse.job_token)}/`,
      { method: 'GET', headers: getAuthHeaders() },
    );
    const payload = (await response.json().catch(() => ({}))) as T;

    if (!response.ok) {
      throw new Error(payload.message || `Failed to read ${options.platformLabel} import status: ${response.status}`);
    }
    if (payload.status === 'error') {
      options.onActionRequired?.(payload);
      throw new Error(payload.message || `${options.platformLabel} import failed`);
    }
    if (payload.status === 'success' || payload.status === 'partial_success') return payload;
  }

  throw new Error(`${options.platformLabel} import is taking longer than expected. Check My Listings again shortly.`);
}
