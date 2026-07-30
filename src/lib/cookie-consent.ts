export const COOKIE_CONSENT_KEY = 'flipit_cookie_consent';
export const COOKIE_CONSENT_EVENT = 'flipit-cookie-consent-accepted';
export const COOKIE_CONSENT_CHOICE_EVENT = 'flipit-cookie-consent-choice';
export type CookieConsentChoice = 'accepted' | 'essential';

export type CookieConsentEvent = CustomEvent<{ choice: CookieConsentChoice }>;

export function hasCookieConsentChoice(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return Boolean(window.localStorage.getItem(COOKIE_CONSENT_KEY));
}

export function hasOptionalCookieConsent(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.localStorage.getItem(COOKIE_CONSENT_KEY) === 'accepted';
}

export function notifyOptionalCookieConsentAccepted(): void {
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: { choice: 'accepted' } }));
}

export function notifyCookieConsentChoice(choice: CookieConsentChoice): void {
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_CHOICE_EVENT, { detail: { choice } }));
}

export function persistCookieConsentChoice(choice: CookieConsentChoice): void {
  const visitorId = window.localStorage.getItem('visitor_id');
  const lang = document.documentElement.lang === 'pl' ? 'pl' : 'en';

  window.localStorage.setItem(COOKIE_CONSENT_KEY, choice);
  window.localStorage.setItem('lang', lang);
  document.cookie = `lang=${lang}; path=/; max-age=31536000; SameSite=Lax`;

  let activeVisitorId = visitorId;
  if (choice === 'accepted' && !activeVisitorId) {
    activeVisitorId = crypto.randomUUID();
    window.localStorage.setItem('visitor_id', activeVisitorId);
    document.cookie = `visitor_id=${activeVisitorId}; path=/; max-age=31536000; SameSite=Lax`;
  }

  if (choice === 'essential') {
    window.localStorage.removeItem('visitor_id');
    document.cookie = 'visitor_id=; path=/; max-age=0; SameSite=Lax';
  }

  void fetch('/api/cookies/consent/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ consent: choice === 'accepted', lang, visitor_id: activeVisitorId }),
  }).catch(() => undefined);

  if (choice === 'accepted') notifyOptionalCookieConsentAccepted();
  notifyCookieConsentChoice(choice);
}
