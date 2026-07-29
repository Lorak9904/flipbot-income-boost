import { useEffect, useRef, useState } from 'react';
import { usePostHog } from '@posthog/react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { COOKIE_CONSENT_EVENT, hasOptionalCookieConsent } from '@/lib/cookie-consent';
import { getPathLanguage } from '@/lib/localized-routes';
import {
  EMPTY_ACCOUNT_IDENTITY,
  syncPostHogAccount,
  type AccountIdentityState,
} from '@/lib/analytics/account-identity';
import { normalizeAnalyticsPath } from '@/lib/analytics/route-privacy';

export default function PostHogUserSync() {
  const posthog = usePostHog();
  const location = useLocation();
  const { user, isLoading } = useAuth();
  const identityRef = useRef<AccountIdentityState>(EMPTY_ACCOUNT_IDENTITY);
  const [canIdentify, setCanIdentify] = useState(() => hasOptionalCookieConsent());
  const interfaceLanguage = getPathLanguage(location.pathname) ?? user?.language ?? 'en';

  useEffect(() => {
    const handleConsentAccepted = () => setCanIdentify(true);
    window.addEventListener(COOKIE_CONSENT_EVENT, handleConsentAccepted);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, handleConsentAccepted);
  }, []);

  useEffect(() => {
    if (!posthog) return;

    posthog.register({
      interface_language: interfaceLanguage,
      localized_route: location.pathname === '/pl' || location.pathname.startsWith('/pl/'),
      analytics_path: normalizeAnalyticsPath(location.pathname),
    });
  }, [interfaceLanguage, location.pathname, posthog]);

  useEffect(() => {
    if (!posthog) return;

    identityRef.current = syncPostHogAccount(posthog, identityRef.current, {
      canIdentify,
      isLoading,
      user,
      interfaceLanguage,
    });
  }, [
    canIdentify,
    isLoading,
    posthog,
    interfaceLanguage,
    user,
  ]);

  return null;
}
