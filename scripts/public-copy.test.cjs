const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');

const root = join(__dirname, '..');
const read = (relativePath) => readFileSync(join(root, relativePath), 'utf8');

const ownedPublicCopyFiles = [
  'src/lib/seo-page-metadata.json',
  'src/pages/faq-content.ts',
  'src/pages/getstarted-translations.ts',
  'src/pages/guide-translations.ts',
  'src/pages/howitworks-translations.ts',
  'src/pages/successstories-translations.ts',
  'src/pages/articles/translations/articles-index.translations.ts',
  'src/pages/articles/translations/cross-list-vinted-to-facebook-marketplace.translations.ts',
  'src/pages/articles/translations/etsy-listing-tool.translations.ts',
  'src/pages/articles/translations/olx-country-accounts.translations.ts',
  'src/pages/articles/translations/product-relister-for-vinted.translations.ts',
  'src/pages/articles/translations/sell-on-allegro.translations.ts',
  'src/pages/articles/translations/vinted-relisting-tool.translations.ts',
];

const combinedCopy = ownedPublicCopyFiles.map(read).join('\n');

test('owned public copy does not contain known inflated claims', () => {
  const forbiddenClaims = [
    /double your reach/i,
    /podw[oó]j zasi[eę]g/i,
    /billions? of active users/i,
    /miliard(?:y|ów) aktywnych użytkowników/i,
    /one-click publishing/i,
    /publikacja jednym klikiem/i,
    /leaving money on the table/i,
    /tracisz pieni[aą]dze/i,
    /save you hours every week/i,
    /oszcz[eę]dzaj[aą].*godzin.*tygodniowo/i,
    /maximize your profits/i,
    /maksymalizuj.*zysk/i,
    /items often sell faster/i,
    /produkty cz[eę]sto sprzedaj[aą] si[eę] szybciej/i,
    /get their evenings back/i,
    /odzyskuj[aą] swoje wieczory/i,
    /millions? of (?:customers|users)/i,
    /milion(?:y|ów) (?:klientów|użytkowników)/i,
    /rated\s+[45](?:\.\d)?/i,
  ];

  for (const pattern of forbiddenClaims) {
    assert.doesNotMatch(combinedCopy, pattern, `Forbidden public claim matched ${pattern}`);
  }
});

test('EN and PL public copy state the marketplace capability boundaries', () => {
  const faq = read('src/pages/faq-content.ts');
  const crosslist = read('src/pages/articles/translations/cross-list-vinted-to-facebook-marketplace.translations.ts');
  const etsy = read('src/pages/articles/translations/etsy-listing-tool.translations.ts');
  const vinted = read('src/pages/articles/translations/vinted-relisting-tool.translations.ts');

  assert.match(faq, /None of these workflows is production-certified\./);
  assert.match(faq, /Żaden z tych procesów nie ma certyfikacji produkcyjnej\./);
  assert.match(faq, /official APIs?[\s\S]*session-based/i);
  assert.match(faq, /oficjalne API[\s\S]*przez sesję/i);

  assert.match(crosslist, /Facebook publishing is experimental and currently unavailable\./);
  assert.match(crosslist, /Publikacja na Facebooku ma status eksperymentalny i jest obecnie niedostępna\./);

  assert.match(vinted, /Vinted connection is session-based, not an official API, and is not production-equivalent\./);
  assert.match(vinted, /Połączenie z Vinted jest oparte na sesji, a nie na oficjalnym API, i nie jest odpowiednikiem integracji produkcyjnej\./);

  assert.match(etsy, /official API and is currently a beta workflow[\s\S]*OAuth app is not configured/i);
  assert.match(etsy, /oficjalnego API i ma obecnie status beta[\s\S]*Bez konfiguracji aplikacji OAuth Etsy/i);
});

test('seller examples are explicitly hypothetical in EN and PL', () => {
  const examples = read('src/pages/successstories-translations.ts');
  const metadata = JSON.parse(read('src/lib/seo-page-metadata.json'));

  assert.match(examples, /These hypothetical examples/);
  assert.match(examples, /not reports from real customers/i);
  assert.match(examples, /Te hipotetyczne przykłady/);
  assert.match(examples, /Nie opisują prawdziwych klientów/i);
  assert.equal(metadata.successStories.en.title, 'Seller Workflow Examples | FlipIt');
  assert.equal(metadata.successStories.pl.title, 'Przykłady pracy sprzedawcy | FlipIt');
});

test('truthful copy is attached to the intended localized public routes', () => {
  const routeConfig = JSON.parse(read('src/lib/localized-routes.json'));

  assert.deepEqual(routeConfig.routes.howItWorks, {
    en: '/how-it-works',
    pl: '/pl/jak-to-dziala',
    indexable: true,
  });
  assert.deepEqual(routeConfig.routes.successStories, {
    en: '/success-stories',
    pl: '/pl/historie-sukcesu',
    indexable: true,
  });
  assert.deepEqual(routeConfig.routes.crosslistVintedFacebook, {
    en: '/articles/cross-list-vinted-to-facebook-marketplace',
    pl: '/pl/poradniki/crosslisting-z-vinted-na-facebook-marketplace',
    indexable: true,
  });
});
