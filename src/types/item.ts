
export interface ItemImage {
  id: string;
  url: string;
  file?: File;
  isUploaded: boolean;
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
