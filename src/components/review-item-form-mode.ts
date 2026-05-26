import { Platform } from '@/types/item';

export type ReviewItemFormMode = 'add' | 'edit' | 'republish';

export const SUPPORTED_PLATFORMS: Platform[] = ['facebook', 'olx', 'vinted', 'ebay', 'allegro'];

interface PlatformSelectionInput {
  mode: ReviewItemFormMode;
  connectedPlatforms: Record<Platform, boolean>;
  publishedPlatforms: Platform[];
}

export function isPublishMode(mode: ReviewItemFormMode): boolean {
  return mode === 'add' || mode === 'republish';
}

export function getConnectedSupportedPlatforms(
  connectedPlatforms: Record<Platform, boolean>
): Platform[] {
  // Kept for backward compatibility with older call-sites.
  return SUPPORTED_PLATFORMS.filter((platform) => connectedPlatforms[platform]);
}

export function getPlatformSelectionOptions({
  mode,
  connectedPlatforms,
  publishedPlatforms,
}: PlatformSelectionInput): Platform[] {
  if (mode === 'edit') {
    return SUPPORTED_PLATFORMS;
  }
  return SUPPORTED_PLATFORMS.filter(
    (platform) => connectedPlatforms[platform] && !publishedPlatforms.includes(platform)
  );
}

export function getDefaultSelectedPlatforms(
  mode: ReviewItemFormMode,
  options: Platform[],
  publishPlatform?: Platform
): Platform[] {
  if (mode === 'republish' && publishPlatform && options.includes(publishPlatform)) {
    return [publishPlatform];
  }
  return options;
}
