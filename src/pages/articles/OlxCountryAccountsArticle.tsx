import { getCurrentLanguage, getLocalizedPathForLanguage, getTranslations } from '@/components/language-utils';
import { SeoArticleLayout } from '@/components/seo/SeoArticleLayout';
import { olxCountryAccountsTranslations } from './translations/olx-country-accounts.translations';

const keywords = [
  'OLX listing automation by country',
  'OLX country accounts',
  'OLX Poland automation',
  'OLX Ukraine automation',
  'OLX Romania automation',
  'OLX Bulgaria automation',
  'OLX Portugal automation',
  'OLX Kazakhstan automation',
  'OLX crosslisting',
  'OLX listing tool',
];

const OlxCountryAccountsArticle = () => {
  const t = getTranslations(olxCountryAccountsTranslations);
  const language = getCurrentLanguage();
  const canonicalUrl =
    language === 'pl'
      ? 'https://myflipit.live/articles/automatyzacja-ogloszen-olx-wedlug-kraju'
      : 'https://myflipit.live/articles/olx-listing-automation-by-country';

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
    datePublished: '2026-06-15',
    dateModified: '2026-06-15',
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
  ];

  const faq = [
    { q: t.faq1Question, a: t.faq1Answer },
    { q: t.faq2Question, a: t.faq2Answer },
    { q: t.faq3Question, a: t.faq3Answer },
    { q: t.faq4Question, a: t.faq4Answer },
    { q: t.faq5Question, a: t.faq5Answer },
    { q: t.faq6Question, a: t.faq6Answer },
  ];

  const relatedLinks = [
    { text: t.relatedLink1, href: '/how-it-works' },
    { text: t.relatedLink2, href: '/automated-reselling-platform-guide' },
    {
      text: t.relatedLink3,
      href: getLocalizedPathForLanguage('/articles/vinted-relisting-tool', language),
    },
  ];

  const cta = {
    title: t.ctaTitle,
    description: t.ctaDescription,
    buttonText: t.ctaButtonText,
    buttonLink: '/get-started',
    footerText: t.ctaFooterText,
    footerLinkText: t.ctaFooterLinkText,
    footerLinkHref: '/login',
  };

  const highlights = [
    t.highlight1,
    t.highlight2,
    t.highlight3,
    t.highlight4,
    t.highlight5,
    t.highlight6,
  ];

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

export default OlxCountryAccountsArticle;
