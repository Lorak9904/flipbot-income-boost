import { UserItemImage } from '@/types/item';

/**
 * Utilities for building Cloudflare Image Resizing URLs.
 * Works only when the image URL is served from our configured public images domain.
 */

const BASE = (import.meta as any)?.env?.VITE_IMAGES_BASE_URL || 'https://images.myflipit.live';
const RESIZE_ENABLED = String((import.meta as any)?.env?.VITE_ENABLE_CDN_RESIZING || 'false').toLowerCase() === 'true';

function normalizeBase(base: string): URL | null {
  try {
    const u = new URL(base);
    // Drop trailing slash for consistent join
    if (u.pathname !== '/') {
      u.pathname = '/';
    }
    return u;
  } catch {
    return null;
  }
}

const baseUrl = normalizeBase(BASE);

export type ResizeOptions = {
  width?: number;
  height?: number;
  quality?: number; // 1..100
  format?: 'auto' | 'webp' | 'jpeg' | 'png';
};

/**
 * Build a Cloudflare Image Resizing URL for a given origin URL, if it matches our images base domain.
 * Falls back to the original URL if the origin isn't on our domain or if something fails.
 */
export function cdnImage(url: string, opts: ResizeOptions = {}): string {
  if (!url) return url;
  try {
    const origin = new URL(url);
    if (!RESIZE_ENABLED) return url;
    if (!baseUrl || origin.host !== baseUrl.host) return url; // different host ⇒ no transform

    const params: string[] = [];
    if (opts.width) params.push(`width=${Math.max(1, Math.floor(opts.width))}`);
    if (opts.height) params.push(`height=${Math.max(1, Math.floor(opts.height))}`);
    params.push(`quality=${Math.min(100, Math.max(1, opts.quality ?? 85))}`);
    params.push(`format=${opts.format ?? 'auto'}`);

    // Ensure we keep the key path after the domain
    // For example: https://images.example.com/uploads/uuid.jpg
    // becomes:    https://images.example.com/cdn-cgi/image/width=310,.../uploads/uuid.jpg
    const out = new URL(baseUrl.href);
    const prefix = `cdn-cgi/image/${params.join(',')}`;
    // origin.pathname always begins with '/'
    out.pathname = `/${prefix}${origin.pathname}`;
    out.search = origin.search;
    out.hash = origin.hash;
    return out.toString();
  } catch {
    return url;
  }
}

/**
 * Quick helpers for common sizes.
 */
export const cdnThumb = (url: string) => cdnImage(url, { width: 310, quality: 85 });
export const cdnGrid = (url: string) => cdnImage(url, { width: 480, quality: 85 });
export const cdnLarge = (url: string) => cdnImage(url, { width: 1024, quality: 90 });

/**
 * Accepts mixed image representations (string URLs or stored objects) and returns a usable URL.
 * Falls back to empty string when nothing suitable is found.
 */
export function resolveItemImageUrl(image?: UserItemImage | null): string {
  if (!image) return '';
  if (typeof image === 'string') return image;

  return (
    image.url ||
    image.preview ||
    image.cdn_url ||
    ''
  );
}
