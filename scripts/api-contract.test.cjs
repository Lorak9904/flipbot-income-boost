const assert = require('node:assert/strict');
const { existsSync, readFileSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');

const root = join(__dirname, '..');
const read = (relativePath) => readFileSync(join(root, relativePath), 'utf8');

test('owned API clients use the canonical trailing-slash routes', () => {
  const expectedRoutes = new Map([
    ['src/contexts/AuthContext.tsx', [
      '/api/auth/refresh/',
      '/api/auth/user/',
      '/api/auth/login/email/',
      '/api/auth/register/',
    ]],
    ['src/components/LoginWithGmail.tsx', ['/api/auth/login/google/']],
    ['src/components/ConnectPlatformModal.tsx', ['/api/manual-connect/']],
    ['src/components/ImageUploader.tsx', ['/api/get-presigned-url/']],
    ['src/components/AddItemForm.tsx', ['/api/items/propose/']],
    ['src/lib/api/items.ts', ['/items/publish/']],
  ]);

  for (const [relativePath, routes] of expectedRoutes) {
    const source = read(relativePath);
    for (const route of routes) {
      assert.ok(source.includes(route), `${relativePath} must call ${route}`);
      assert.doesNotMatch(
        source,
        new RegExp(`${route.slice(0, -1).replaceAll('/', '\\/')}([\"'\x60])`),
        `${relativePath} must not call the non-canonical ${route.slice(0, -1)}`,
      );
    }
  }
});

test('the nonexistent generic provider login contract is removed', () => {
  const authContext = read('src/contexts/AuthContext.tsx');

  assert.doesNotMatch(authContext, /loginWithProvider/);
  assert.doesNotMatch(authContext, /\/api\/auth\/login["'\x60]/);
});

test('auth user identifiers accept backend string and numeric values', () => {
  assert.match(read('src/contexts/AuthContext.tsx'), /id:\s*string\s*\|\s*number;/);
  assert.match(
    read('src/lib/analytics/activation.ts'),
    /userId:\s*string\s*\|\s*number\s*\|\s*undefined/,
  );
});

test('unreachable legacy marketplace clients and components are removed', () => {
  for (const relativePath of [
    'src/pages/ConnectOlxButton.tsx',
    'src/pages/OlxSuccessPage.tsx',
    'src/hooks/olx-api.ts',
    'src/components/ConnectAccountCard.tsx',
  ]) {
    assert.equal(existsSync(join(root, relativePath)), false, `${relativePath} should not exist`);
  }

  const app = read('src/App.tsx');
  assert.doesNotMatch(app, /ConnectOlxButton|OlxSuccessPage/);
});

test('legacy toast compatibility remains backed by Sonner', () => {
  assert.match(read('src/hooks/use-toast.ts'), /@\/lib\/notifications/);
  assert.match(read('src/lib/notifications.tsx'), /from 'sonner'/);
});

test('OLX editor-generated publish payload preserves provider selections', () => {
  const form = read('src/components/ReviewItemForm.tsx');
  const api = read('src/lib/api/olx.ts');
  const types = read('src/types/item.ts');
  const locationFields = read('src/components/review-item/OlxLocationFields.tsx');

  assert.match(api, /\/olx\/locations\/cities\//);
  assert.match(api, /\/districts\//);
  assert.match(types, /location\?:\s*\{/);
  assert.match(types, /ad_delivery\?:\s*\{/);
  assert.match(types, /_replace\?:\s*true;/);
  assert.match(form, /nextOlxOverrides\._replace\s*=\s*true;/);
  assert.match(form, /platformOverrides\.olx\?\._replace\s*===\s*true/);
  assert.match(form, /overrides\.olx\._replace\s*=\s*true;/);
  assert.match(form, /overrides\.olx\.location\s*=\s*\{\s*\.\.\.olxLocation\s*\}/);
  assert.match(form, /overrides\.olx\.ad_delivery\s*=/);
  assert.match(form, /delivery_package_ids:\s*\[\.\.\.olxDelivery\.delivery_package_ids\]/);
  assert.match(locationFields, /A district is required for this city\./);
  assert.match(locationFields, /aria-activedescendant/);
  assert.match(locationFields, /setDistrictRetryKey/);
  assert.match(locationFields, /Try again/);
  assert.doesNotMatch(locationFields, /connect-accounts/);
});
