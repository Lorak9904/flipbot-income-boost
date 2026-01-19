
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

export type Platform = 'facebook' | 'olx' | 'vinted' | 'ebay';

export interface PlatformOverrides {
  olx?: {
    category_id?: number | string;
    /** Dynamic attribute values (key -> value) fetched from platform metadata */
    attributes?: Record<string, string | number>;
  };
  vinted?: {
    catalog_id?: number | string;
    field_mappings?: Record<string, VintedFieldMapping>;
  };
  ebay?: {
    category_path?: string;
    category_id?: string;
    /** Dynamic attribute values (aspects) for eBay */
    attributes?: Record<string, string | number>;
  };
  [key: string]: unknown;
}

// Backend API types for user items
export type ItemStatus = 'draft' | 'active' | 'inactive' | 'sold' | 'expired' | 'removed' | 'blocked';

export interface PlatformPublishResult {
  platform: Platform;
  status: 'pending' | 'success' | 'error';
  status_code?: number;
  message?: string;
  external_id?: string;
  listing_url?: string;
  response?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
  // Legacy fields for backwards compatibility
  success?: boolean;
  post_id?: string;
  error_message?: string;
  published_at?: string;
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
  /** Per-platform sync status: {platform: {dirty, last_synced_at, last_payload_hash}} */
  platform_sync_status?: Record<Platform, PlatformSyncStatus>;
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

// Dynamic Vinted field types for schema-driven forms
export interface VintedFieldOption {
  id: number;
  title: string;
  description?: string;
}

export interface VintedFieldDefinition {
  id: number;              // Attribute ID for Vinted API
  code: string;            // Field code (e.g., 'computer_ram', 'smartphone_storage')
  title: string;           // Human-readable field name
  required: boolean;       // Whether field is required
  options: VintedFieldOption[];  // Available options for this field
}

export interface VintedFieldMapping {
  attribute_id: number;    // Maps to VintedFieldDefinition.id
  value_id: number;        // Maps to VintedFieldOption.id
}

// Extended GeneratedItemData with dynamic Vinted fields
export interface GeneratedItemDataWithVinted extends GeneratedItemData {
  vinted_field_definitions?: VintedFieldDefinition[];
  vinted_field_mappings?: Record<string, VintedFieldMapping>;  // field_code -> {attribute_id, value_id}
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
