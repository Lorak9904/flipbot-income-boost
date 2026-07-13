import { getTranslations, getCurrentLanguage, getLocalizedPathForLanguage } from '@/components/language-utils';
import { SeoArticleLayout } from '@/components/seo/SeoArticleLayout';
import { getRoutePath } from '@/lib/localized-routes';
import { productRelisterTranslations } from './translations/product-relister-for-vinted.translations';
import questionContent from './content/product-relister-vinted.questions.json';

const keywords = [
  'product relister for vinted',
  'vinted product relister',
  'vinted listing manager',
  'vinted inventory tool',
  'relist vinted products',
  'vinted bulk listing',
  'vinted automation tool',
  'vinted seller software',
  'move listings to vinted',
  'cross list ebay to vinted',
  'olx to vinted',
  'facebook marketplace to vinted',
];

const ProductRelisterForVintedArticle = () => {
  const t = getTranslations(productRelisterTranslations);
  const language = getCurrentLanguage();
  const canonicalUrl = `https://myflipit.live${getRoutePath('productRelisterVinted', language)}`;
  
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
    datePublished: '2026-01-06',
    dateModified: '2026-07-13',
    keywords,
  };

  const answerContent = questionContent[language];
  const sections = answerContent.sections;

  const faq = [
    { q: t.faq1Question, a: t.faq1Answer },
    { q: t.faq3Question, a: t.faq3Answer },
    ...answerContent.faq,
  ];

  const relatedLinks = [
    { text: t.relatedLink1, href: getLocalizedPathForLanguage('/articles/vinted-relisting-tool', language) },
    { text: t.relatedLink2, href: getLocalizedPathForLanguage('/articles/cross-list-vinted-to-facebook-marketplace', language) },
    { text: t.relatedLink3, href: getLocalizedPathForLanguage('/automated-reselling-platform-guide', language) },
  ];

  const cta = {
    title: t.ctaTitle,
    description: t.ctaDescription,
    buttonText: t.ctaButtonText,
    buttonLink: getLocalizedPathForLanguage('/get-started', language),
    footerText: t.ctaFooterText,
    footerLinkText: t.ctaFooterLinkText,
    footerLinkHref: getLocalizedPathForLanguage('/user/items', language),
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
      sourceLinks={answerContent.sources}
      sourceLinksTitle={answerContent.sourcesTitle}
    />
  );
};

export default ProductRelisterForVintedArticle;
