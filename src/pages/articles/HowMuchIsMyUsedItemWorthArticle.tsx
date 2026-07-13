import { getCurrentLanguage, getTranslations } from '@/components/language-utils';
import { SeoArticleLayout } from '@/components/seo/SeoArticleLayout';
import { getRoutePath } from '@/lib/localized-routes';
import { howMuchIsMyUsedItemWorthTranslations } from './translations/how-much-is-my-used-item-worth.translations';

const keywords = [
  'how much is my used item worth',
  'used item price checker',
  'how to price a used phone',
  'how to price a used laptop',
  'how to price second hand furniture',
  'ile wart jest uzywany przedmiot',
  'jak wycenic uzywany telefon',
  'wycena uzywanego laptopa',
];

export default function HowMuchIsMyUsedItemWorthArticle() {
  const t = getTranslations(howMuchIsMyUsedItemWorthTranslations);
  const language = getCurrentLanguage();
  const canonicalUrl = `https://myflipit.live${getRoutePath('usedItemValueGuide', language)}`;
  const sections = Array.from({ length: 7 }, (_, index) => ({
    heading: t[`section${index + 1}Title`],
    bodyParagraphs: [t[`section${index + 1}Para1`], t[`section${index + 1}Para2`]],
  }));
  const faq = Array.from({ length: 4 }, (_, index) => ({
    q: t[`faq${index + 1}Question`],
    a: t[`faq${index + 1}Answer`],
  }));

  return (
    <SeoArticleLayout
      title={t.pageTitle}
      description={t.pageDescription}
      canonicalUrl={canonicalUrl}
      keywords={keywords}
      articleStructuredData={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: t.pageTitle,
        description: t.pageDescription,
        author: { '@type': 'Organization', name: 'FlipIt', url: 'https://myflipit.live' },
        publisher: { '@type': 'Organization', name: 'FlipIt' },
        mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
        datePublished: '2026-07-13',
        dateModified: '2026-07-13',
        keywords,
      }}
      heroLabel={t.heroLabel}
      heroTitle={t.heroTitle}
      heroTitleHighlight={t.heroTitleHighlight}
      heroSubtitle={t.heroSubtitle}
      heroBadges={[t.heroBadge1, t.heroBadge2, t.heroBadge3]}
      highlightsTitle={t.highlightsTitle}
      highlights={[t.highlight1, t.highlight2, t.highlight3]}
      sections={sections}
      faq={faq}
      cta={{
        title: t.ctaTitle,
        description: t.ctaDescription,
        buttonText: t.ctaButtonText,
        buttonLink: getRoutePath('priceChecker', language),
        footerText: t.ctaFooterText,
        footerLinkText: t.ctaFooterLinkText,
        footerLinkHref: getRoutePath('priceForEbay', language),
      }}
      relatedLinksTitle={t.relatedLinksTitle}
      relatedLinks={[
        { text: t.relatedLink1, href: getRoutePath('priceChecker', language) },
        { text: t.relatedLink2, href: getRoutePath('priceForEbay', language) },
        { text: t.relatedLink3, href: getRoutePath('ebayActiveVsSold', language) },
        { text: t.relatedLink4, href: getRoutePath('howItWorks', language) },
      ]}
      sourceLinksTitle={t.sourceLinksTitle}
      sourceLinks={[
        { text: t.source1, href: 'https://developer.ebay.com/api-docs/buy/static/api-browse.html' },
        { text: t.source2, href: 'https://developer.ebay.com/api-docs/buy/ref-marketplace-supported.html' },
      ]}
    />
  );
}
