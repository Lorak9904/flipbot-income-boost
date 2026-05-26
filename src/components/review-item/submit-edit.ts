import type { GeneratedItemData, MarketplaceAttributes, PlatformOverrides } from '@/types/item';
import { updateItem, type UpdateItemPayload } from '@/lib/api/items';
import type { Platform } from '@/types/item';
import { resolveCurrency } from '@/lib/currency';

interface SubmitEditDraftInput {
  editItemId?: string;
  draftId?: string;
  data: GeneratedItemData & { draft_id?: string };
  platformOverridesPayload?: PlatformOverrides;
  marketplaceAttributes?: MarketplaceAttributes;
}

export async function submitEditDraft({
  editItemId,
  draftId,
  data,
  platformOverridesPayload,
  marketplaceAttributes,
}: SubmitEditDraftInput): Promise<{ itemId: string; dirtyPlatforms: Platform[] }> {
  const targetId = editItemId || draftId;
  if (!targetId) {
    throw new Error('Missing item id for update');
  }

  const numericPrice = parseFloat(data.price);
  if (Number.isNaN(numericPrice)) {
    throw new Error('Invalid price format');
  }

  const uniqueImageUrls = Array.from(new Set(data.images.map((image) => image.url)));

  const updatePayload: UpdateItemPayload = {
    title: data.title,
    description: data.description,
    brand: data.brand,
    condition: data.condition,
    category: data.category,
    size: data.size,
    price: numericPrice,
    currency: resolveCurrency(data.currency),
    catalog_path: data.catalog_path,
    images: uniqueImageUrls,
  };

  if (platformOverridesPayload) {
    updatePayload.platform_listing_overrides = platformOverridesPayload;
  }

  if (marketplaceAttributes && Object.keys(marketplaceAttributes).length > 0) {
    updatePayload.marketplace_attributes = marketplaceAttributes;
  }

  const updatedItem = await updateItem(targetId, updatePayload);
  const publishedPlatforms = new Set(
    (updatedItem.publish_results || [])
      .filter((result) => result.status === 'success' || result.success)
      .map((result) => result.platform)
  );
  const dirtyPlatforms = (['olx', 'ebay', 'allegro'] as Platform[]).filter((platform) => {
    const syncStatus = updatedItem.platform_sync_status?.[platform];
    return publishedPlatforms.has(platform) && !!syncStatus?.dirty;
  });

  return { itemId: targetId, dirtyPlatforms };
}
