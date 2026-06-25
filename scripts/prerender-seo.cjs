const fs = require('node:fs');
const path = require('node:path');

const DIST_DIR = path.resolve(__dirname, '..', 'dist');
const SITE_URL = 'https://myflipit.live';
const DEFAULT_IMAGE = `${SITE_URL}/placeholder.svg`;

const baseOrganization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'FlipIt',
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.ico`,
};

const baseWebsite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'FlipIt',
  url: SITE_URL,
};

const routes = [
  {
    path: '/',
    title: 'AI Crosslisting for OLX, Vinted, Facebook Marketplace and eBay | FlipIt',
    description:
      'FlipIt helps you create marketplace listings faster: upload photos once, get AI-generated drafts for description, pricing, categories, and attributes, then review and publish with approval.',
    language: 'en',
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'FlipIt',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        url: SITE_URL,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'PLN',
        },
        featureList: [
          'AI-generated listing drafts from photos',
          'Multi-marketplace publishing with manual approval',
          'Category mapping and required attributes',
        ],
      },
    ],
  },
  {
    path: '/automated-reselling-platform-guide',
    title: 'Automated Reselling Platform Guide for Marketplace Sellers | FlipIt',
    description:
      'A practical guide to using AI-assisted listing drafts, crosslisting, and marketplace workflows for faster reselling on OLX, Vinted, Facebook Marketplace, Allegro, and eBay.',
    language: 'en',
    type: 'article',
  },
  {
    path: '/articles',
    title: 'Marketplace Automation Guides for Resellers | FlipIt Articles',
    description:
      'Actionable FlipIt guides for Vinted relisting, OLX listing automation, Facebook Marketplace crosslisting, Allegro selling workflows, eBay pricing, and reseller productivity.',
    language: 'en',
  },
  {
    path: '/articles/vinted-relisting-tool',
    title: 'Vinted Relisting Tool: Refresh Listings Faster | FlipIt',
    description:
      'Learn how Vinted sellers can refresh stale listings, improve listing quality, and reduce manual relisting work with FlipIt-assisted marketplace workflows.',
    language: 'en',
    type: 'article',
  },
  {
    path: '/articles/odswiezanie-ogloszen-vinted',
    title: 'Odswiezanie ogloszen Vinted bez recznego przepisywania | FlipIt',
    description:
      'Praktyczny poradnik dla sprzedawcow Vinted: jak szybciej odswiezac ogloszenia, poprawiac opisy i ograniczac reczna prace przy wystawianiu produktow.',
    language: 'pl',
    type: 'article',
  },
  {
    path: '/articles/cross-list-vinted-to-facebook-marketplace',
    title: 'Cross-list Vinted Items to Facebook Marketplace | FlipIt',
    description:
      'A workflow for adapting Vinted product listings to Facebook Marketplace with better titles, descriptions, pricing context, and manual approval before publishing.',
    language: 'en',
    type: 'article',
  },
  {
    path: '/articles/crosslisting-z-vinted-na-facebook-marketplace',
    title: 'Crosslisting z Vinted na Facebook Marketplace | FlipIt',
    description:
      'Jak przenosic oferty z Vinted na Facebook Marketplace bez kopiowania wszystkiego recznie: tytuly, opisy, cena i kontrola przed publikacja.',
    language: 'pl',
    type: 'article',
  },
  {
    path: '/articles/product-relister-for-vinted',
    title: 'Product Relister for Vinted Sellers | FlipIt',
    description:
      'How a product relister workflow can help Vinted sellers rebuild listing drafts, improve copy, and prepare marketplace-ready listings with less repetitive work.',
    language: 'en',
    type: 'article',
  },
  {
    path: '/articles/relister-produktow-vinted',
    title: 'Relister produktow dla sprzedawcow Vinted | FlipIt',
    description:
      'Jak przygotowywac nowe wersje ofert Vinted szybciej, bez tracenia kontroli nad opisem, cena i publikacja ogloszenia.',
    language: 'pl',
    type: 'article',
  },
  {
    path: '/articles/how-to-sell-on-allegro',
    title: 'How to Sell on Allegro with Better Listing Workflows | FlipIt',
    description:
      'A practical Allegro selling guide for preparing product listings, descriptions, pricing context, and marketplace-ready drafts with less manual work.',
    language: 'en',
    type: 'article',
  },
  {
    path: '/articles/jak-sprzedawac-na-allegro',
    title: 'Jak sprzedawac na Allegro z lepszym procesem ofert | FlipIt',
    description:
      'Poradnik dla sprzedawcow Allegro: jak przygotowac oferte, opis, cene i dane produktu bez powtarzalnego przepisywania informacji.',
    language: 'pl',
    type: 'article',
  },
  {
    path: '/articles/how-to-price-items-for-ebay',
    title: 'How to Price Items for eBay with Active and Sold Listings | FlipIt',
    description:
      'Use active listings and sold-price context to price eBay items more carefully before publishing marketplace listings from FlipIt.',
    language: 'en',
    type: 'article',
  },
  {
    path: '/articles/jak-wycenic-przedmiot-na-ebay',
    title: 'Jak wycenic przedmiot na eBay na podstawie ofert | FlipIt',
    description:
      'Jak porownywac aktywne i sprzedane oferty eBay, zeby ustawic bardziej realistyczna cene przed publikacja ogloszenia.',
    language: 'pl',
    type: 'article',
  },
  {
    path: '/articles/ebay-active-listings-vs-sold-prices',
    title: 'eBay Active Listings vs Sold Prices: What Sellers Should Compare | FlipIt',
    description:
      'Understand the difference between active eBay listings and sold prices, and use both signals when preparing marketplace listings.',
    language: 'en',
    type: 'article',
  },
  {
    path: '/articles/aktywne-oferty-ebay-a-ceny-sprzedazy',
    title: 'Aktywne oferty eBay a ceny sprzedazy | FlipIt',
    description:
      'Czym roznia sie aktywne oferty eBay od cen sprzedazy i jak wykorzystac oba sygnaly przy wycenie przedmiotu.',
    language: 'pl',
    type: 'article',
  },
  {
    path: '/articles/olx-listing-automation-by-country',
    title: 'OLX Listing Automation by Country: Supported Workflows | FlipIt',
    description:
      'See how OLX listing automation differs by country account and how FlipIt helps prepare marketplace-ready drafts with manual approval.',
    language: 'en',
    type: 'article',
  },
  {
    path: '/articles/automatyzacja-ogloszen-olx-wedlug-kraju',
    title: 'Automatyzacja ogloszen OLX wedlug kraju | FlipIt',
    description:
      'Jak podejsc do automatyzacji ogloszen OLX dla roznych krajow i przygotowac oferty z kontrola przed publikacja.',
    language: 'pl',
    type: 'article',
  },
  {
    path: '/how-it-works',
    title: 'How AI Crosslisting Works for OLX, Vinted, Facebook Marketplace and eBay | FlipIt',
    description:
      'See how FlipIt turns one photo into marketplace-ready listing drafts, then lets sellers review, approve, publish, and track results per platform.',
    language: 'en',
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: 'How AI crosslisting works in FlipIt',
        description:
          'Upload product photos, review AI-generated listing drafts, and publish with manual approval to supported marketplaces.',
        step: [
          { '@type': 'HowToStep', position: 1, name: 'Connect marketplaces' },
          { '@type': 'HowToStep', position: 2, name: 'Upload product photos' },
          { '@type': 'HowToStep', position: 3, name: 'Review and publish' },
        ],
      },
    ],
  },
  {
    path: '/pricing',
    title: 'FlipIt Pricing: Marketplace Automation Plans for Resellers',
    description:
      'Transparent pricing for FlipIt marketplace automation. Start free, then choose paid plans in PLN or EUR for supported marketplace workflows.',
    language: 'en',
  },
  {
    path: '/get-started',
    title: 'Get Started with FlipIt Marketplace Automation',
    description:
      'Create a FlipIt account, connect supported marketplaces, and start preparing AI-assisted listing drafts with review and approval before publishing.',
    language: 'en',
  },
  {
    path: '/login',
    title: 'Login to FlipIt Marketplace Automation',
    description:
      'Log in to your FlipIt workspace to create marketplace listing drafts, manage connected accounts, and prepare products for publishing.',
    language: 'en',
    robots: 'noindex, follow',
  },
  {
    path: '/faq',
    title: 'FlipIt FAQ: AI Marketplace Automation and Crosslisting',
    description:
      'Answers about FlipIt marketplace automation, OLX and Vinted workflows, AI listing drafts, manual approval, and current product limits.',
    language: 'en',
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How does one-photo crosslisting work in FlipIt?',
            acceptedAnswer: {
              '@type': 'Answer',
              text:
                'Upload product images and details once. FlipIt drafts marketplace-specific copy, then you review and approve before publishing.',
            },
          },
          {
            '@type': 'Question',
            name: 'Will FlipIt keep my inventory synced?',
            acceptedAnswer: {
              '@type': 'Answer',
              text:
                'Not yet. FlipIt does not sync sold status or availability between marketplaces in the current version.',
            },
          },
        ],
      },
    ],
  },
  {
    path: '/success-stories',
    title: 'FlipIt Success Stories for Marketplace Sellers',
    description:
      'See how marketplace sellers use FlipIt to reduce repetitive listing work with AI-assisted descriptions, pricing context, and category mapping.',
    language: 'en',
  },
  {
    path: '/terms',
    title: 'FlipIt Terms for Marketplace Automation',
    description:
      'Read FlipIt terms for the marketplace automation platform, including AI-assisted listing drafts, account use, and publishing workflows.',
    language: 'en',
  },
  {
    path: '/privacy',
    title: 'FlipIt Privacy Policy',
    description:
      'Learn how FlipIt protects privacy while providing AI-assisted marketplace listing drafts, account connections, and publishing workflows.',
    language: 'en',
  },
  {
    path: '/cookies',
    title: 'FlipIt Cookie Policy',
    description:
      'Read how FlipIt uses cookies and similar technologies for the marketplace automation web app.',
    language: 'en',
  },
];

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

function replaceOrInsert(html, pattern, replacement, before = '</head>') {
  if (pattern.test(html)) {
    return html.replace(pattern, replacement);
  }
  return html.replace(before, `${replacement}\n    ${before}`);
}

function removeTag(html, pattern) {
  return html.replace(pattern, '');
}

function applySeo(html, route) {
  const canonical = absoluteUrl(route.path);
  const siteTitle = route.title.includes('FlipIt') ? route.title : `${route.title} | FlipIt`;
  const ogType = route.type || 'website';
  const locale = route.language === 'pl' ? 'pl_PL' : 'en_US';
  const structuredData = [baseWebsite, baseOrganization, ...(route.structuredData || [])];

  let next = html.replace(/<html\s+lang="[^"]*"/i, `<html lang="${route.language || 'en'}"`);

  next = replaceOrInsert(next, /<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(siteTitle)}</title>`);
  next = replaceOrInsert(next, /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${escapeHtml(route.description)}" />`);
  next = replaceOrInsert(next, /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${escapeHtml(siteTitle)}" />`);
  next = replaceOrInsert(next, /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${escapeHtml(route.description)}" />`);
  next = replaceOrInsert(next, /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:type" content="${ogType}" />`);
  next = replaceOrInsert(next, /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${canonical}" />`);
  next = replaceOrInsert(next, /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:image" content="${DEFAULT_IMAGE}" />`);
  next = replaceOrInsert(next, /<meta\s+property="og:locale"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:locale" content="${locale}" />`);
  next = replaceOrInsert(next, /<meta\s+name="twitter:card"\s+content="[^"]*"\s*\/?>/i, '<meta name="twitter:card" content="summary_large_image" />');
  next = replaceOrInsert(next, /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${escapeHtml(siteTitle)}" />`);
  next = replaceOrInsert(next, /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${escapeHtml(route.description)}" />`);
  next = replaceOrInsert(next, /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:image" content="${DEFAULT_IMAGE}" />`);
  next = replaceOrInsert(next, /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${canonical}" />`);

  next = removeTag(next, /\s*<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/gi);
  if (route.robots) {
    next = next.replace('</head>', `    <meta name="robots" content="${route.robots}" />\n  </head>`);
  }

  next = removeTag(next, /\s*<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/gi);
  const structuredTags = structuredData
    .map((data) => `    <script type="application/ld+json">${JSON.stringify(data)}</script>`)
    .join('\n');
  next = next.replace('</head>', `${structuredTags}\n  </head>`);

  return next;
}

function writeRoute(route, html) {
  const targetDir = route.path === '/' ? DIST_DIR : path.join(DIST_DIR, route.path.replace(/^\/+/, ''));
  fs.mkdirSync(targetDir, { recursive: true });
  const target = route.path === '/' ? path.join(DIST_DIR, 'index.html') : path.join(targetDir, 'index.html');
  fs.writeFileSync(target, html);
}

if (!fs.existsSync(DIST_DIR)) {
  throw new Error(`Missing build output directory: ${DIST_DIR}`);
}

const template = fs.readFileSync(path.join(DIST_DIR, 'index.html'), 'utf8');
for (const route of routes) {
  writeRoute(route, applySeo(template, route));
}

console.log(`Prerendered SEO HTML for ${routes.length} public routes.`);
