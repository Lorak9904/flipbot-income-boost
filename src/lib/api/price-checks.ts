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
  status: 'pending' | 'completed' | 'no_results' | 'failed';
  error_message: string;
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

const errorMessage = async (response: Response): Promise<string> => {
  try {
    const payload = await response.json();
    if (typeof payload?.detail === 'string') return payload.detail;
    if (typeof payload?.error_message === 'string') return payload.error_message;
    const first = Object.values(payload || {}).flat().find((value) => typeof value === 'string');
    if (typeof first === 'string') return first;
  } catch {
    // Use the generic message below when the provider did not return JSON.
  }
  return `Request failed (${response.status})`;
};

export async function uploadPriceCheckImage(file: File): Promise<PriceCheckImage> {
  const presignResponse = await fetch('/api/price-checks/images/presign/', {
    method: 'POST',
    credentials: 'include',
    headers: requestHeaders(),
    body: JSON.stringify({
      filename: file.name,
      content_type: file.type,
      size: file.size,
    }),
  });
  if (!presignResponse.ok) throw new Error(await errorMessage(presignResponse));
  const presigned = (await presignResponse.json()) as PresignedPriceCheckImage;

  const uploadResponse = await fetch(presigned.url, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });
  if (!uploadResponse.ok) throw new Error('Image upload failed');

  return {
    key: presigned.key,
    url: presigned.public_url,
    filename: file.name,
    content_type: file.type,
    size: file.size,
  };
}

export async function createPriceCheck(payload: PriceCheckCreatePayload): Promise<PriceCheckResult> {
  const response = await fetch('/api/price-checks/', {
    method: 'POST',
    credentials: 'include',
    headers: requestHeaders(),
    body: JSON.stringify(payload),
  });
  const data = (await response.json()) as PriceCheckResult;
  if (!response.ok) {
    throw new Error(data.error_message || `Price check failed (${response.status})`);
  }
  return data;
}
