import type {
  GeneratedItemDataWithVinted,
  ItemImage,
  MarketplaceAttributes,
  Platform,
  PlatformOverrides,
} from '@/types/item';

export const LISTING_EDITOR_DRAFT_SAVE_EVENT = 'flipit:save-listing-editor-draft';

export type AddItemFormSnapshot = {
  title: string;
  expectedPrice: string;
  currency: string;
  images: ItemImage[];
  generateEnhancedImage: boolean;
};

export type ReviewItemFormSnapshot = {
  data: GeneratedItemDataWithVinted;
  selectedPlatforms?: Platform[];
  marketplaceAttributes?: MarketplaceAttributes;
  platformOverrides?: PlatformOverrides;
  editItemId?: string;
  publishedPlatforms?: Platform[];
};

export type ListingEditorDraft =
  | { version: 1; kind: 'add'; data: AddItemFormSnapshot }
  | { version: 1; kind: 'review'; data: ReviewItemFormSnapshot };

const storageKey = (userId: string | number) => `flipit:listing-editor-draft:v1:${userId}`;

export function persistableImages(images: ItemImage[]): ItemImage[] {
  return images
    .filter((image) => image.isUploaded && image.url && !image.url.startsWith('blob:'))
    .map(({ file: _file, ...image }) => image);
}

export function persistListingEditorDraft(
  userId: string | number | undefined,
  draft: ListingEditorDraft,
): void {
  if (typeof window === 'undefined' || !userId) return;

  try {
    window.sessionStorage.setItem(storageKey(userId), JSON.stringify(draft));
  } catch {
    // Session storage is a convenience layer; it must never block a language switch.
  }
}

export function readListingEditorDraft(userId: string | number | undefined): ListingEditorDraft | null {
  if (typeof window === 'undefined' || !userId) return null;

  try {
    const raw = window.sessionStorage.getItem(storageKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ListingEditorDraft;
    if (parsed?.version !== 1 || (parsed.kind !== 'add' && parsed.kind !== 'review')) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearListingEditorDraft(userId: string | number | undefined): void {
  if (typeof window === 'undefined' || !userId) return;

  try {
    window.sessionStorage.removeItem(storageKey(userId));
  } catch {
    // The saved draft will naturally expire with the browser session if it cannot be removed now.
  }
}
