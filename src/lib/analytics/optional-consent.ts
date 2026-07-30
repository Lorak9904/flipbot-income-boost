import posthog from 'posthog-js';

export const OPTIONAL_ANALYTICS_READY_EVENT = 'flipit-optional-analytics-ready';
let optionalAnalyticsReady = false;

export const isOptionalAnalyticsReady = () => optionalAnalyticsReady;

export function setOptionalAnalyticsReady(ready: boolean): void {
  optionalAnalyticsReady = ready;
  window.dispatchEvent(new Event(OPTIONAL_ANALYTICS_READY_EVENT));
}

export function resumeOptionalAnalytics(): void {
  if (!posthog.__loaded) return;
  posthog.persistence?.set_disabled(false);
  posthog.sessionPersistence?.set_disabled(false);
  posthog.opt_in_capturing({ captureEventName: false });
  setOptionalAnalyticsReady(true);
}

const isPostHogStorageKey = (key: string) =>
  key.startsWith('ph_') || key.startsWith('__ph') || key.toLowerCase().includes('posthog');

export function clearStoredPostHogState(): void {
  for (const storage of [window.localStorage, window.sessionStorage]) {
    for (let index = storage.length - 1; index >= 0; index -= 1) {
      const key = storage.key(index);
      if (key && isPostHogStorageKey(key)) storage.removeItem(key);
    }
  }

  for (const cookie of document.cookie.split(';')) {
    const name = cookie.split('=', 1)[0]?.trim();
    if (!name || !isPostHogStorageKey(name)) continue;
    document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
    if (window.location.hostname.endsWith('myflipit.live')) {
      document.cookie = `${name}=; path=/; domain=.myflipit.live; max-age=0; SameSite=Lax`;
    }
  }
}

export function stopOptionalAnalytics(): void {
  setOptionalAnalyticsReady(false);
  try {
    posthog.stopSessionRecording();
    posthog.reset(true);
    posthog.opt_out_capturing();
    posthog.persistence?.set_disabled(true);
    posthog.sessionPersistence?.set_disabled(true);
  } catch {
    // Analytics must never block the consent choice.
  } finally {
    clearStoredPostHogState();
    window.setTimeout(clearStoredPostHogState, 0);
  }
}
