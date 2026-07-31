const FACEBOOK_LISTING_PATH = /^\/marketplace\/item\/(\d+)\/?$/;

export function isProvenFacebookPublishResult(detail) {
  const externalId = String(detail?.external_id ?? '').trim();
  if (!/^\d+$/.test(externalId) || typeof detail?.listing_url !== 'string') {
    return false;
  }

  try {
    const url = new URL(detail.listing_url);
    const match = url.pathname.match(FACEBOOK_LISTING_PATH);
    return (
      url.protocol === 'https:' &&
      (url.hostname === 'facebook.com' || url.hostname === 'www.facebook.com') &&
      match?.[1] === externalId
    );
  } catch {
    return false;
  }
}

export function isProvenPublishSuccess(platform, status, detail) {
  if (status !== 'success') {
    return false;
  }
  return platform !== 'facebook' || isProvenFacebookPublishResult(detail);
}
