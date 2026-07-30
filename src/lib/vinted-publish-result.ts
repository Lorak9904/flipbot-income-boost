const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const hasVerificationMetadata = (value: unknown): boolean =>
  isRecord(value) &&
  (value.error_code === 'vinted_verification_required' ||
    value.action_required === 'verify_vinted_session');

/** Detect Vinted recovery only from backend machine fields, never provider prose. */
export const isVintedVerificationRequired = (value: unknown): boolean => {
  if (!isRecord(value)) return false;
  if (typeof value.platform === 'string' && value.platform !== 'vinted') return false;
  if (hasVerificationMetadata(value) || hasVerificationMetadata(value.response)) return true;

  const platformDetails = value.platform_details;
  return isRecord(platformDetails) && hasVerificationMetadata(platformDetails.vinted);
};
