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
  posthog.set_config({ advanced_disable_feature_flags: false });
  posthog.persistence?.set_disabled(false);
  posthog.sessionPersistence?.set_disabled(false);
  posthog.opt_in_capturing({ captureEventName: false });
  posthog.startSessionRecording();
  posthog.reloadFeatureFlags();
  setOptionalAnalyticsReady(true);
}

const isPostHogStorageKey = (key: string) =>
  key.startsWith('ph_') || key.startsWith('__ph') || key.toLowerCase().includes('posthog');
const isPostHogConsentMarker = (key: string) => key.startsWith('__ph_opt_in_out_');

export function clearStoredPostHogState(): void {
  for (const storage of [window.localStorage, window.sessionStorage]) {
    for (let index = storage.length - 1; index >= 0; index -= 1) {
      const key = storage.key(index);
      if (key && isPostHogStorageKey(key) && !isPostHogConsentMarker(key)) storage.removeItem(key);
    }
  }

  for (const cookie of document.cookie.split(';')) {
    const name = cookie.split('=', 1)[0]?.trim();
    if (!name || !isPostHogStorageKey(name) || isPostHogConsentMarker(name)) continue;
    document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
    if (window.location.hostname.endsWith('myflipit.live')) {
      document.cookie = `${name}=; path=/; domain=.myflipit.live; max-age=0; SameSite=Lax`;
    }
  }
}

export function stopOptionalAnalytics(): void {
  setOptionalAnalyticsReady(false);

  try { posthog.stopSessionRecording(); } catch { /* Continue teardown. */ }
  try { posthog.set_config({ advanced_disable_feature_flags: true }); } catch { /* Continue teardown. */ }
  try { posthog.reset(true); } catch { /* Continue teardown. */ }
  try { clearStoredPostHogState(); } catch { /* Continue to the guaranteed opt-out. */ }

  // Write the denial marker last. Nothing after this call clears PostHog
  // storage, so the mounted client remains opted out until explicit consent.
  try { posthog.opt_out_capturing(); } catch { /* Analytics must remain fail-open. */ }
}
