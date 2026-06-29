const fs = require('node:fs');
const path = require('node:path');

const DIST_DIR = path.resolve(__dirname, '..', 'dist');
const SITE_URL = 'https://myflipit.live';
const DEFAULT_IMAGE = `${SITE_URL}/placeholder.svg`;
const SEO_FALLBACK_HIDDEN_STYLE =
  'position:absolute;left:-10000px;top:auto;width:1px;height:1px;overflow:hidden;';

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
    title: 'AI Crosslisting for OLX, Vinted, eBay, Allegro and Etsy | FlipIt',
    description:
      'Create marketplace listing drafts from photos for OLX, Vinted, Facebook Marketplace, Allegro, eBay, and Etsy, then review before publishing.',
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
      'A practical guide to AI-assisted listing drafts, crosslisting, and faster reseller workflows across OLX, Vinted, Allegro, eBay, and Facebook Marketplace.',
    language: 'en',
    type: 'article',
  },
  {
    path: '/articles',
    title: 'Marketplace Automation Guides for Resellers | FlipIt Articles',
    description:
      'Guides for Vinted relisting, OLX listing automation, Facebook Marketplace crosslisting, Allegro selling, eBay pricing, Etsy listing workflows, and reseller productivity.',
    language: 'en',
  },
  {
    path: '/articles/vinted-relisting-tool',
    title: 'Vinted Relisting Tool: Refresh Listings Faster | FlipIt',
    description:
      'Learn how Vinted sellers can refresh stale listings, improve listing quality, and reduce manual relisting work with FlipIt-assisted marketplace workflows.',
    language: 'en',
    type: 'article',
    dateModified: '2026-06-29',
    fallbackHighlights: [
      'Prepare refreshed Vinted-ready drafts from existing product photos.',
      'Review updated titles, descriptions, categories, and price context before publishing.',
      'Avoid duplicate active listings and keep seller approval in the workflow.',
    ],
    faq: [
      {
        question: 'Is relisting on Vinted allowed?',
        answer:
          'Yes, refreshing your own listings is a normal seller practice. Avoid creating duplicate active listings or spamming, which can violate Vinted\'s terms.',
      },
      {
        question: 'Can FlipIt relist to multiple platforms at once?',
        answer:
          'Yes! FlipIt supports crosslisting to Vinted, OLX, Facebook Marketplace, eBay, Allegro, and Etsy. Prepare one draft and publish to multiple platforms with a single review.',
      },
    ],
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
      'Adapt Vinted product listings for Facebook Marketplace with better titles, descriptions, pricing context, and manual approval before publishing.',
    language: 'en',
    type: 'article',
    dateModified: '2026-06-29',
    fallbackHighlights: [
      'Turn one Vinted product draft into a Facebook Marketplace-ready version.',
      'Adjust title, description, category, price context, and publishing details per marketplace.',
      'Keep inventory status and sold-item cleanup under seller control.',
    ],
    faq: [
      {
        question: 'Does FlipIt post to Facebook Marketplace automatically?',
        answer:
          'FlipIt prepares your listings and you approve before publishing. This keeps you in control while still saving significant time.',
      },
      {
        question: 'What if I want different prices on Vinted vs Facebook?',
        answer:
          'FlipIt supports platform-specific price adjustments. You can set rules like "Facebook price = Vinted price + 10%" to account for different buyer expectations.',
      },
    ],
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
    title: 'Product Relister for Vinted: Relist and Refresh Listings | FlipIt',
    description:
      'Use FlipIt to rebuild Vinted listing drafts from photos, improve titles and descriptions, then review before relisting or cross-listing.',
    language: 'en',
    type: 'article',
    dateModified: '2026-06-29',
    fallbackHighlights: [
      'Prepare a fresh Vinted listing draft from existing product photos and details.',
      'Improve stale titles, descriptions, categories, and price context before relisting.',
      'Adapt the same item for Facebook Marketplace, OLX, eBay, Allegro, or Etsy after seller review.',
    ],
    faq: [
      {
        question: 'What\'s the difference between relisting and refreshing?',
        answer:
          'Refreshing usually means updating an existing listing. Relisting often means preparing a new version of the listing. FlipIt helps with the draft work, but you still review before publishing.',
      },
      {
        question: 'Does FlipIt automatically relist my items?',
        answer:
          'No. FlipIt helps prepare the content and publishing workflow, but you approve actions before listings go live.',
      },
    ],
  },
  {
    path: '/articles/relister-produktow-vinted',
    title: 'Relister produktów dla Vinted: wznawiaj i odświeżaj ogłoszenia | FlipIt',
    description:
      'Użyj FlipIt, aby przygotować nowy szkic ogłoszenia Vinted ze zdjęć, poprawić tytuł i opis, a potem zatwierdzić publikację.',
    language: 'pl',
    type: 'article',
    dateModified: '2026-06-29',
    fallbackHighlights: [
      'Przygotuj świeży szkic ogłoszenia Vinted na podstawie zdjęć i danych produktu.',
      'Popraw stary tytuł, opis, kategorię i kontekst ceny przed ponownym wystawieniem.',
      'Dopasuj ten sam produkt do Facebook Marketplace, OLX, eBay, Allegro albo Etsy po sprawdzeniu przez sprzedawcę.',
    ],
    faq: [
      {
        question: 'Jaka jest różnica między wznawianiem a odświeżaniem?',
        answer:
          'Odświeżanie zwykle oznacza aktualizację istniejącego ogłoszenia. Wznawianie częściej polega na przygotowaniu nowej wersji oferty. FlipIt pomaga w pracy nad szkicem, ale publikację nadal zatwierdzasz samodzielnie.',
      },
      {
        question: 'Czy FlipIt automatycznie wznawia moje produkty?',
        answer:
          'Nie. FlipIt pomaga przygotować treść i proces publikacji, ale działania zatwierdzasz przed wystawieniem oferty.',
      },
    ],
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
    path: '/articles/etsy-listing-tool',
    title: 'Etsy Listing Tool for Shop-Ready Drafts | FlipIt',
    description:
      'Prepare Etsy listing drafts from photos with category, attributes, price, shipping profile, active-listing import, and seller review before publishing.',
    language: 'en',
    type: 'article',
    dateModified: '2026-06-26',
    fallbackHighlights: [
      'Prepare Etsy listing drafts from product photos and seller-provided details.',
      'Review category, attributes, price, shipping profile, and shop-specific fields.',
      'Use active-listing import and seller approval before publishing changes.',
    ],
    faq: [
      {
        question: 'Can FlipIt import my current Etsy listings?',
        answer:
          'Yes. After you connect an Etsy shop, FlipIt can import active Etsy listings into your workspace. If the connection expires, you reconnect before importing again.',
      },
      {
        question: 'Does FlipIt publish to Etsy automatically?',
        answer:
          'No. FlipIt prepares the draft and required details, but you review and approve the listing before it is published.',
      },
    ],
  },
  {
    path: '/articles/narzedzie-do-ogloszen-etsy',
    title: 'Narzedzie do ofert Etsy ze zdjec produktu | FlipIt',
    description:
      'Przygotuj szkice ofert Etsy ze zdjec: opis, kategoria, atrybuty, cena, profil wysylki, import aktywnych ofert i publikacja po akceptacji.',
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
    title: 'Terms of Service | FlipIt',
    description:
      'The rules for using FlipIt, including accounts, marketplace connections, AI-assisted drafts, publishing responsibility, billing, and support.',
    language: 'en',
    alternatePaths: { en: '/terms', pl: '/pl/regulamin' },
  },
  {
    path: '/pl/regulamin',
    title: 'Regulamin | FlipIt',
    description:
      'Zasady korzystania z FlipIt: konto, połączenia z marketplace, szkice AI, odpowiedzialność za publikację, rozliczenia i wsparcie.',
    language: 'pl',
    alternatePaths: { en: '/terms', pl: '/pl/regulamin' },
  },
  {
    path: '/privacy',
    title: 'Privacy Policy | FlipIt',
    description:
      'How FlipIt handles account data, marketplace connections, listing content, AI-assisted processing, payments, analytics, cookies, and user rights.',
    language: 'en',
    alternatePaths: { en: '/privacy', pl: '/pl/polityka-prywatnosci' },
  },
  {
    path: '/pl/polityka-prywatnosci',
    title: 'Polityka prywatności | FlipIt',
    description:
      'Jak FlipIt przetwarza dane konta, połączenia z marketplace, treści ogłoszeń, AI, płatności, analitykę, cookies i prawa użytkownika.',
    language: 'pl',
    alternatePaths: { en: '/privacy', pl: '/pl/polityka-prywatnosci' },
  },
  {
    path: '/cookies',
    title: 'Cookie Policy | FlipIt',
    description:
      'How FlipIt uses cookies, local storage, analytics, live chat tools, login providers, payment providers, and marketplace services.',
    language: 'en',
    alternatePaths: { en: '/cookies', pl: '/pl/polityka-cookies' },
  },
  {
    path: '/pl/polityka-cookies',
    title: 'Polityka cookies | FlipIt',
    description:
      'Jak FlipIt używa cookies, local storage, analityki, czatu, logowania, płatności i usług marketplace.',
    language: 'pl',
    alternatePaths: { en: '/cookies', pl: '/pl/polityka-cookies' },
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

function stripSiteSuffix(siteTitle) {
  return siteTitle
    .replace(/\s+\|\s+FlipIt(?:\s+Articles)?$/i, '')
    .replace(/\s+\|\s+FlipIt$/i, '');
}

function localizedFallbackCopy(language) {
  if (language === 'pl') {
    return {
      navLabel: 'Główna nawigacja',
      coverageHeading: 'Co obejmuje ta strona',
      highlights: [
        'Przygotowanie ofert z pomocą AI na podstawie zdjęć i danych produktu.',
        'Lepsze tytuły, opisy, kategorie, atrybuty i kontekst ceny przed publikacją.',
        'Ręczna kontrola sprzedawcy przed wystawieniem oferty na obsługiwanym marketplace.',
      ],
      links: [
        { href: '/', label: 'Start' },
        { href: '/how-it-works', label: 'Jak działa' },
        { href: '/articles', label: 'Poradniki' },
        { href: '/pricing', label: 'Cennik' },
        { href: '/faq', label: 'FAQ' },
      ],
      footer: 'FlipIt pomaga przygotowywać oferty marketplace szybciej, zawsze z kontrolą sprzedawcy.',
    };
  }

  return {
    navLabel: 'Primary navigation',
    coverageHeading: 'What this page covers',
    highlights: [
      'AI-assisted listing drafts from product photos and details.',
      'Better titles, descriptions, categories, attributes, and pricing context before publishing.',
      'Seller review and approval before listings go live on supported marketplaces.',
    ],
    links: [
      { href: '/', label: 'Home' },
      { href: '/how-it-works', label: 'How it works' },
      { href: '/articles', label: 'Guides' },
      { href: '/pricing', label: 'Pricing' },
      { href: '/faq', label: 'FAQ' },
    ],
    footer: 'FlipIt helps marketplace sellers prepare listing drafts faster, always with seller approval.',
  };
}

function buildSeoFallback(route, siteTitle, canonical) {
  const copy = localizedFallbackCopy(route.language);
  const heading = route.heading || stripSiteSuffix(siteTitle);
  const contentTag = route.type === 'article' ? 'article' : 'section';
  const fallbackLinks = route.fallbackLinks || copy.links;
  const fallbackHighlights = route.fallbackHighlights || copy.highlights;
  const navLinks = copy.links
    .map(
      (link) =>
        `          <a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`
    )
    .join('\n');
  const contextualLinks = fallbackLinks
    .map(
      (link) =>
        `            <li><a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a></li>`
    )
    .join('\n');
  const highlights = fallbackHighlights
    .map((item) => `            <li>${escapeHtml(item)}</li>`)
    .join('\n');

  return `    <div id="root">
      <div data-seo-fallback="true" aria-hidden="true" style="${SEO_FALLBACK_HIDDEN_STYLE}">
        <header>
        <nav aria-label="${escapeHtml(copy.navLabel)}">
${navLinks}
        </nav>
        </header>
        <main>
        <${contentTag}>
          <h1>${escapeHtml(heading)}</h1>
          <p>${escapeHtml(route.description)}</p>
          <h2>${escapeHtml(copy.coverageHeading)}</h2>
          <ul>
${highlights}
          </ul>
          <h2>${route.language === 'pl' ? 'Powiązane strony' : 'Related pages'}</h2>
          <ul>
${contextualLinks}
          </ul>
          <p><a href="${escapeHtml(canonical)}">${escapeHtml(canonical)}</a></p>
        </${contentTag}>
        </main>
        <footer>
        <p>${escapeHtml(copy.footer)}</p>
        </footer>
      </div>
    </div>`;
}

function injectSeoFallback(html, route, siteTitle, canonical) {
  const fallback = buildSeoFallback(route, siteTitle, canonical);
  return html.replace(/    <div\s+id="root">\s*<\/div>/i, fallback);
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

function alternateLinkTags(route) {
  if (!route.alternatePaths) {
    return '';
  }

  return [
    { hrefLang: 'en', path: route.alternatePaths.en },
    { hrefLang: 'pl', path: route.alternatePaths.pl },
    { hrefLang: 'x-default', path: route.alternatePaths.en },
  ]
    .map(
      (alternate) =>
        `  <link data-rh="true" rel="alternate" hreflang="${alternate.hrefLang}" href="${absoluteUrl(alternate.path)}" />`
    )
    .join('\n');
}

function buildBreadcrumbStructuredData(route, canonical, siteTitle) {
  const items = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: `${SITE_URL}/`,
    },
  ];

  if (route.path.startsWith('/articles') && route.path !== '/articles') {
    items.push({
      '@type': 'ListItem',
      position: items.length + 1,
      name: route.language === 'pl' ? 'Poradniki' : 'Articles',
      item: `${SITE_URL}/articles`,
    });
  }

  items.push({
    '@type': 'ListItem',
    position: items.length + 1,
    name: stripSiteSuffix(siteTitle),
    item: canonical,
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}

function buildArticleStructuredData(route, canonical, siteTitle) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: stripSiteSuffix(siteTitle),
    description: route.description,
    author: {
      '@type': 'Organization',
      name: 'FlipIt',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'FlipIt',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/favicon.ico`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonical,
    },
    datePublished: route.datePublished || '2026-01-06',
    dateModified: route.dateModified || route.datePublished || '2026-06-29',
  };
}

function buildFaqStructuredData(route) {
  if (!route.faq?.length) {
    return null;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: route.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

function routeStructuredData(route, canonical, siteTitle) {
  const generated = [];

  if (route.type === 'article') {
    generated.push(buildArticleStructuredData(route, canonical, siteTitle));
  }

  if (route.path === '/articles' || route.path.startsWith('/articles/')) {
    generated.push(buildBreadcrumbStructuredData(route, canonical, siteTitle));
  }

  const faqStructuredData = buildFaqStructuredData(route);
  if (faqStructuredData) {
    generated.push(faqStructuredData);
  }

  return generated;
}

function applySeo(html, route) {
  const canonical = absoluteUrl(route.path);
  const siteTitle = route.title.includes('FlipIt') ? route.title : `${route.title} | FlipIt`;
  const ogType = route.type || 'website';
  const locale = route.language === 'pl' ? 'pl_PL' : 'en_US';
  const structuredData = [
    baseWebsite,
    baseOrganization,
    ...routeStructuredData(route, canonical, siteTitle),
    ...(route.structuredData || []),
  ];

  let next = html.replace(/<html\s+lang="[^"]*"/i, `<html lang="${route.language || 'en'}"`);

  next = replaceOrInsert(next, /<title(?:\s+[^>]*)?>[\s\S]*?<\/title>/i, `<title data-rh="true">${escapeHtml(siteTitle)}</title>`);
  next = replaceOrInsert(next, /<meta\b(?=[^>]*\bname="description")[^>]*>/i, `<meta data-rh="true" name="description" content="${escapeHtml(route.description)}" />`);
  next = replaceOrInsert(next, /<meta\b(?=[^>]*\bproperty="og:title")[^>]*>/i, `<meta data-rh="true" property="og:title" content="${escapeHtml(siteTitle)}" />`);
  next = replaceOrInsert(next, /<meta\b(?=[^>]*\bproperty="og:description")[^>]*>/i, `<meta data-rh="true" property="og:description" content="${escapeHtml(route.description)}" />`);
  next = replaceOrInsert(next, /<meta\b(?=[^>]*\bproperty="og:type")[^>]*>/i, `<meta data-rh="true" property="og:type" content="${ogType}" />`);
  next = replaceOrInsert(next, /<meta\b(?=[^>]*\bproperty="og:url")[^>]*>/i, `<meta data-rh="true" property="og:url" content="${canonical}" />`);
  next = replaceOrInsert(next, /<meta\b(?=[^>]*\bproperty="og:image")[^>]*>/i, `<meta data-rh="true" property="og:image" content="${DEFAULT_IMAGE}" />`);
  next = replaceOrInsert(next, /<meta\b(?=[^>]*\bproperty="og:locale")[^>]*>/i, `<meta data-rh="true" property="og:locale" content="${locale}" />`);
  next = replaceOrInsert(next, /<meta\b(?=[^>]*\bname="twitter:card")[^>]*>/i, '<meta data-rh="true" name="twitter:card" content="summary_large_image" />');
  next = replaceOrInsert(next, /<meta\b(?=[^>]*\bname="twitter:title")[^>]*>/i, `<meta data-rh="true" name="twitter:title" content="${escapeHtml(siteTitle)}" />`);
  next = replaceOrInsert(next, /<meta\b(?=[^>]*\bname="twitter:description")[^>]*>/i, `<meta data-rh="true" name="twitter:description" content="${escapeHtml(route.description)}" />`);
  next = replaceOrInsert(next, /<meta\b(?=[^>]*\bname="twitter:image")[^>]*>/i, `<meta data-rh="true" name="twitter:image" content="${DEFAULT_IMAGE}" />`);
  next = replaceOrInsert(next, /<link\b(?=[^>]*\brel="canonical")[^>]*>/i, `<link data-rh="true" rel="canonical" href="${canonical}" />`);
  next = removeTag(next, /\s*<link\b(?=[^>]*\brel="alternate")(?=[^>]*\bhreflang="[^"]+")[^>]*>/gi);
  const alternates = alternateLinkTags(route);
  if (alternates) {
    next = next.replace(/(<link\b(?=[^>]*\brel="canonical")[^>]*>)/i, `$1\n${alternates}`);
  }

  next = removeTag(next, /\s*<meta\b(?=[^>]*\bname="robots")[^>]*>/gi);
  if (route.robots) {
    next = next.replace('</head>', `    <meta data-rh="true" name="robots" content="${route.robots}" />\n  </head>`);
  }

  next = removeTag(next, /\s*<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/gi);
  const structuredTags = structuredData
    .map((data) => `    <script type="application/ld+json">${JSON.stringify(data)}</script>`)
    .join('\n');
  next = next.replace('</head>', `${structuredTags}\n  </head>`);
  next = injectSeoFallback(next, route, siteTitle, canonical);

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
