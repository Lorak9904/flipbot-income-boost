export interface AnalyticsAccount {
  id: string | number;
  name?: string;
  email?: string;
  provider?: string;
  language?: string;
}

export interface AccountIdentityClient {
  get_property: (key: string) => unknown;
  identify: (distinctId: string, properties: Record<string, unknown>) => void;
  reset: () => void;
}

export interface AccountIdentityState {
  accountId: string | null;
  profileSignature: string | null;
}

export const EMPTY_ACCOUNT_IDENTITY: AccountIdentityState = {
  accountId: null,
  profileSignature: null,
};

export const canonicalAccountId = (id: string | number): string => String(id);

const currentAccountId = (
  client: AccountIdentityClient,
  previous: AccountIdentityState,
): string | null => {
  try {
    const persistedId = client.get_property('$user_id');
    return persistedId === undefined || persistedId === null || persistedId === ''
      ? previous.accountId
      : String(persistedId);
  } catch {
    return previous.accountId;
  }
};

export const syncPostHogAccount = (
  client: AccountIdentityClient,
  previous: AccountIdentityState,
  options: {
    canIdentify: boolean;
    isLoading: boolean;
    user: AnalyticsAccount | null;
    interfaceLanguage: string;
  },
): AccountIdentityState => {
  if (options.isLoading) return previous;

  const persistedAccountId = currentAccountId(client, previous);
  if (!options.canIdentify || !options.user?.id) {
    if (persistedAccountId) {
      try {
        client.reset();
      } catch {
        return previous;
      }
    }
    return EMPTY_ACCOUNT_IDENTITY;
  }

  const accountId = canonicalAccountId(options.user.id);
  if (persistedAccountId && persistedAccountId !== accountId) {
    try {
      client.reset();
    } catch {
      return previous;
    }
  }

  const properties = {
    email: options.user.email,
    name: options.user.name,
    login_provider: options.user.provider,
    language: options.user.language ?? options.interfaceLanguage,
    interface_language: options.interfaceLanguage,
  };
  const profileSignature = JSON.stringify(properties);

  if (persistedAccountId !== accountId || previous.profileSignature !== profileSignature) {
    try {
      client.identify(accountId, properties);
    } catch {
      return previous;
    }
  }

  return { accountId, profileSignature };
};
