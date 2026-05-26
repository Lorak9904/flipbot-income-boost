import type { Platform } from '@/types/item';

export type ListingEditorMode = 'add' | 'edit' | 'republish';

interface BuildListingEditorUrlInput {
  mode: ListingEditorMode;
  itemId?: string;
  publishPlatform?: Platform;
  modal?: boolean;
  returnTo?: string;
}

/**
 * Listing editor routing policy:
 * - Global entry points (navbar/marketing) should use page mode: /add-item
 * - Contextual entry points (item detail/list actions) should use modal mode with returnTo
 */
export function isSafeReturnPath(path: string | null | undefined): path is string {
  return Boolean(path && path.startsWith('/'));
}

export function buildListingEditorUrl({
  mode,
  itemId,
  publishPlatform,
  modal = false,
  returnTo,
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

  if (modal) {
    query.set('modal', '1');
  }

  if (isSafeReturnPath(returnTo)) {
    query.set('returnTo', returnTo);
  }

  const queryString = query.toString();
  return queryString ? `/add-item?${queryString}` : '/add-item';
}
