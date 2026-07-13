import type { GeneratedItemDataWithVinted, ItemImage, MarketplaceAttributeField, Platform } from '@/types/item';
import { resolveItemImageUrl } from '@/lib/images';
import { resolveCurrency } from '@/lib/currency';

interface RawItem {
  id?: string;
  uuid?: string;
  title?: string;
  description?: string;
  description_full?: string;
  brand?: string;
  condition?: string;
  category?: string;
  price?: string | number;
  currency?: string;
  catalog_path?: string;
  catalog_path_detected?: string;
  size?: string;
  gender?: string;
  images?: unknown[];
  analysis?: Record<string, unknown>;
  platform_listing_overrides?: GeneratedItemDataWithVinted['platform_listing_overrides'];
  marketplace_attributes?: GeneratedItemDataWithVinted['marketplace_attributes'];
  publish_results?: Array<{ platform?: Platform; status?: string }>;
  platforms_published?: Platform[];
  platforms?: Platform[];
}

function toImages(images: unknown[] | undefined, enhancedUrls: Set<string>): ItemImage[] {
  return (images || []).flatMap((image: unknown, index) => {
    const url = resolveItemImageUrl(image);
    if (!url) return [];

    const imageMetadata = image && typeof image === 'object'
      ? image as Record<string, unknown>
      : null;
    return [{
      id: `existing-${index}`,
      url,
      isUploaded: true,
      enhanced: imageMetadata?.enhanced === true || enhancedUrls.has(url),
    }];
  });
}

export function toReviewFormData(item: RawItem): GeneratedItemDataWithVinted {
  const analysis = item.analysis && typeof item.analysis === 'object' ? item.analysis : {};
  const enhancedImageUrls = new Set(
    Array.isArray(analysis.ai_enhanced_image_urls)
      ? analysis.ai_enhanced_image_urls.filter((url): url is string => typeof url === 'string')
      : []
  );
  const platformOverrides =
    item.platform_listing_overrides && typeof item.platform_listing_overrides === 'object'
      ? item.platform_listing_overrides
      : undefined;
  const analysisMarketplaceAttributes =
    analysis.marketplace_attributes as GeneratedItemDataWithVinted['marketplace_attributes'];
  const marketplaceAttributes =
    item.marketplace_attributes ||
    analysisMarketplaceAttributes ||
    (() => {
      const platformsBlock = analysis.platforms as Record<string, unknown> | undefined;
      const vintedBlock = platformsBlock?.vinted as Record<string, unknown> | undefined;
      const fields = vintedBlock?.attribute_definitions;
      const values = platformOverrides?.vinted?.attribute_values;
      if (Array.isArray(fields) || values) {
        return {
          vinted: {
            platform: 'vinted' as const,
            category_id: vintedBlock?.category_id as string | number | undefined,
            fields: Array.isArray(fields) ? (fields as MarketplaceAttributeField[]) : [],
            values: values || {},
          },
        };
      }
      return undefined;
    })();
  const priceText =
    item.price !== undefined && item.price !== null && item.price !== '' ? String(item.price) : '0';
  const currency = resolveCurrency(
    item.currency ||
      (analysis.olx_currency as string | undefined) ||
      (analysis.vinted_currency as string | undefined)
  );

  return {
    title: item.title || '',
    description: item.description || item.description_full || '',
    brand: item.brand || '',
    condition: item.condition || '',
    category: item.category || '',
    price: priceText,
    currency,
    catalog_path: item.catalog_path || item.catalog_path_detected || '',
    size: item.size || '',
    gender: item.gender,
    draft_id: item.uuid || item.id,
    priceRange: {
      min: '',
      max: '',
    },
    platform_listing_overrides: platformOverrides,
    marketplace_attributes: marketplaceAttributes,
    images: toImages(item.images, enhancedImageUrls),
    brand_id: analysis.brand_id as number | undefined,
    brand_title: analysis.brand_title as string | undefined,
    brand_confidence: analysis.brand_confidence as string | undefined,
    brand_match_reason: analysis.brand_match_reason as string | undefined,
    model_id: analysis.model_id as number | undefined,
    package_size_id: analysis.package_size_id as number | undefined,
    package_size: analysis.package_size as string | undefined,
    enhanced_images: Array.from(enhancedImageUrls),
  };
}

export function getPublishedPlatforms(item: RawItem): Platform[] {
  const publishedFromResults = (item.publish_results || [])
    .filter((result) => result.status === 'success')
    .map((result) => result.platform)
    .filter((platform): platform is Platform => Boolean(platform));

  if (publishedFromResults.length > 0) {
    return publishedFromResults;
  }
  return ((item.platforms_published || item.platforms || []) as Platform[]).filter(Boolean);
}
