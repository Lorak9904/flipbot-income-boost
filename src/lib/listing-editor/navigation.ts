import type { Platform } from '@/types/item';

export type ListingEditorMode = 'add' | 'edit' | 'republish';

interface BuildListingEditorUrlInput {
  mode: ListingEditorMode;
  itemId?: string;
  publishPlatform?: Platform;
}

/**
 * Listing editor routing policy:
 * - Add-item entry points should use page mode: /add-item
 * - Listing edit/republish entry points should use full page mode: /add-item?edit=...
 * - Republish mode is explicit because it may target all available unpublished platforms.
 */
export function isSafeReturnPath(path: string | null | undefined): path is string {
  return Boolean(path && path.startsWith('/'));
}

export function buildListingEditorUrl({
  mode,
  itemId,
  publishPlatform,
}: BuildListingEditorUrlInput): string {
  const query = new URLSearchParams();

  if (mode !== 'add') {
    if (!itemId) {
      throw new Error('itemId is required for edit/republish listing editor modes');
    }
    query.set('edit', itemId);
  }

  if (mode === 'republish' && publishPlatform) {
    query.set('publish', publishPlatform);
  }

  if (mode === 'republish') {
    query.set('mode', 'republish');
  }

  const queryString = query.toString();
  return queryString ? `/add-item?${queryString}` : '/add-item';
}
