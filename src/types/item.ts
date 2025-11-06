
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
  title: string;
  description: string;
  brand: string;
  condition: string;
  gender?: string;
  draft_id?: string;
  category: string;
  price: string;
  images: ItemImage[];
  size?: string;
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
  priceRange: {
    min: string;
    max: string;
  };
  images: ItemImage[];
}

export type Platform = 'facebook' | 'olx' | 'vinted';

// Backend API types for user items
export type ItemStage = 'draft' | 'published';

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
  stage: ItemStage;
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
