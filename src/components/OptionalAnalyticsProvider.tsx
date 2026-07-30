import { useEffect, useState, type ReactNode } from 'react';
import { PostHogProvider } from '@posthog/react';
import type { PostHogConfig } from 'posthog-js';
import { useAuth } from '@/contexts/AuthContext';
import {
  COOKIE_CONSENT_CHOICE_EVENT,
  COOKIE_CONSENT_KEY,
  hasOptionalCookieConsent,
  notifyCookieConsentChoice,
  type CookieConsentEvent,
} from '@/lib/cookie-consent';
import {
  clearStoredPostHogState,
  resumeOptionalAnalytics,
  setOptionalAnalyticsReady,
  stopOptionalAnalytics,
} from '@/lib/analytics/optional-consent';
import { sanitizePostHogEvent } from '@/lib/analytics/route-privacy';

const POSTHOG_KEY = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com';

const postHogOptions: Partial<PostHogConfig> = {
  api_host: POSTHOG_HOST,
  ui_host: 'https://eu.posthog.com',
  defaults: '2026-01-30',
  capture_pageview: 'history_change',
  capture_pageleave: true,
  autocapture: true,
  capture_exceptions: true,
  before_send: sanitizePostHogEvent,
  persistence: 'localStorage+cookie',
  opt_out_capturing_by_default: true,
  opt_out_persistence_by_default: true,
  disable_session_recording: true,
  request_batching: false,
  session_recording: { maskAllInputs: true },
  loaded: () => {
    try {
      performance.mark('flipit:optional-analytics-client-loaded');
    } catch {
      // Diagnostics must not interfere with optional analytics startup.
    }
    resumeOptionalAnalytics();
  },
};

export function OptionalAnalyticsProvider({ children }: { children: ReactNode }) {
  const { isLoading, user } = useAuth();
  const [hasConsent, setHasConsent] = useState(hasOptionalCookieConsent);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const handleChoice = (event: Event) => {
      const choice = (event as CookieConsentEvent).detail.choice;
      if (choice === 'essential') {
        stopOptionalAnalytics();
        setHasConsent(false);
        return;
      }
      setHasConsent(true);
    };
    window.addEventListener(COOKIE_CONSENT_CHOICE_EVENT, handleChoice);
    return () => window.removeEventListener(COOKIE_CONSENT_CHOICE_EVENT, handleChoice);
  }, []);

  useEffect(() => {
    const handleStoredChoice = (event: StorageEvent) => {
      if (event.key !== COOKIE_CONSENT_KEY) return;
      notifyCookieConsentChoice(event.newValue === 'accepted' ? 'accepted' : 'essential');
    };
    window.addEventListener('storage', handleStoredChoice);
    return () => window.removeEventListener('storage', handleStoredChoice);
  }, []);

  useEffect(() => {
    if (!POSTHOG_KEY || isLoading) {
      setOptionalAnalyticsReady(false);
      return;
    }

    if (!hasConsent) {
      setOptionalAnalyticsReady(false);
      return;
    }

    if (!user) clearStoredPostHogState();
    if (initialized) {
      resumeOptionalAnalytics();
    } else {
      setInitialized(true);
    }
  }, [hasConsent, initialized, isLoading, user]);

  if (!POSTHOG_KEY || !initialized) return children;

  return (
    <PostHogProvider apiKey={POSTHOG_KEY} options={postHogOptions}>
      {children}
    </PostHogProvider>
  );
}
