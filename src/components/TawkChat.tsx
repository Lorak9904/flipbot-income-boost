import { useEffect, useState } from 'react';
import { COOKIE_CONSENT_EVENT, hasOptionalCookieConsent } from '@/lib/cookie-consent';

const TAWK_SCRIPT_ID = 'flipit-tawk-script';
const TAWK_SCRIPT_SRC = 'https://embed.tawk.to/685a9f8de9a67e1918b12e5c/1iuh4fdrf';

declare global {
  interface Window {
    Tawk_API?: {
      hideWidget?: () => void;
      showWidget?: () => void;
      onLoad?: () => void;
    };
    Tawk_LoadStart?: Date;
  }
}

export default function TawkChat() {
  const [canLoad, setCanLoad] = useState(() => hasOptionalCookieConsent());

  useEffect(() => {
    const handleConsentAccepted = () => setCanLoad(true);
    window.addEventListener(COOKIE_CONSENT_EVENT, handleConsentAccepted);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, handleConsentAccepted);
  }, []);

  useEffect(() => {
    if (!canLoad || document.getElementById(TAWK_SCRIPT_ID)) {
      return;
    }

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    const script = document.createElement('script');
    script.id = TAWK_SCRIPT_ID;
    script.async = true;
    script.src = TAWK_SCRIPT_SRC;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');
    document.body.appendChild(script);
  }, [canLoad]);

  return null;
}
