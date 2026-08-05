const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('navbar exposes mobile menu and current-page state accessibly', () => {
  const source = read('src/components/Navbar.tsx');

  assert.match(source, /aria-expanded=\{isOpen\}/);
  assert.match(source, /aria-controls="mobile-navigation"/);
  assert.match(source, /aria-current=\{active \? 'page' : undefined\}/);
  assert.match(source, /<DropdownMenuItem asChild key=\{item\.name\}>/);
  assert.match(source, /min-h-11/);
});

test('navbar and footer retain the colorful landing-era brand treatment', () => {
  const navbar = read('src/components/Navbar.tsx');
  const footer = read('src/components/Footer.tsx');

  assert.match(navbar, /from-cyan-400 to-fuchsia-400/);
  assert.match(footer, /from-cyan-500 to-fuchsia-500/);
  assert.match(footer, />\s*FI\s*</);
  assert.match(footer, /Neon gradient blobs/);
});

test('footer navigation landmarks are labelled with localized headings', () => {
  const footer = read('src/components/Footer.tsx');

  assert.match(footer, /aria-label=\{t\.productTitle\}/);
  assert.match(footer, /aria-label=\{t\.tutorialsTitle\}/);
  assert.match(footer, /aria-label=\{t\.supportTitle\}/);
});
