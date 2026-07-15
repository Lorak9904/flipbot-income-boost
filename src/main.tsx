import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { StrictMode } from 'react'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { PostHogProvider } from '@posthog/react'
import posthog from 'posthog-js'
import { COOKIE_CONSENT_EVENT, hasOptionalCookieConsent } from './lib/cookie-consent.ts'
import type { PostHogConfig } from 'posthog-js'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const POSTHOG_KEY = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com';

const app = (
  <GoogleOAuthProvider clientId={CLIENT_ID}>
    <App />
  </GoogleOAuthProvider>
);

const root = createRoot(document.getElementById('root')!);
document.getElementById('seo-prerender')?.remove();

const buildPostHogOptions = (): Partial<PostHogConfig> => {
  const hasOptionalConsent = hasOptionalCookieConsent();

  return {
    api_host: POSTHOG_HOST,
    ui_host: 'https://eu.posthog.com',
    defaults: '2026-01-30',
    capture_pageview: 'history_change',
    capture_pageleave: true,
    autocapture: true,
    capture_exceptions: true,
    persistence: hasOptionalConsent ? 'localStorage+cookie' : 'memory',
    disable_session_recording: !hasOptionalConsent,
    session_recording: {
      maskAllInputs: true,
    },
  };
};

const renderApp = () => {
  if (POSTHOG_KEY) {
    root.render(
      <StrictMode>
        <PostHogProvider apiKey={POSTHOG_KEY} options={buildPostHogOptions()}>
          {app}
        </PostHogProvider>
      </StrictMode>
    );
    return;
  }

  if (import.meta.env.DEV) {
    if (!POSTHOG_KEY) {
      console.warn('PostHog disabled: set VITE_PUBLIC_POSTHOG_KEY to enable analytics.');
    }
  }

  root.render(
    <StrictMode>
      {app}
    </StrictMode>
  );
};

renderApp();

const handleOptionalCookieConsentAccepted = () => {
  renderApp();
  if (POSTHOG_KEY) {
    window.requestAnimationFrame(() => {
      posthog.startSessionRecording();
    });
  }
};

window.addEventListener(COOKIE_CONSENT_EVENT, handleOptionalCookieConsentAccepted);
