const assert = require('node:assert/strict');
const test = require('node:test');

const resultModule = import('../src/lib/facebook-publish-result.js');

test('Facebook success requires a matching durable listing ID and URL', async () => {
  const { isProvenPublishSuccess } = await resultModule;

  assert.equal(
    isProvenPublishSuccess('facebook', 'success', {
      external_id: '123456789',
      listing_url: 'https://www.facebook.com/marketplace/item/123456789',
    }),
    true,
  );
  assert.equal(
    isProvenPublishSuccess('facebook', 'success', {
      external_id: 'fb_listing_id',
      listing_url: 'https://www.facebook.com/marketplace/item/...',
    }),
    false,
  );
  assert.equal(isProvenPublishSuccess('facebook', 'success', undefined), false);
});

test('failed and unknown Facebook outcomes never become publish success', async () => {
  const { isProvenPublishSuccess } = await resultModule;

  assert.equal(isProvenPublishSuccess('facebook', 'error', undefined), false);
  assert.equal(isProvenPublishSuccess('facebook', 'pending', undefined), false);
});

test('Facebook identity rejects noncanonical Marketplace URLs', async () => {
  const { isProvenPublishSuccess } = await resultModule;
  const noncanonicalUrls = [
    'https://www.facebook.com/marketplace/item/123456789/',
    'https://www.facebook.com/marketplace/item/123456789?tracking=1',
    'https://www.facebook.com/marketplace/item/123456789#details',
    'https://user@www.facebook.com/marketplace/item/123456789',
    'https://www.facebook.com:8443/marketplace/item/123456789',
  ];

  for (const listingUrl of noncanonicalUrls) {
    assert.equal(
      isProvenPublishSuccess('facebook', 'success', {
        external_id: '123456789',
        listing_url: listingUrl,
      }),
      false,
      listingUrl,
    );
  }
});

test('other marketplaces preserve the existing status contract', async () => {
  const { isProvenPublishSuccess } = await resultModule;

  assert.equal(isProvenPublishSuccess('olx', 'success', undefined), true);
  assert.equal(isProvenPublishSuccess('olx', 'error', undefined), false);
});
