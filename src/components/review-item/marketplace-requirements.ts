import type {
  MarketplaceAttributeField,
  MarketplaceAttributeValue,
  Platform,
  PlatformDynamicAttributeValue,
  PlatformOverrides,
} from '@/types/item';

export type MarketplaceRequirementState =
  | 'ready'
  | 'needs_category'
  | 'needs_attributes'
  | 'checking'
  | 'unavailable'
  | 'not_required';

export interface MarketplaceRequirementReadiness {
  state: MarketplaceRequirementState;
  missingCount?: number;
}

export function hasRequirementValue(
  value: MarketplaceAttributeValue | PlatformDynamicAttributeValue | undefined | null
): boolean {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value);
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  const candidate = value as Record<string, unknown>;
  return [
    candidate.value_id,
    candidate.valueId,
    candidate.value,
    candidate.value_ids,
    candidate.valuesIds,
    candidate.values,
  ].some((item) => {
    if (Array.isArray(item)) {
      return item.length > 0;
    }
    if (typeof item === 'string') {
      return item.trim().length > 0;
    }
    return item !== null && item !== undefined;
  });
}

export function countMissingRequiredFields(
  fields: MarketplaceAttributeField[],
  values: Record<string, MarketplaceAttributeValue | PlatformDynamicAttributeValue | undefined>
): number {
  return fields.filter((field) => field.required && !hasRequirementValue(values[field.key])).length;
}

export function platformCategoryId(
  platform: Platform,
  overrides: PlatformOverrides
): string | number | undefined {
  switch (platform) {
    case 'vinted':
      return overrides.vinted?.catalog_id;
    case 'olx':
      return overrides.olx?.category_id;
    case 'ebay':
      return overrides.ebay?.category_id || overrides.ebay?.category_path;
    case 'allegro':
      return overrides.allegro?.category_id;
    case 'etsy':
      return overrides.etsy?.taxonomy_id || overrides.etsy?.category_id;
    default:
      return undefined;
  }
}

export function baseMarketplaceReadiness(
  platform: Platform,
  overrides: PlatformOverrides,
  isConnected: boolean
): MarketplaceRequirementReadiness {
  if (platform === 'facebook') {
    return { state: 'not_required' };
  }

  if (!isConnected) {
    return { state: 'unavailable' };
  }

  if (!platformCategoryId(platform, overrides)) {
    return { state: 'needs_category' };
  }

  return { state: 'checking' };
}
