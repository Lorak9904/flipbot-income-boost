import { getCurrentLanguage, getLocalizedPathForLanguage, getTranslations } from '@/components/language-utils';
import { SeoArticleLayout } from '@/components/seo/SeoArticleLayout';
import { getRoutePath } from '@/lib/localized-routes';
import { howToPriceItemsForEbayTranslations } from './translations/how-to-price-items-for-ebay.translations';

const keywords = [
  'how to price items for ebay',
  'ebay pricing guide',
  'price items before listing on ebay',
  'ebay reseller pricing',
  'ebay listing price',
  'jak wycenic przedmiot na ebay',
  'wycena ebay',
  'jak ustalic cene na ebay',
];

const HowToPriceItemsForEbayArticle = () => {
  const t = getTranslations(howToPriceItemsForEbayTranslations);
  const language = getCurrentLanguage();
  const canonicalUrl = `https://myflipit.live${getRoutePath('priceForEbay', language)}`;

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
      href: getLocalizedPathForLanguage('/articles/ebay-active-listings-vs-sold-prices', language),
    },
    {
      text: t.relatedLink2,
      href: getLocalizedPathForLanguage('/articles/how-to-sell-on-allegro', language),
    },
    {
      text: t.relatedLink3,
      href: getLocalizedPathForLanguage('/articles/product-relister-for-vinted', language),
    },
    { text: t.relatedLink4, href: getRoutePath('usedItemValueGuide', language) },
  ];

  const cta = {
    title: t.ctaTitle,
    description: t.ctaDescription,
    buttonText: t.ctaButtonText,
    buttonLink: getRoutePath('priceChecker', language),
    footerText: t.ctaFooterText,
    footerLinkText: t.ctaFooterLinkText,
    footerLinkHref: getLocalizedPathForLanguage('/articles/ebay-active-listings-vs-sold-prices', language),
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

export default HowToPriceItemsForEbayArticle;
