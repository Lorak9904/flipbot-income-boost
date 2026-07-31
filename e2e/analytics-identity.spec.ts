import { expect, test } from '@playwright/test';

import {
  EMPTY_ACCOUNT_IDENTITY,
  canonicalAccountId,
  syncPostHogAccount,
  type AccountIdentityClient,
} from '../src/lib/analytics/account-identity';
import {
  normalizeAnalyticsPath,
  sanitizePostHogEvent,
} from '../src/lib/analytics/route-privacy';

class FakePostHog implements AccountIdentityClient {
  persistedId: string | null;
  identifies: Array<{ id: string; properties: Record<string, unknown> }> = [];
  resets = 0;
  identifyError = false;
  resetError = false;

  constructor(persistedId: string | null = null) {
    this.persistedId = persistedId;
  }

  get_property() {
    return this.persistedId;
  }

  identify(id: string, properties: Record<string, unknown>) {
    if (this.identifyError) throw new Error('unavailable');
    this.identifies.push({ id, properties });
    this.persistedId = id;
  }

  reset() {
    if (this.resetError) throw new Error('unavailable');
    this.resets += 1;
    this.persistedId = null;
  }
}

const account = {
  id: 42,
  name: 'Consent Name',
  email: 'consented@example.com',
  provider: 'email',
  language: 'en',
};

test('identifies a consented account with the canonical backend-compatible ID', () => {
  const client = new FakePostHog();
  const state = syncPostHogAccount(client, EMPTY_ACCOUNT_IDENTITY, {
    canIdentify: true,
    isLoading: false,
    user: account,
    interfaceLanguage: 'en',
  });

  expect(canonicalAccountId(account.id)).toBe('42');
  expect(state.accountId).toBe('42');
  expect(client.identifies).toHaveLength(1);
  expect(client.identifies[0]).toEqual({
    id: '42',
    properties: {
      $name: 'FlipIt account 42',
      account_state: 'active',
      login_provider: 'email',
      language: 'en',
      interface_language: 'en',
    },
  });
});

test('does not identify without consent and clears stale identities on logout or cold boot', () => {
  const noConsentClient = new FakePostHog('42');
  const noConsentState = syncPostHogAccount(noConsentClient, EMPTY_ACCOUNT_IDENTITY, {
    canIdentify: false,
    isLoading: false,
    user: account,
    interfaceLanguage: 'en',
  });
  expect(noConsentClient.identifies).toHaveLength(0);
  expect(noConsentClient.resets).toBe(1);
  expect(noConsentState).toEqual(EMPTY_ACCOUNT_IDENTITY);

  const coldBootClient = new FakePostHog('42');
  syncPostHogAccount(coldBootClient, EMPTY_ACCOUNT_IDENTITY, {
    canIdentify: true,
    isLoading: false,
    user: null,
    interfaceLanguage: 'en',
  });
  expect(coldBootClient.resets).toBe(1);
});

test('resets before account switching and refreshes changed profile properties', () => {
  const client = new FakePostHog('42');
  const priorState = {
    accountId: '42',
    profileSignature: JSON.stringify({
      $name: 'FlipIt account 42',
      account_state: 'active',
      login_provider: account.provider,
      language: account.language,
      interface_language: 'en',
    }),
  };

  const switchedState = syncPostHogAccount(client, priorState, {
    canIdentify: true,
    isLoading: false,
    user: { ...account, id: 43 },
    interfaceLanguage: 'en',
  });
  expect(client.resets).toBe(1);
  expect(client.identifies[client.identifies.length - 1]?.id).toBe('43');

  syncPostHogAccount(client, switchedState, {
    canIdentify: true,
    isLoading: false,
    user: { ...account, id: 43, language: 'pl' },
    interfaceLanguage: 'en',
  });
  expect(client.identifies[client.identifies.length - 1]?.properties.language).toBe('pl');
  expect(client.identifies).toHaveLength(2);
});

test('person properties remain pseudonymous and omit unsupported optional values', () => {
  const client = new FakePostHog();
  syncPostHogAccount(client, EMPTY_ACCOUNT_IDENTITY, {
    canIdentify: true,
    isLoading: false,
    user: {
      ...account,
      provider: 'custom-provider',
      language: 'unexpected',
    },
    interfaceLanguage: 'en',
  });

  expect(client.identifies[0]?.properties).toEqual({
    $name: 'FlipIt account 42',
    account_state: 'active',
    interface_language: 'en',
  });
  expect(client.identifies[0]?.properties).not.toHaveProperty('email');
  expect(client.identifies[0]?.properties).not.toHaveProperty('name');
});

test('analytics failures remain isolated from account behavior', () => {
  const identifyFailure = new FakePostHog();
  identifyFailure.identifyError = true;
  expect(() => syncPostHogAccount(identifyFailure, EMPTY_ACCOUNT_IDENTITY, {
    canIdentify: true,
    isLoading: false,
    user: account,
    interfaceLanguage: 'en',
  })).not.toThrow();

  const resetFailure = new FakePostHog('42');
  resetFailure.resetError = true;
  expect(() => syncPostHogAccount(resetFailure, EMPTY_ACCOUNT_IDENTITY, {
    canIdentify: true,
    isLoading: false,
    user: null,
    interfaceLanguage: 'en',
  })).not.toThrow();
});

test('listing routes and PostHog URLs never retain item IDs or query strings', () => {
  for (const path of [
    '/user/items/2bf44fb4-62b3-4c33-850a-e62ec9e01e0a?token=private',
    '/user/items/2bf44fb4-62b3-4c33-850a-e62ec9e01e0a/edit',
    '/pl/moje-ogloszenia/2bf44fb4-62b3-4c33-850a-e62ec9e01e0a/edytuj',
  ]) {
    expect(normalizeAnalyticsPath(path)).toBe('/user/items/:item_id');
  }

  const event = sanitizePostHogEvent({
    event: '$pageview',
    properties: {
      $current_url: 'https://myflipit.live/user/items/private-id?token=private',
      $pathname: '/user/items/private-id',
    },
  });
  expect(event.event).toBe('$pageview');
  expect(event.properties.$current_url).toBe('https://myflipit.live/user/items/:item_id');
  expect(event.properties.$pathname).toBe('/user/items/:item_id');
});
