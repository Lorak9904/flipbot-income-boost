import { useEffect, useRef, useState } from 'react';
import {
  COOKIE_CONSENT_CHOICE_EVENT,
  hasOptionalCookieConsent,
  type CookieConsentEvent,
} from '@/lib/cookie-consent';

const TAWK_SCRIPT_ID = 'flipit-tawk-script';
const TAWK_SCRIPT_SRC = 'https://embed.tawk.to/685a9f8de9a67e1918b12e5c/1iuh4fdrf';

const isTawkArtifactName = (name: string) => {
  const normalizedName = name.toLowerCase();
  return normalizedName.startsWith('twk_')
    || normalizedName.startsWith('tawk_uuid_')
    || normalizedName === 'tawkconnectiontime';
};

const expireTawkCookie = (name: string) => {
  const expiry = `${name}=; path=/; max-age=0; SameSite=Lax`;
  document.cookie = expiry;

  const hostname = window.location.hostname;
  const domainVariants = new Set([hostname, `.${hostname}`]);
  const hostnameParts = hostname.split('.');
  if (hostnameParts.length > 2 && !hostname.includes(':')) {
    const parentDomain = hostnameParts.slice(1).join('.');
    domainVariants.add(parentDomain);
    domainVariants.add(`.${parentDomain}`);
  }

  for (const domain of domainVariants) {
    document.cookie = `${expiry}; domain=${domain}`;
  }
};

const clearTawkStorage = () => {
  for (const storage of [window.localStorage, window.sessionStorage]) {
    for (let index = storage.length - 1; index >= 0; index -= 1) {
      const key = storage.key(index);
      if (key && isTawkArtifactName(key)) storage.removeItem(key);
    }
  }
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.split('=', 1)[0]?.trim();
    if (name && isTawkArtifactName(name)) expireTawkCookie(name);
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
  const loadGeneration = useRef(0);

  useEffect(() => {
    const handleConsentChoice = (event: Event) => {
      const accepted = (event as CookieConsentEvent).detail.choice === 'accepted';
      if (!accepted) {
        loadGeneration.current += 1;
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
    const generation = ++loadGeneration.current;
    script.id = TAWK_SCRIPT_ID;
    script.async = true;
    script.src = TAWK_SCRIPT_SRC;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');
    script.onload = () => {
      if (generation !== loadGeneration.current || !hasOptionalCookieConsent()) {
        removeTawkArtifacts();
        delete window.Tawk_API;
        delete window.Tawk_LoadStart;
      }
    };
    document.body.appendChild(script);

    return () => {
      if (hasOptionalCookieConsent()) {
        script.onload = null;
      } else {
        script.remove();
      }
    };
  }, [canLoad]);

  return null;
}
