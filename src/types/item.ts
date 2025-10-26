
export interface ItemImage {
  id: string;
  url: string;
  file?: File;
  isUploaded: boolean;
  isCompressing?: boolean;
  isUploading?: boolean;
}

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
  success: boolean;
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
  images: string[];
  platforms: Platform[];
  publish_results?: PlatformPublishResult[];
  created_at: string;
  updated_at: string;
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
