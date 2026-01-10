import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  type?: 'website' | 'article';
  keywords?: string | string[];
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
  language?: string;
  robots?: string;
}

export function SEOHead({
  title = 'FlipIt - AI-Assisted Crosslisting for Faster Listings',
  description = 'FlipIt turns your product photos into marketplace-ready listings with AI. Review, edit, and publish faster — always with your approval.',
  canonicalUrl = 'https://myflipit.live',
  ogImage = '/placeholder.svg',
  type = 'website',
  keywords,
  structuredData,
  language = 'en',
  robots,
}: SEOProps) {
  const siteTitle = title.includes('FlipIt') ? title : `${title} | FlipIt`;
  const keywordContent = Array.isArray(keywords)
    ? keywords.join(', ')
    : keywords ?? 'flipit, crosslisting, marketplace listing tool, AI listing generator, marketplace automation, OLX listing tool, Vinted listing tool, Facebook Marketplace listing tool, eBay listing tool, reseller tools, ecommerce automation';

  const websiteStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'FlipIt',
    description,
    url: canonicalUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${canonicalUrl}?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };

  const organizationStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'FlipIt',
    url: 'https://myflipit.live',
    logo: 'https://myflipit.live/favicon.ico'
  };

  const structuredDataList = Array.isArray(structuredData)
    ? [websiteStructuredData, organizationStructuredData, ...structuredData]
    : structuredData
      ? [websiteStructuredData, organizationStructuredData, structuredData]
      : [websiteStructuredData, organizationStructuredData];

  const locale = language === 'pl' ? 'pl_PL' : 'en_US';

  return (
    <Helmet htmlAttributes={{ lang: language }}>
      {/* Primary Meta Tags */}
      <title>{siteTitle}</title>
      <meta name="title" content={siteTitle} />
      <meta name="description" content={description} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="FlipIt" />
      <meta property="og:locale" content={locale} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={siteTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />

      {/* Additional SEO tags */}
      <link rel="canonical" href={canonicalUrl} />
      <meta name="keywords" content={keywordContent} />
      {robots && <meta name="robots" content={robots} />}

      {/* Structured Data */}
      {structuredDataList.map((data, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
    </Helmet>
  );
}
