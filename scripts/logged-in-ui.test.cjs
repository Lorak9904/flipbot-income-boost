const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('high-use logged-in surfaces share the restrained workspace treatment', () => {
  const dashboard = read('src/pages/UserItemsPage.tsx');
  const connections = read('src/components/ConnectAccountCardCompact.tsx');
  const editor = read('src/components/listing-editor/ListingEditorCore.tsx');
  const detail = read('src/pages/ItemDetailPage.tsx');

  for (const source of [dashboard, connections, editor, detail]) {
    assert.match(source, /border-neutral-800/);
    assert.match(source, /bg-neutral-900\/55/);
  }

  assert.doesNotMatch(dashboard, /group-hover:-translate-y/);
  assert.doesNotMatch(connections, /whileHover=|text-teal-|bg-slate-|border-slate-/);
  assert.doesNotMatch(editor, /text-fuchsia-|hover:ring-fuchsia/);
});

test('marketplace actions and listing disclosure retain accessible touch targets', () => {
  const connections = read('src/components/ConnectAccountCardCompact.tsx');
  const detailSections = read('src/components/listing-detail/ListingDetailSections.tsx');

  assert.match(connections, /min-h-11 px-3 py-2 text-xs/);
  assert.match(connections, /min-h-11 cursor-pointer text-neutral-200/);
  assert.match(detailSections, /min-h-11 w-full justify-between/);
});
