
export interface ItemImage {
  id: string;
  url: string;
  // Local preview (blob:) to keep image visible even if CDN URL fails
  preview?: string;
  file?: File;
  isUploaded: boolean;
  isCompressing?: boolean;
  isUploading?: boolean;
  progress?: number;
  enhanced?: boolean; // 🍌 Flag for nano banana enhanced images
}

export type UserItemImage =
  | string
  | {
      url?: string;
      preview?: string;
      cdn_url?: string;
      [key: string]: unknown;
    };

export interface ItemFormData {
  // Simplified: only optional title and expected_price
  title?: string;
  expected_price?: string;
  currency?: string;
  images: ItemImage[];
  // All other fields (brand, description, condition, category, size, gender) are AI-generated
}

export interface GeneratedItemData {
  title: string;
  description: string;
  brand: string;
  condition: string;
  category: string;
  price: string;
  currency: string;
  catalog_path?: string;
  size?: string;
  gender?: string;
  draft_id?: string;
  platform_listing_overrides?: PlatformOverrides;
  priceRange: {
    min: string;
    max: string;
  };
  images: ItemImage[];
}

export type Platform = 'facebook' | 'olx' | 'vinted' | 'ebay' | 'allegro';

export interface PlatformFieldOverrides {
  title?: string;
  description?: string;
  price?: string | number;
  currency?: string;
  brand?: string;
  condition?: string;
  category?: string;
  size?: string;
}

export type PlatformDynamicAttributeValue =
  | string
  | number
  | Array<string | number>
  | {
      valuesIds?: Array<string | number>;
      values?: Array<string | number>;
      valueId?: string | number;
      value?: string | number;
      rangeValue?: Record<string, unknown> | null;
    };

export type MarketplaceAttributeInputType = 'text' | 'select' | 'multi_select' | 'number';

export interface MarketplaceAttributeOption {
  value: string | number;
  label: string;
  description?: string;
}

export interface MarketplaceAttributeField {
  key: string;
  platform: Platform;
  native_code?: string;
  native_id?: string | number;
  label: string;
  required: boolean;
  input_type: MarketplaceAttributeInputType;
  type?: MarketplaceAttributeInputType;
  options?: MarketplaceAttributeOption[];
  selection_type?: string;
  selection_limit?: number;
  source?: string;
  description?: string;
  placeholder?: string;
  metadata?: Record<string, unknown>;
}

export interface MarketplaceAttributeValue {
  native_code?: string;
  native_id?: string | number;
  value_id?: string | number;
  value_ids?: Array<string | number>;
  value?: string | number;
  values?: Array<string | number> | string | number;
}

export interface MarketplaceAttributeState {
  platform: Platform;
  category_id?: string | number | null;
  fields: MarketplaceAttributeField[];
  values: Record<string, MarketplaceAttributeValue>;
}

export type MarketplaceAttributes = Partial<Record<Platform, MarketplaceAttributeState>>;

export interface AllegroProductParameterSnapshot {
  id: string;
  name?: string;
  values?: Array<string | number>;
  valuesIds?: Array<string | number>;
  valuesLabels?: string[];
  unit?: string | null;
  options?: Record<string, unknown>;
}

export interface PlatformOverrides {
  olx?: {
    country_code?: string;
    country?: string;
    category_id?: number | string;
    category_path?: string;
    /** Dynamic attribute values (key -> value) fetched from platform metadata */
    attributes?: Record<string, PlatformDynamicAttributeValue>;
    /** Optional per-platform listing field overrides */
    field_overrides?: PlatformFieldOverrides;
  };
  vinted?: {
    catalog_id?: number | string;
    attribute_values?: Record<string, MarketplaceAttributeValue>;
    /** Optional per-platform listing field overrides */
    field_overrides?: PlatformFieldOverrides;
  };
  ebay?: {
    category_path?: string;
    category_id?: string;
    marketplace_id?: string;
    /** Dynamic attribute values (aspects) for eBay */
    attributes?: Record<string, PlatformDynamicAttributeValue>;
    /** Optional per-platform listing field overrides */
    field_overrides?: PlatformFieldOverrides;
  };
  allegro?: {
    category_id?: string | number;
    category_path?: string;
    marketplace_id?: string;
    product_id?: string;
    product_name?: string;
    product_image_url?: string;
    product_category_path?: string;
    product_parameters?: AllegroProductParameterSnapshot[];
    /** Dynamic parameter values for Allegro payload overrides */
    attributes?: Record<string, PlatformDynamicAttributeValue>;
    /** Optional per-platform listing field overrides */
    field_overrides?: PlatformFieldOverrides;
  };
  [key: string]: unknown;
}

// Backend API types for user items
export type ItemStatus = 'draft' | 'active' | 'inactive' | 'sold' | 'expired' | 'removed' | 'blocked';
export type ItemStatusGroup = 'live' | 'drafts' | 'needs_attention' | 'sold_ended';

export interface PlatformPublishResult {
  platform: Platform;
  status: 'pending' | 'success' | 'removed' | 'error';
  status_code?: number;
  message?: string;
  external_id?: string;
  listing_url?: string;
  response?: Record<string, unknown>;
  marketplace_account_key?: string;
  marketplace_country?: string;
  created_at?: string;
  updated_at?: string;
  // Legacy fields for backwards compatibility
  success?: boolean;
  post_id?: string;
  error_message?: string;
  published_at?: string;
}

export interface PlatformLifecycleStatus {
  last_operation_type?: string;
  last_result?: 'pending' | 'success' | 'error' | null;
  last_attempted_at?: string | null;
  last_completed_at?: string | null;
  listing_url?: string | null;
  external_listing_id?: string | null;
  last_error_message?: string | null;
}

export interface LifecycleEvent {
  id?: number;
  platform: Platform;
  operation_type: string;
  direction?: 'push' | 'pull' | string;
  status: 'pending' | 'success' | 'error';
  attempted_at?: string;
  completed_at?: string;
  error_message?: string | null;
  listing_url?: string | null;
  [key: string]: unknown;
}

/** Per-platform sync status (dirty/clean + timestamps) */
export interface PlatformSyncStatus {
  dirty: boolean;
  last_synced_at?: string | null;
  last_payload_hash?: string | null;
}

export interface UserItem {
  uuid: string;
  title: string;
  description: string;
  price: string;
  currency?: string;
  brand?: string;
  condition?: string;
  category?: string;
  size?: string;
  gender?: string;
  status: ItemStatus;  // draft, active, inactive, sold, expired, removed, blocked
  stage?: 'draft' | 'published';  // High-level stage for UI display
  images: UserItemImage[];
  platforms: Platform[];
  publish_results?: PlatformPublishResult[];
  created_at?: string;
  updated_at?: string;
  published_at?: string;
  // Enriched analysis fields
  analysis?: Record<string, unknown>;
  description_full?: string;
  dimensions_cm?: Record<string, unknown>;
  weight_kg?: number;
  shipping_advice?: Record<string, unknown>;
  catalog_path?: string;
  platform_listing_overrides?: PlatformOverrides;
  marketplace_attributes?: MarketplaceAttributes;
  /** Per-platform sync status: {platform: {dirty, last_synced_at, last_payload_hash}} */
  platform_sync_status?: Record<Platform, PlatformSyncStatus>;
  platform_lifecycle_status?: Partial<Record<Platform, PlatformLifecycleStatus>>;
  recent_lifecycle_events?: LifecycleEvent[];
}

export interface UserItemsListResponse {
  items: UserItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ItemStats {
  total_items: number;
  draft_items: number;
  published_items: number;
  by_platform: Record<Platform, number>;
  publish_success_rate: number;
  total_errors: number;
}

// Extended GeneratedItemData with dynamic Vinted fields
export interface GeneratedItemDataWithVinted extends GeneratedItemData {
  marketplace_attributes?: MarketplaceAttributes;
  // Vinted-optimized content (LLM-generated for Vinted platform)
  vinted_title?: string;       // Vinted-optimized title (used during publishing)
  vinted_description?: string; // Vinted-optimized description (used during publishing)
  vinted_condition?: number;   // Vinted condition code (1-6, used during publishing)
  vinted_category_id?: number; // Vinted catalog ID
  // Important AI-generated fields for publishing
  brand_id?: number;           // Vinted brand ID (looked up from brand database)
  brand_title?: string;        // Resolved brand name
  brand_confidence?: number;   // Brand match confidence (0-1)
  model_id?: number;           // Vinted model ID (for laptops/electronics)
  package_size_id?: number;    // Shipping package size ID (1=small, 2=medium, 3=large)
  package_size?: string;       // Package size string ('small', 'medium', 'large')
  // 🍌 Nano Banana enhanced images
  enhanced_images?: string[];  // Array of R2 URLs for AI-enhanced product photos
}
