import type { Platform } from '@/types/item';

export const ALL_PLATFORMS: Platform[] = ['facebook', 'olx', 'vinted', 'ebay', 'allegro', 'etsy'];

export const STATISTICS_SUPPORTED_PLATFORMS: Platform[] = ['olx', 'ebay', 'allegro', 'etsy'];

export const formatPlatformLabel = (platform: Platform | string): string => {
  if (platform === 'ebay') return 'eBay';
  if (platform === 'olx') return 'OLX';
  if (platform === 'allegro') return 'Allegro';
  if (platform === 'facebook') return 'Facebook';
  if (platform === 'etsy') return 'Etsy';
  if (platform === 'vinted') return 'Vinted';
  return String(platform).charAt(0).toUpperCase() + String(platform).slice(1);
};
