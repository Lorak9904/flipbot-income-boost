import { Platform } from '@/types/item';
import { ALL_PLATFORMS } from '@/lib/platforms';
import {
  canUseMarketplaceCapability,
  type MarketplaceCapabilities,
} from '@/lib/api/platform-capabilities';

export type ReviewItemFormMode = 'add' | 'edit' | 'republish';

interface PlatformSelectionInput {
  mode: ReviewItemFormMode;
  connectedPlatforms: Record<Platform, boolean>;
  publishedPlatforms: Platform[];
  capabilities?: MarketplaceCapabilities | null;
}

export function isPublishMode(mode: ReviewItemFormMode): boolean {
  return mode === 'add' || mode === 'republish';
}

export function getConnectedSupportedPlatforms(
  connectedPlatforms: Record<Platform, boolean>
): Platform[] {
  // Kept for backward compatibility with older call-sites.
  return ALL_PLATFORMS.filter((platform) => connectedPlatforms[platform]);
}

export function getPlatformSelectionOptions({
  mode,
  publishedPlatforms,
  capabilities,
}: PlatformSelectionInput): Platform[] {
  if (mode === 'edit') {
    return ALL_PLATFORMS;
  }
  return ALL_PLATFORMS.filter(
    (platform) =>
      !publishedPlatforms.includes(platform) &&
      canUseMarketplaceCapability(capabilities, platform, 'publish')
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
