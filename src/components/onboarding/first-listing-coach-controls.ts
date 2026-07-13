import type { FirstListingCoachState } from '@/lib/api/user';

export const FIRST_LISTING_COACH_COMMAND_EVENT = 'flipit-first-listing-coach-command';

const SESSION_MINIMIZED_PREFIX = 'flipit_first_listing_coach_minimized';
const SESSION_INTRO_PREFIX = 'flipit_first_listing_coach_intro';

export type FirstListingCoachCommandSource = 'settings' | 'tutorial' | 'widget';

export interface FirstListingCoachCommandDetail {
  state: FirstListingCoachState;
  source: FirstListingCoachCommandSource;
}

export function getFirstListingCoachSessionKey(
  prefix: typeof SESSION_MINIMIZED_PREFIX | typeof SESSION_INTRO_PREFIX,
  userKey: string
) {
  return `${prefix}:${userKey}`;
}

export function buildActiveFirstListingCoachState(
  source: FirstListingCoachCommandSource,
  extraState: Partial<FirstListingCoachState> = {}
): FirstListingCoachState {
  return {
    status: 'active',
    open: true,
    ...extraState,
    source,
    updated_at: new Date().toISOString(),
  };
}

export function dispatchFirstListingCoachCommand(detail: FirstListingCoachCommandDetail) {
  window.dispatchEvent(new CustomEvent<FirstListingCoachCommandDetail>(FIRST_LISTING_COACH_COMMAND_EVENT, {
    detail,
  }));
}

