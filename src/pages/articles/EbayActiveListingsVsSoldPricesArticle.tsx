import { getCurrentLanguage, getLocalizedPathForLanguage, getTranslations } from '@/components/language-utils';
import { SeoArticleLayout } from '@/components/seo/SeoArticleLayout';
import { getRoutePath } from '@/lib/localized-routes';
import { ebayActiveListingsVsSoldPricesTranslations } from './translations/ebay-active-listings-vs-sold-prices.translations';

const keywords = [
  'ebay active listings vs sold prices',
  'ebay sold prices',
  'ebay active listings',
  'ebay pricing signals',
  'ebay reseller pricing',
  'aktywne oferty ebay a ceny sprzedazy',
  'ceny sprzedazy ebay',
  'wycena ebay',
];

const EbayActiveListingsVsSoldPricesArticle = () => {
  const t = getTranslations(ebayActiveListingsVsSoldPricesTranslations);
  const language = getCurrentLanguage();
  const canonicalUrl = `https://myflipit.live${getRoutePath('ebayActiveVsSold', language)}`;

  const articleStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: t.pageTitle,
    description: t.pageDescription,
    author: {
      '@type': 'Organization',
      name: 'FlipIt',
      url: 'https://myflipit.live',
    },
    publisher: {
      '@type': 'Organization',
      name: 'FlipIt',
      logo: {
        '@type': 'ImageObject',
        url: 'https://myflipit.live/placeholder.svg',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    datePublished: '2026-06-13',
    dateModified: '2026-07-13',
    keywords,
  };

  const sections = [
    {
      heading: t.section1Title,
      bodyParagraphs: [t.section1Para1, t.section1Para2],
    },
    {
      heading: t.section2Title,
      bodyParagraphs: [t.section2Para1, t.section2Para2],
    },
    {
      heading: t.section3Title,
      bodyParagraphs: [t.section3Para1, t.section3Para2],
    },
    {
      heading: t.section4Title,
      bodyParagraphs: [t.section4Para1, t.section4Para2],
    },
    {
      heading: t.section5Title,
      bodyParagraphs: [t.section5Para1, t.section5Para2],
    },
    {
      heading: t.section6Title,
      bodyParagraphs: [t.section6Para1, t.section6Para2],
    },
    {
      heading: t.section7Title,
      bodyParagraphs: [t.section7Para1, t.section7Para2],
    },
  ];

  const faq = [
    { q: t.faq1Question, a: t.faq1Answer },
    { q: t.faq2Question, a: t.faq2Answer },
    { q: t.faq3Question, a: t.faq3Answer },
    { q: t.faq4Question, a: t.faq4Answer },
  ];

  const relatedLinks = [
    {
      text: t.relatedLink1,
      href: getLocalizedPathForLanguage('/articles/how-to-price-items-for-ebay', language),
    },
    {
      text: t.relatedLink2,
      href: getLocalizedPathForLanguage('/articles/product-relister-for-vinted', language),
    },
    {
      text: t.relatedLink3,
      href: getLocalizedPathForLanguage('/articles/cross-list-vinted-to-facebook-marketplace', language),
    },
    { text: t.relatedLink4, href: '/automated-reselling-platform-guide' },
  ];

  const cta = {
    title: t.ctaTitle,
    description: t.ctaDescription,
    buttonText: t.ctaButtonText,
    buttonLink: getRoutePath('priceChecker', language),
    footerText: t.ctaFooterText,
    footerLinkText: t.ctaFooterLinkText,
    footerLinkHref: getLocalizedPathForLanguage('/articles/how-to-price-items-for-ebay', language),
  };

  const highlights = [t.highlight1, t.highlight2, t.highlight3];

  return (
    <SeoArticleLayout
      title={t.pageTitle}
      description={t.pageDescription}
      canonicalUrl={canonicalUrl}
      keywords={keywords}
      articleStructuredData={articleStructuredData}
      heroLabel={t.heroLabel}
      heroTitle={t.heroTitle}
      heroTitleHighlight={t.heroTitleHighlight}
      heroSubtitle={t.heroSubtitle}
      heroBadges={[t.heroBadge1, t.heroBadge2, t.heroBadge3]}
      highlightsTitle={t.highlightsTitle}
      highlights={highlights}
      sections={sections}
      faq={faq}
      cta={cta}
      relatedLinks={relatedLinks}
      relatedLinksTitle={t.relatedLinksTitle}
    />
  );
};

export default EbayActiveListingsVsSoldPricesArticle;
