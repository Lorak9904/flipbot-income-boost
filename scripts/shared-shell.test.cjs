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

test('navbar and footer share the approved FlipIt wordmark', () => {
  const navbar = read('src/components/Navbar.tsx');
  const footer = read('src/components/Footer.tsx');
  const brand = read('src/components/BrandLink.tsx');

  assert.match(navbar, /<BrandLink to=\{localized\('\/'\)\} \/>/);
  assert.match(footer, /<BrandLink to=\{getLocalized\('\/'\)\}/);
  assert.match(brand, /from-cyan-400 via-sky-300 to-fuchsia-400/);
  assert.doesNotMatch(footer, />\s*FI\s*</);
  assert.doesNotMatch(footer, /gradient blobs/i);
});

test('footer navigation landmarks are labelled with localized headings', () => {
  const footer = read('src/components/Footer.tsx');

  assert.match(footer, /aria-label=\{t\.productTitle\}/);
  assert.match(footer, /aria-label=\{t\.tutorialsTitle\}/);
  assert.match(footer, /aria-label=\{t\.supportTitle\}/);
});
