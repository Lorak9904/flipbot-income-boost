import { useEffect, useRef, useState } from 'react';
import { usePostHog } from '@posthog/react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { COOKIE_CONSENT_EVENT, hasOptionalCookieConsent } from '@/lib/cookie-consent';
import { getPathLanguage } from '@/lib/localized-routes';

export default function PostHogUserSync() {
  const posthog = usePostHog();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const identifiedUserIdRef = useRef<string | null>(null);
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
    });
  }, [interfaceLanguage, location.pathname, posthog]);

  useEffect(() => {
    if (!posthog) return;

    if (canIdentify && isAuthenticated && user?.id) {
      const userId = String(user.id);
      if (identifiedUserIdRef.current !== userId) {
        posthog.identify(userId, {
          email: user.email,
          name: user.name,
          provider: user.provider,
          language: interfaceLanguage,
        });
        identifiedUserIdRef.current = userId;
      }
      return;
    }

    if (identifiedUserIdRef.current) {
      posthog.reset();
      identifiedUserIdRef.current = null;
    }
  }, [
    canIdentify,
    isAuthenticated,
    posthog,
    interfaceLanguage,
    user?.email,
    user?.id,
    user?.language,
    user?.name,
    user?.provider,
  ]);

  return null;
}
