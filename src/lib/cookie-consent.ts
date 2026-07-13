export const COOKIE_CONSENT_KEY = 'flipit_cookie_consent';
export const COOKIE_CONSENT_EVENT = 'flipit-cookie-consent-accepted';
export const COOKIE_CONSENT_CHOICE_EVENT = 'flipit-cookie-consent-choice';

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
  window.dispatchEvent(new Event(COOKIE_CONSENT_EVENT));
}

export function notifyCookieConsentChoice(): void {
  window.dispatchEvent(new Event(COOKIE_CONSENT_CHOICE_EVENT));
}
