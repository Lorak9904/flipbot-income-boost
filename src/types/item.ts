
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
  category: string;
  price: string;
  images: ItemImage[];
}

export interface GeneratedItemData {
  title: string;
  description: string;
  brand: string;
  condition: string;
  category: string;
  price: string;
  catalog_path?: string;
  priceRange: {
    min: string;
    max: string;
  };
  images: ItemImage[];
}

export type Platform = 'facebook' | 'olx' | 'vinted';
