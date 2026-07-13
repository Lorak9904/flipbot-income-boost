#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const SITE_URL = 'https://myflipit.live';
const DEFAULT_LAST_MODIFIED = '2026-07-12';
const DEFAULT_IMAGE = `${SITE_URL}/placeholder.svg`;
const routeManifest = require('../src/lib/localized-routes.json');
const pageMetadata = require('../src/lib/seo-page-metadata.json');
const productRelisterQuestions = require('../src/pages/articles/content/product-relister-vinted.questions.json');

const baseHtmlPath = path.join(DIST_DIR, 'index.html');
if (!fs.existsSync(baseHtmlPath)) {
  throw new Error(`Missing Vite output: ${baseHtmlPath}`);
}
const baseHtml = fs.readFileSync(baseHtmlPath, 'utf8');

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function absoluteUrl(routePath) {
  return routePath === '/' ? `${SITE_URL}/` : `${SITE_URL}${routePath}`;
}

function ensureSiteTitle(title) {
  return title.includes('FlipIt') ? title : `${title} | FlipIt`;
}

function pagePath(routeKey, language) {
  return routeManifest.routes[routeKey][language];
}

function lastModified(routeKey) {
  return pageMetadata[routeKey]?.lastModified || DEFAULT_LAST_MODIFIED;
}

function alternateLinks(routeKey) {
  const en = absoluteUrl(pagePath(routeKey, 'en'));
  const pl = absoluteUrl(pagePath(routeKey, 'pl'));
  return [
    { language: 'en', url: en },
    { language: 'pl', url: pl },
    { language: 'x-default', url: en },
  ];
}

function stripManagedHead(html) {
  return html
    .replace(/<title>[\s\S]*?<\/title>/gi, '')
    .replace(/\s*<meta\s+(?:name|property)=["'](?:description|title|robots|og:[^"']+|twitter:[^"']+)["'][^>]*\/?>(?:\s*)/gi, '\n')
    .replace(/\s*<link\s+rel=["'](?:canonical|alternate)["'][^>]*\/?>(?:\s*)/gi, '\n')
    .replace(/\s*<script\s+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>(?:\s*)/gi, '\n')
    .replace(/\s*<style\s+data-seo-prerender[^>]*>[\s\S]*?<\/style>(?:\s*)/gi, '\n');
}

function buildStructuredData(routeKey, language, metadata, canonicalUrl) {
  const routeType = pageMetadata[routeKey]?.type === 'article' ? 'Article' : 'WebPage';
  const graph = [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'FlipIt',
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/favicon.ico`,
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: 'FlipIt',
      url: `${SITE_URL}/`,
      inLanguage: ['en', 'pl'],
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': routeType,
      '@id': `${canonicalUrl}#page`,
      url: canonicalUrl,
      name: metadata.title,
      headline: metadata.title,
      description: metadata.description,
      inLanguage: language,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      publisher: { '@id': `${SITE_URL}/#organization` },
      ...(routeType === 'Article' ? { dateModified: lastModified(routeKey) } : {}),
    },
  ];

  if (routeKey === 'home') {
    graph.push({
      '@type': 'SoftwareApplication',
      name: 'FlipIt',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: canonicalUrl,
      inLanguage: language,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'PLN' },
    });
  }

  if (routeKey === 'priceChecker') {
    graph.push({
      '@type': 'WebApplication',
      name: metadata.title.replace(/\s*\|\s*FlipIt$/i, ''),
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      url: canonicalUrl,
      inLanguage: language,
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: language === 'pl' ? 'PLN' : 'USD' },
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}

function localizedNav(language) {
  const labels = language === 'pl'
    ? { home: 'Strona główna', guide: 'Jak to działa', articles: 'Poradniki', pricing: 'Cennik', faq: 'FAQ' }
    : { home: 'Home', guide: 'How it works', articles: 'Guides', pricing: 'Pricing', faq: 'FAQ' };
  const keys = ['home', 'howItWorks', 'articles', 'pricing', 'faq'];
  const labelKeys = ['home', 'guide', 'articles', 'pricing', 'faq'];
  return keys
    .map((key, index) => `<a href="${escapeHtml(pagePath(key, language))}">${escapeHtml(labels[labelKeys[index]])}</a>`)
    .join('');
}

function answerMarkup(routeKey, language) {
  if (routeKey !== 'productRelisterVinted') return '';
  const content = productRelisterQuestions[language];
  if (!content) return '';

  const sections = content.sections
    .map((section) => `
        <section>
          <h2>${escapeHtml(section.heading)}</h2>
          ${section.bodyParagraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}
        </section>`)
    .join('');
  const faqTitle = language === 'pl' ? 'Najczęstsze pytania' : 'Frequently asked questions';
  const faq = `
        <section>
          <h2>${escapeHtml(faqTitle)}</h2>
          ${content.faq.map((item) => `<h3>${escapeHtml(item.q)}</h3><p>${escapeHtml(item.a)}</p>`).join('')}
        </section>`;
  const sources = `
        <section>
          <h2>${escapeHtml(content.sourcesTitle)}</h2>
          <ul>${content.sources.map((source) => `<li><a href="${escapeHtml(source.href)}">${escapeHtml(source.text)}</a></li>`).join('')}</ul>
        </section>`;
  return `${sections}${faq}${sources}`;
}

function fallbackMarkup(routeKey, language, metadata) {
  const navLabel = language === 'pl' ? 'Główna nawigacja' : 'Primary navigation';
  const continueLabel = language === 'pl'
    ? 'Aplikacja FlipIt ładuje pełną zawartość tej strony.'
    : 'The FlipIt application is loading the full content of this page.';
  return `
    <div id="seo-prerender" class="seo-prerender">
      <header><a class="seo-prerender__brand" href="${pagePath('home', language)}">FlipIt</a></header>
      <main>
        <h1>${escapeHtml(metadata.title.replace(/\s*\|\s*FlipIt$/i, ''))}</h1>
        <p>${escapeHtml(metadata.description)}</p>
        ${answerMarkup(routeKey, language)}
        <p class="seo-prerender__status">${escapeHtml(continueLabel)}</p>
      </main>
      <nav aria-label="${escapeHtml(navLabel)}">${localizedNav(language)}</nav>
    </div>`;
}

function buildPage(routeKey, language) {
  const metadata = pageMetadata[routeKey]?.[language];
  if (!metadata) throw new Error(`Missing SEO metadata for ${routeKey}.${language}`);

  const routePath = pagePath(routeKey, language);
  const canonicalUrl = absoluteUrl(routePath);
  const title = ensureSiteTitle(metadata.title);
  const alternates = alternateLinks(routeKey);
  const locale = language === 'pl' ? 'pl_PL' : 'en_US';
  const alternateLocale = language === 'pl' ? 'en_US' : 'pl_PL';
  const structuredData = buildStructuredData(routeKey, language, metadata, canonicalUrl);
  const managedHead = `
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(metadata.description)}" />
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
    ${alternates.map((item) => `<link rel="alternate" hreflang="${item.language}" href="${escapeHtml(item.url)}" />`).join('\n    ')}
    <meta property="og:type" content="${pageMetadata[routeKey]?.type === 'article' ? 'article' : 'website'}" />
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(metadata.description)}" />
    <meta property="og:image" content="${DEFAULT_IMAGE}" />
    <meta property="og:site_name" content="FlipIt" />
    <meta property="og:locale" content="${locale}" />
    <meta property="og:locale:alternate" content="${alternateLocale}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(metadata.description)}" />
    <meta name="twitter:image" content="${DEFAULT_IMAGE}" />
    <script type="application/ld+json" data-seo-prerender>${JSON.stringify(structuredData).replaceAll('<', '\\u003c')}</script>
    <style data-seo-prerender>
      .seo-prerender{min-height:100vh;padding:4rem max(1.25rem,calc((100vw - 72rem)/2));background:#0a0a0a;color:#fff;font:16px/1.6 system-ui,sans-serif}
      .seo-prerender__brand{color:#22d3ee;font-size:1.5rem;font-weight:800;text-decoration:none}
      .seo-prerender main{max-width:48rem;margin:6rem 0 4rem}.seo-prerender h1{font-size:clamp(2rem,5vw,4rem);line-height:1.1}.seo-prerender p{color:#d4d4d4;font-size:1.125rem}
      .seo-prerender__status{font-size:.875rem!important;color:#a3a3a3!important}.seo-prerender nav{display:flex;flex-wrap:wrap;gap:1rem}.seo-prerender nav a{color:#67e8f9}
    </style>`;

  let html = stripManagedHead(baseHtml)
    .replace(/<html\s+lang=["'][^"']*["']>/i, `<html lang="${language}">`)
    .replace('</head>', `${managedHead}\n  </head>`);
  html = html.replace('<div id="root"></div>', `${fallbackMarkup(routeKey, language, metadata)}\n    <div id="root"></div>`);
  return html;
}

function outputPath(routePath) {
  if (routePath === '/') return path.join(DIST_DIR, 'index.html');
  return path.join(DIST_DIR, routePath.replace(/^\//, ''), 'index.html');
}

function writePage(routePath, html) {
  const target = outputPath(routePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, html, 'utf8');
}

function buildLegacyAlias(alias) {
  const targetPath = pagePath(alias.key, alias.language);
  const canonical = absoluteUrl(targetPath);
  const metadata = pageMetadata[alias.key][alias.language];
  return `<!doctype html><html lang="${alias.language}"><head><meta charset="utf-8"><meta name="robots" content="noindex, follow"><link rel="canonical" href="${escapeHtml(canonical)}"><meta http-equiv="refresh" content="0;url=${escapeHtml(targetPath)}"><title>${escapeHtml(ensureSiteTitle(metadata.title))}</title></head><body><p><a href="${escapeHtml(targetPath)}">${escapeHtml(metadata.title)}</a></p></body></html>`;
}

function buildAppShell() {
  const managedHead = `
    <title>FlipIt seller workspace</title>
    <meta name="description" content="Sign in to manage marketplace listings, connected accounts, publishing settings, and seller workflows in FlipIt." />
    <meta name="robots" content="noindex, nofollow" />`;
  return stripManagedHead(baseHtml)
    .replace(/<html\s+lang=["'][^"']*["']>/i, '<html lang="en">')
    .replace('</head>', `${managedHead}\n  </head>`);
}

function buildSitemap() {
  const entries = [];
  for (const [routeKey, definition] of Object.entries(routeManifest.routes)) {
    if (!definition.indexable || definition.en.includes(':') || !pageMetadata[routeKey]) continue;
    const alternates = alternateLinks(routeKey);
    for (const language of ['en', 'pl']) {
      const loc = absoluteUrl(definition[language]);
      entries.push(`  <url>\n    <loc>${escapeHtml(loc)}</loc>\n${alternates.map((item) => `    <xhtml:link rel="alternate" hreflang="${item.language}" href="${escapeHtml(item.url)}" />`).join('\n')}\n    <lastmod>${lastModified(routeKey)}</lastmod>\n  </url>`);
    }
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join('\n')}\n</urlset>\n`;
}

let pageCount = 0;
for (const [routeKey, definition] of Object.entries(routeManifest.routes)) {
  if (!definition.indexable || definition.en.includes(':') || !pageMetadata[routeKey]) continue;
  for (const language of ['en', 'pl']) {
    writePage(definition[language], buildPage(routeKey, language));
    pageCount += 1;
  }
}

for (const alias of routeManifest.legacyAliases) {
  writePage(alias.path, buildLegacyAlias(alias));
}

fs.writeFileSync(path.join(DIST_DIR, 'app.html'), buildAppShell(), 'utf8');

const sitemap = buildSitemap();
fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemap, 'utf8');
fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), sitemap, 'utf8');

console.log(`Prerendered ${pageCount} localized public pages and ${routeManifest.legacyAliases.length} legacy redirects.`);
