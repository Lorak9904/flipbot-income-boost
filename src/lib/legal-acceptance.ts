export const CURRENT_TERMS_VERSION = '2026-06-28';
export const CURRENT_PRIVACY_NOTICE_VERSION = '2026-07-21';

export type LegalAcceptance = {
  accepted: true;
  terms_version: typeof CURRENT_TERMS_VERSION;
  privacy_notice_version: typeof CURRENT_PRIVACY_NOTICE_VERSION;
};

export const currentLegalAcceptance = (): LegalAcceptance => ({
  accepted: true,
  terms_version: CURRENT_TERMS_VERSION,
  privacy_notice_version: CURRENT_PRIVACY_NOTICE_VERSION,
});

export const buildGoogleLoginPayload = (credential: string, signupMode: boolean) => ({
  credential,
  ...(signupMode ? { legal_acceptance: currentLegalAcceptance() } : {}),
});

export class AuthApiError extends Error {
  constructor(public readonly code: string) {
    super(code);
    this.name = 'AuthApiError';
  }
}

export const getAuthErrorCode = (payload: unknown): string | null => {
  if (!payload || typeof payload !== 'object') return null;
  const record = payload as Record<string, unknown>;
  if (typeof record.code === 'string') return record.code;
  if (record.error && typeof record.error === 'object') {
    const nestedCode = (record.error as Record<string, unknown>).code;
    return typeof nestedCode === 'string' ? nestedCode : null;
  }
  return null;
};
