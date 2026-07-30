#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const net = require('node:net');
const path = require('node:path');
const { after, before, test } = require('node:test');

const { createDistServer } = require('./serve-dist.cjs');
const metadata = require('../src/lib/seo-page-metadata.json');

const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const HOMEPAGE_HTML = fs.readFileSync(path.join(DIST_DIR, 'index.html'), 'utf8');
let baseUrl;
let server;

before(async () => {
  server = createDistServer({ distDir: DIST_DIR });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
});

async function request(urlPath) {
  const response = await fetch(`${baseUrl}${urlPath}`);
  return { response, body: await response.text() };
}

function rawRequest(payload) {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection(server.address().port, '127.0.0.1');
    let response = '';

    socket.setEncoding('utf8');
    socket.once('error', reject);
    socket.on('data', (chunk) => {
      response += chunk;
    });
    socket.once('end', () => resolve(response));
    socket.once('connect', () => socket.end(payload));
  });
}

function assertPublicPage(body, { title, canonical, language, alternate }) {
  assert.notEqual(body, HOMEPAGE_HTML, 'homepage HTML must not be used as a route fallback');
  assert.match(body, new RegExp(`<html lang="${language}">`, 'i'));
  assert.ok(body.includes(`<title>${title}</title>`), `expected title ${title}`);
  assert.ok(body.includes(`<link rel="canonical" href="${canonical}"`), `expected canonical ${canonical}`);
  assert.ok(body.includes(`hreflang="${alternate.language}" href="${alternate.url}"`));
  assert.doesNotMatch(body, /<meta name="robots" content="noindex/i);
  assert.match(body, /id="seo-prerender"/);
}

test('serves route-specific English and Polish public HTML', async () => {
  const pricing = await request('/pricing?source=raw-test');
  assert.equal(pricing.response.status, 200);
  assertPublicPage(pricing.body, {
    title: metadata.pricing.en.title,
    canonical: 'https://myflipit.live/pricing',
    language: 'en',
    alternate: { language: 'pl', url: 'https://myflipit.live/pl/cennik' },
  });

  const polish = await request('/pl/jak-to-dziala');
  assert.equal(polish.response.status, 200);
  assertPublicPage(polish.body, {
    title: metadata.howItWorks.pl.title,
    canonical: 'https://myflipit.live/pl/jak-to-dziala',
    language: 'pl',
    alternate: { language: 'en', url: 'https://myflipit.live/how-it-works' },
  });

  assert.notEqual(pricing.body, polish.body);
  assert.ok(!pricing.body.includes('<link rel="canonical" href="https://myflipit.live/"'));
  assert.ok(!polish.body.includes('<link rel="canonical" href="https://myflipit.live/"'));
});

test('serves a route-specific article and preserves legacy redirect HTML', async () => {
  const article = await request('/articles/vinted-relisting-tool');
  assert.equal(article.response.status, 200);
  assertPublicPage(article.body, {
    title: metadata.vintedRelisting.en.title,
    canonical: 'https://myflipit.live/articles/vinted-relisting-tool',
    language: 'en',
    alternate: { language: 'pl', url: 'https://myflipit.live/pl/poradniki/odswiezanie-ogloszen-vinted' },
  });

  const alias = await request('/articles/odswiezanie-ogloszen-vinted');
  assert.equal(alias.response.status, 200);
  assert.match(alias.body, /<meta name="robots" content="noindex, follow">/);
  assert.match(alias.body, /http-equiv="refresh" content="0;url=\/pl\/poradniki\/odswiezanie-ogloszen-vinted"/);
  assert.match(alias.body, /rel="canonical" href="https:\/\/myflipit\.live\/pl\/poradniki\/odswiezanie-ogloszen-vinted"/);
});

test('serves the noindex application shell for login and account-only routes', async () => {
  for (const urlPath of ['/login', '/pl/logowanie', '/user/items/example-id', '/pl/ustawienia-platformy/vinted']) {
    const result = await request(urlPath);
    assert.equal(result.response.status, 200, urlPath);
    assert.match(result.body, /<title>FlipIt seller workspace<\/title>/);
    assert.match(result.body, /<meta name="robots" content="noindex, nofollow"/);
    assert.notEqual(result.body, HOMEPAGE_HTML, urlPath);
    assert.doesNotMatch(result.body, /id="seo-prerender"/);
    assert.doesNotMatch(result.body, /rel="canonical"/);
    assert.doesNotMatch(result.body, /href="https:\/\/myflipit\.live\/"/);
  }
});

test('serves generated assets with immutable caching', async () => {
  const assetName = fs.readdirSync(path.join(DIST_DIR, 'assets')).find((name) => name.endsWith('.js'));
  assert.ok(assetName, 'expected a generated JavaScript asset');

  const asset = await request(`/assets/${assetName}`);
  assert.equal(asset.response.status, 200);
  assert.match(asset.response.headers.get('content-type'), /^text\/javascript/);
  assert.equal(asset.response.headers.get('cache-control'), 'public, max-age=31536000, immutable');
  assert.equal(asset.body, fs.readFileSync(path.join(DIST_DIR, 'assets', assetName), 'utf8'));
});

test('uses a noindex 404 shell for unknown client paths but not missing assets', async () => {
  const unknownRoute = await request('/this-route-does-not-exist');
  assert.equal(unknownRoute.response.status, 404);
  assert.match(unknownRoute.body, /<title>FlipIt seller workspace<\/title>/);
  assert.match(unknownRoute.body, /<meta name="robots" content="noindex, nofollow"/);
  assert.notEqual(unknownRoute.body, HOMEPAGE_HTML);
  assert.doesNotMatch(unknownRoute.body, /id="seo-prerender"/);
  assert.doesNotMatch(unknownRoute.body, /rel="canonical"/);

  const missingAsset = await request('/assets/missing.js');
  assert.equal(missingAsset.response.status, 404);
  assert.equal(missingAsset.body, 'Not Found');
  assert.doesNotMatch(missingAsset.body, /<html/i);
});

test('rejects malformed request targets without crashing the server', async () => {
  const malformed = await rawRequest('GET //[ HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n');
  assert.match(malformed, /^HTTP\/1\.1 400 Bad Request/m);

  const healthy = await request('/pricing');
  assert.equal(healthy.response.status, 200);
  assert.match(healthy.body, /<link rel="canonical" href="https:\/\/myflipit\.live\/pricing"/);
});
