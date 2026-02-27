import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { StrictMode } from 'react'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { PostHogProvider } from '@posthog/react'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const POSTHOG_KEY = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com';

const app = (
  <GoogleOAuthProvider clientId={CLIENT_ID}>
    <App />
  </GoogleOAuthProvider>
);

const root = createRoot(document.getElementById('root')!);

if (POSTHOG_KEY) {
  const posthogOptions = {
    api_host: POSTHOG_HOST,
    defaults: '2026-01-30' as const,
    capture_pageview: 'history_change' as const,
    capture_pageleave: true,
    autocapture: true,
    session_recording: {
      maskAllInputs: true,
    },
  };

  root.render(
    <StrictMode>
      <PostHogProvider apiKey={POSTHOG_KEY} options={posthogOptions}>
        {app}
      </PostHogProvider>
    </StrictMode>
  );
} else {
  if (import.meta.env.DEV) {
    console.warn('PostHog disabled: set VITE_PUBLIC_POSTHOG_KEY to enable analytics.');
  }

  root.render(
    <StrictMode>
      {app}
    </StrictMode>
  );
}
