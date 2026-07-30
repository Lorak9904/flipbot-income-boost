import { useEffect, useState } from 'react';
import {
  COOKIE_CONSENT_CHOICE_EVENT,
  hasOptionalCookieConsent,
  type CookieConsentEvent,
} from '@/lib/cookie-consent';

const TAWK_SCRIPT_ID = 'flipit-tawk-script';
const TAWK_SCRIPT_SRC = 'https://embed.tawk.to/685a9f8de9a67e1918b12e5c/1iuh4fdrf';

const clearTawkStorage = () => {
  for (const storage of [window.localStorage, window.sessionStorage]) {
    for (let index = storage.length - 1; index >= 0; index -= 1) {
      const key = storage.key(index);
      if (key?.startsWith('twk_')) storage.removeItem(key);
    }
  }
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.split('=', 1)[0]?.trim();
    if (name?.startsWith('twk_')) document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
  }
};

const removeTawkArtifacts = () => {
  document.getElementById(TAWK_SCRIPT_ID)?.remove();
  document.querySelectorAll('iframe[src*="tawk.to"], script[src*="tawk.to"]').forEach((node) => node.remove());
  clearTawkStorage();
};

declare global {
  interface Window {
    Tawk_API?: {
      hideWidget?: () => void;
      showWidget?: () => void;
      onLoad?: () => void;
      shutdown?: () => void;
    };
    Tawk_LoadStart?: Date;
  }
}

export default function TawkChat() {
  const [canLoad, setCanLoad] = useState(() => hasOptionalCookieConsent());

  useEffect(() => {
    const handleConsentChoice = (event: Event) => {
      const accepted = (event as CookieConsentEvent).detail.choice === 'accepted';
      if (!accepted) {
        try {
          window.Tawk_API?.shutdown?.();
          window.Tawk_API?.hideWidget?.();
        } catch {
          // Optional support tooling must not block consent withdrawal.
        }
        removeTawkArtifacts();
        window.setTimeout(removeTawkArtifacts, 0);
        window.setTimeout(removeTawkArtifacts, 250);
        delete window.Tawk_API;
        delete window.Tawk_LoadStart;
      }
      setCanLoad(accepted);
    };
    window.addEventListener(COOKIE_CONSENT_CHOICE_EVENT, handleConsentChoice);
    return () => window.removeEventListener(COOKIE_CONSENT_CHOICE_EVENT, handleConsentChoice);
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
