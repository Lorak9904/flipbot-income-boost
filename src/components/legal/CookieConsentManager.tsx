import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { getCurrentLanguage } from '@/components/language-utils';
import {
  COOKIE_CONSENT_CHOICE_EVENT,
  hasOptionalCookieConsent,
  persistCookieConsentChoice,
  type CookieConsentEvent,
} from '@/lib/cookie-consent';

export function CookieConsentManager() {
  const language = getCurrentLanguage();
  const [optionalEnabled, setOptionalEnabled] = useState(hasOptionalCookieConsent);

  useEffect(() => {
    const handleChoice = (event: Event) => {
      setOptionalEnabled((event as CookieConsentEvent).detail.choice === 'accepted');
    };
    window.addEventListener(COOKIE_CONSENT_CHOICE_EVENT, handleChoice);
    return () => window.removeEventListener(COOKIE_CONSENT_CHOICE_EVENT, handleChoice);
  }, []);

  return (
    <section className="mt-6 rounded-2xl border border-white/10 bg-neutral-950/85 p-6" aria-labelledby="cookie-preferences-title">
      <h2 id="cookie-preferences-title" className="text-xl font-semibold text-white">
        {language === 'pl' ? 'Ustawienia opcjonalnych technologii' : 'Optional technology settings'}
      </h2>
      <p className="mt-3 text-sm leading-6 text-neutral-300">
        {language === 'pl'
          ? `Opcjonalna analityka, nagrania sesji i czat są obecnie ${optionalEnabled ? 'włączone' : 'wyłączone'}. Zmiana działa od razu.`
          : `Optional analytics, session replay, and chat are currently ${optionalEnabled ? 'enabled' : 'disabled'}. Changes take effect immediately.`}
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Button type="button" onClick={() => persistCookieConsentChoice('accepted')} disabled={optionalEnabled}>
          {language === 'pl' ? 'Włącz opcjonalne' : 'Allow optional'}
        </Button>
        <Button type="button" variant="outline" onClick={() => persistCookieConsentChoice('essential')} disabled={!optionalEnabled}>
          {language === 'pl' ? 'Wycofaj zgodę opcjonalną' : 'Withdraw optional consent'}
        </Button>
      </div>
    </section>
  );
}
