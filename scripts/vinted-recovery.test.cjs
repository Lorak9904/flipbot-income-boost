const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const Module = require('node:module');
const { join } = require('node:path');
const test = require('node:test');
const ts = require('typescript');

const root = join(__dirname, '..');
const read = (relativePath) => readFileSync(join(root, relativePath), 'utf8');

const loadTypeScriptModule = (relativePath) => {
  const filename = join(root, relativePath);
  const output = ts.transpileModule(read(relativePath), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: filename,
  }).outputText;
  const loaded = new Module(filename, module);
  loaded.filename = filename;
  loaded.paths = module.paths;
  loaded._compile(output, filename);
  return loaded.exports;
};

test('canonical metadata detects Vinted verification without parsing prose', () => {
  const { isVintedVerificationRequired } = loadTypeScriptModule(
    'src/lib/vinted-publish-result.ts',
  );

  assert.equal(
    isVintedVerificationRequired({ error_code: 'vinted_verification_required' }),
    true,
  );
  assert.equal(
    isVintedVerificationRequired({ action_required: 'verify_vinted_session' }),
    true,
  );
  assert.equal(
    isVintedVerificationRequired({
      platform: 'vinted',
      response: { action_required: 'verify_vinted_session' },
    }),
    true,
  );
  assert.equal(
    isVintedVerificationRequired({
      platform_details: {
        vinted: { error_code: 'vinted_verification_required' },
      },
    }),
    true,
  );
  assert.equal(
    isVintedVerificationRequired({
      platform: 'ebay',
      action_required: 'verify_vinted_session',
    }),
    false,
  );
  assert.equal(
    isVintedVerificationRequired({ message: 'CAPTCHA DataDome challenge' }),
    false,
  );
});

test('verification-required refresh keeps the modal open and skips success callback', () => {
  const source = read('src/components/ConnectAccountCardCompact.tsx');
  const start = source.indexOf('if (isVintedVerificationRequired(refreshResult))');
  const end = source.indexOf("if (response.ok && refreshResult?.connected", start);
  const verificationBranch = source.slice(start, end);

  assert.ok(start >= 0 && end > start);
  assert.match(verificationBranch, /notify\.warning/);
  assert.match(verificationBranch, /setShowConnectModal\(true\)/);
  assert.doesNotMatch(verificationBranch, /onConnected/);

  const verifiedStart = source.indexOf(
    "if (statusResponse.ok && statusResult?.connected && statusResult?.status === 'valid')",
  );
  const verifiedEnd = source.indexOf('if (statusResponse.status === 401', verifiedStart);
  assert.match(
    source.slice(verifiedStart, verifiedEnd),
    /await onConnected\?\.\(\{ verified: true \}\)/,
  );
});

test('reconnect route opens Vinted modal and navigates back only after verified callback', () => {
  const page = read('src/pages/ConnectAccountsPage.tsx');

  assert.match(page, /openConnectOnMount=\{requestedReconnect === 'vinted'\}/);
  assert.match(page, /onConnected=\{\(outcome\) => handleAccountConnected\('vinted', outcome\)\}/);
  assert.match(page, /if \(platform === 'vinted' && outcome\?\.verified && safeReturnTo\)/);
  assert.match(page, /navigate\(safeReturnTo, \{ replace: true \}\)/);

  const card = read('src/components/ConnectAccountCardCompact.tsx');
  assert.match(card, /onConnected\(\{ verified: false \}\)/);
  assert.match(card, /onConnected\(\{ verified: true \}\)/);
});

test('early publish 403 uses canonical recovery metadata and warning notification', () => {
  const source = read('src/components/ReviewItemForm.tsx');

  assert.match(source, /response\.status === 403/);
  assert.match(source, /isVintedVerificationRequired\(error\?\.data\)/);
  assert.match(source, /notify\.warning\(t\.toast\.vintedVerificationTitle/);
});

test('publish form navigates only when the canonical envelope has a successful platform', () => {
  const source = read('src/components/ReviewItemForm.tsx');
  const navigationGate = source.indexOf('if (successfulPlatforms.length > 0) {', source.indexOf('queryClient.invalidateQueries'));
  const navigation = source.indexOf('navigateAfterCompletion(', navigationGate);

  assert.ok(navigationGate >= 0);
  assert.ok(navigation > navigationGate);
});

test('listing recovery retry targets only Vinted and uses review-and-retry copy', () => {
  const panel = read('src/components/listing-detail/ListingDetailSections.tsx');
  const translations = read('src/utils/translations/item-detail-translations.ts');

  assert.match(panel, /publishPlatform: 'vinted'/);
  assert.match(translations, /retryVintedPublishing: "Review and retry"/);
  assert.match(translations, /retryVintedPublishing: "Sprawdź i spróbuj ponownie"/);
  assert.match(translations, /Your FlipIt draft was kept/);
  assert.doesNotMatch(translations, /Your FlipIt listing is safe/);
});
