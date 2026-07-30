import { useEffect, useState, type ReactNode } from 'react';
import { PostHogProvider } from '@posthog/react';
import type { PostHogConfig } from 'posthog-js';
import { useAuth } from '@/contexts/AuthContext';
import {
  COOKIE_CONSENT_CHOICE_EVENT,
  hasOptionalCookieConsent,
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
  disable_session_recording: false,
  session_recording: { maskAllInputs: true },
  loaded: () => resumeOptionalAnalytics(),
};

export function OptionalAnalyticsProvider({ children }: { children: ReactNode }) {
  const { isLoading, user } = useAuth();
  const [hasConsent, setHasConsent] = useState(hasOptionalCookieConsent);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const handleChoice = (event: Event) => {
      const choice = (event as CookieConsentEvent).detail.choice;
      if (choice === 'essential') {
        stopOptionalAnalytics();
        setReady(false);
        setHasConsent(false);
        return;
      }
      setHasConsent(true);
    };
    window.addEventListener(COOKIE_CONSENT_CHOICE_EVENT, handleChoice);
    return () => window.removeEventListener(COOKIE_CONSENT_CHOICE_EVENT, handleChoice);
  }, []);

  useEffect(() => {
    if (!POSTHOG_KEY || !hasConsent || isLoading) {
      setOptionalAnalyticsReady(false);
      setReady(false);
      return;
    }

    if (!user) clearStoredPostHogState();
    resumeOptionalAnalytics();
    setReady(true);
  }, [hasConsent, isLoading, user]);

  if (!POSTHOG_KEY || !ready) return children;

  return (
    <PostHogProvider apiKey={POSTHOG_KEY} options={postHogOptions}>
      {children}
    </PostHogProvider>
  );
}
