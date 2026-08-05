const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('high-use logged-in surfaces retain the original colorful workspace treatment', () => {
  const dashboard = read('src/pages/UserItemsPage.tsx');
  const connections = read('src/components/ConnectAccountCardCompact.tsx');
  const editor = read('src/components/listing-editor/ListingEditorCore.tsx');
  const detail = read('src/pages/ItemDetailPage.tsx');

  assert.match(dashboard, /group-hover:-translate-y/);
  assert.match(connections, /whileHover=/);
  assert.match(connections, /text-teal-/);
  assert.match(connections, /bg-slate-/);
  assert.match(editor, /text-fuchsia-/);
  assert.match(detail, /bg-neutral-950\/50/);
});

test('marketplace actions and listing disclosure retain accessible touch targets', () => {
  const connections = read('src/components/ConnectAccountCardCompact.tsx');
  const detailSections = read('src/components/listing-detail/ListingDetailSections.tsx');

  assert.match(connections, /min-h-11 px-3 py-2 text-xs/);
  assert.match(connections, /min-h-11 text-slate-200/);
  assert.match(detailSections, /min-h-11 w-full justify-between/);
});
