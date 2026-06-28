import type { Platform } from '@/types/item';

type PostHogLike = {
  capture: (eventName: string, properties?: Record<string, unknown>) => void;
} | null | undefined;

export type ActivationEventName =
  | 'account_connected'
  | 'draft_created'
  | 'publish_attempted'
  | 'publish_succeeded'
  | 'publish_failed'
  | 'first_live_listing_created'
  | 'activation_guide_cta_clicked';

const FIRST_LIVE_LISTING_KEY_PREFIX = 'flipit:first-live-listing-created';

export function captureActivationEvent(
  posthog: PostHogLike,
  eventName: ActivationEventName,
  properties: Record<string, unknown> = {}
) {
  if (!posthog) return;

  posthog.capture(eventName, {
    source: 'flipit_web',
    ...properties,
  });
}

export function captureFirstLiveListingCreated(
  posthog: PostHogLike,
  userId: string | undefined,
  properties: {
    draft_id?: string;
    platforms: Platform[];
    platform_count: number;
  }
) {
  const storageKey = `${FIRST_LIVE_LISTING_KEY_PREFIX}:${userId || 'anonymous'}`;

  try {
    if (window.localStorage.getItem(storageKey)) {
      return;
    }
    window.localStorage.setItem(storageKey, '1');
  } catch {
    // If storage is unavailable, still emit the event for the current session.
  }

  captureActivationEvent(posthog, 'first_live_listing_created', properties);
}
