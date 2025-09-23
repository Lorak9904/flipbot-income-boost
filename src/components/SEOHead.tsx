import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  type?: 'website' | 'article';
}

export function SEOHead({
  title = 'FlipIt - Turn Online Finds into Real Profits',
  description = 'FlipIt scans marketplaces, finds undervalued items, and helps you resell them for profit — all on autopilot. Start earning extra income today!',
  canonicalUrl = 'https://myflipit.live',
  ogImage = '/og-image.jpg',
  type = 'website',
}: SEOProps) {
  const siteTitle = title.includes('FlipIt') ? title : `${title} | FlipIt`;

  return (
    <Helmet>
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

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={siteTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />

      {/* Additional SEO tags */}
      <link rel="canonical" href={canonicalUrl} />
      <meta name="keywords" content="online reselling, flipit, marketplace automation, profit automation, olx automation, vinted automation, ecommerce tools, reselling automation, online arbitrage, reselling bot" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'FlipIt',
          description,
          url: canonicalUrl,
        })}
      </script>
    </Helmet>
  );
}
