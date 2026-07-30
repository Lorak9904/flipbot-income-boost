export type PriceCheckSearchMode = 'keyword' | 'gtin' | 'image';

export interface PriceCheckImage {
  key: string;
  url: string;
  filename: string;
  content_type: string;
  size: number;
}

export interface PriceCheckComparable {
  provider_item_id: string;
  title: string;
  condition: string;
  price: string;
  currency: string;
  shipping_price: string;
  shipping_currency: string;
  delivered_price: string;
  item_url: string;
  image_url: string;
  marketplace_id: string;
  seller_username: string;
  buying_options: string[];
  item_end_date: string;
}

export interface PriceCheckResult {
  id: string;
  provider: 'ebay';
  marketplace_id: string;
  search_mode: PriceCheckSearchMode;
  query: string;
  condition: string;
  images: PriceCheckImage[];
  sampled_items: PriceCheckComparable[];
  stats: Record<string, unknown>;
  currency: string;
  sample_count: number;
  lowest_price: string | null;
  highest_price: string | null;
  average_price: string | null;
  median_price: string | null;
  typical_low_price?: string | null;
  typical_high_price?: string | null;
  status: 'pending' | 'completed' | 'no_results' | 'failed';
  error_message: string;
}

export type PriceCheckFailureType =
  | 'invalid_request'
  | 'rate_limited'
  | 'upload_failed'
  | 'provider_unavailable'
  | 'timeout'
  | 'network';

export class PriceCheckRequestError extends Error {
  constructor(public readonly failureType: PriceCheckFailureType) {
    super(failureType);
    this.name = 'PriceCheckRequestError';
  }
}

interface PriceCheckCreatePayload {
  provider: 'ebay';
  marketplace_id: string;
  search_mode: PriceCheckSearchMode;
  query?: string;
  condition?: string;
  limit?: number;
  images?: Array<{
    key: string;
    filename: string;
    content_type: string;
    size: number;
  }>;
}

type CompletedPriceCheckResult = PriceCheckResult & { status: 'completed' | 'no_results' };

interface PresignedPriceCheckImage {
  url: string;
  key: string;
  public_url: string;
  content_type: string;
  size: number;
}

const requestHeaders = (contentType = 'application/json'): HeadersInit => {
  const headers: Record<string, string> = { 'Content-Type': contentType };
  const token = window.localStorage.getItem('flipit_token');
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

const REQUEST_TIMEOUT_MS = 10_000;

const failureTypeForStatus = (status: number): PriceCheckFailureType => {
  if (status === 429) return 'rate_limited';
  if (status >= 400 && status < 500) return 'invalid_request';
  return 'provider_unavailable';
};

const request = async (input: RequestInfo | URL, init: RequestInit): Promise<Response> => {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new PriceCheckRequestError('timeout');
    }
    throw new PriceCheckRequestError('network');
  } finally {
    window.clearTimeout(timeout);
  }
};

export async function uploadPriceCheckImage(file: File): Promise<PriceCheckImage> {
  const presignResponse = await request('/api/price-checks/images/presign/', {
    method: 'POST',
    credentials: 'include',
    headers: requestHeaders(),
    body: JSON.stringify({
      filename: file.name,
      content_type: file.type,
      size: file.size,
    }),
  });
  if (!presignResponse.ok) throw new PriceCheckRequestError(failureTypeForStatus(presignResponse.status));
  const presigned = (await presignResponse.json()) as PresignedPriceCheckImage;

  const uploadResponse = await request(presigned.url, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });
  if (!uploadResponse.ok) throw new PriceCheckRequestError('upload_failed');

  return {
    key: presigned.key,
    url: presigned.public_url,
    filename: file.name,
    content_type: file.type,
    size: file.size,
  };
}

export async function createPriceCheck(payload: PriceCheckCreatePayload): Promise<CompletedPriceCheckResult> {
  const response = await request('/api/price-checks/', {
    method: 'POST',
    credentials: 'include',
    headers: requestHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new PriceCheckRequestError(failureTypeForStatus(response.status));
  const data = (await response.json()) as PriceCheckResult;
  if (data.status !== 'completed' && data.status !== 'no_results') {
    throw new PriceCheckRequestError('provider_unavailable');
  }
  return data as CompletedPriceCheckResult;
}
