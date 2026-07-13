import { useEffect, useMemo } from 'react';

import { syncClientSeo } from '@/lib/client-seo';
import { getLocalizedSeoUrls } from '@/lib/localized-routes';

interface SEOProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  alternateUrls?: Array<{ hrefLang: string; href: string }>;
  ogImage?: string;
  type?: 'website' | 'article';
  keywords?: string | string[];
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
  language?: string;
  robots?: string;
}

const SITE_URL = 'https://myflipit.live';

export function SEOHead({
  title = 'FlipIt - AI-Assisted Crosslisting for Faster Listings',
  description = 'FlipIt turns your product photos into marketplace-ready listings with AI. Review, edit, and publish faster - always with your approval.',
  canonicalUrl = SITE_URL,
  alternateUrls = [],
  ogImage = '/placeholder.svg',
  type = 'website',
  keywords,
  structuredData,
  language = 'en',
  robots,
}: SEOProps) {
  const routeSeo = typeof window === 'undefined'
    ? null
    : getLocalizedSeoUrls(window.location.pathname, SITE_URL);
  const resolvedCanonicalUrl = routeSeo?.canonicalUrl ?? canonicalUrl;
  const resolvedAlternateUrls = routeSeo?.alternateUrls ?? alternateUrls;
  const resolvedLanguage = routeSeo?.language ?? language;
  const resolvedRobots = robots ?? (routeSeo && !routeSeo.indexable ? 'noindex, nofollow' : undefined);
  const siteTitle = title.includes('FlipIt') ? title : `${title} | FlipIt`;
  const keywordContent = Array.isArray(keywords)
    ? keywords.join(', ')
    : keywords ?? 'flipit, crosslisting, marketplace listing tool, AI listing generator, marketplace automation, OLX listing tool, Vinted listing tool, Facebook Marketplace listing tool, eBay listing tool, Allegro listing tool, Etsy listing tool, reseller tools, ecommerce automation';

  const structuredDataList = useMemo(() => {
    const websiteStructuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'FlipIt',
      description,
      url: SITE_URL,
    };
    const organizationStructuredData = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'FlipIt',
      url: SITE_URL,
      logo: `${SITE_URL}/favicon.ico`,
    };

    return Array.isArray(structuredData)
      ? [websiteStructuredData, organizationStructuredData, ...structuredData]
      : structuredData
        ? [websiteStructuredData, organizationStructuredData, structuredData]
        : [websiteStructuredData, organizationStructuredData];
  }, [description, structuredData]);

  useEffect(() => {
    syncClientSeo({
      title: siteTitle,
      description,
      canonicalUrl: resolvedCanonicalUrl,
      alternateUrls: resolvedAlternateUrls,
      language: resolvedLanguage,
      robots: resolvedRobots,
      keywords: keywordContent,
      type,
      imageUrl: ogImage.startsWith('http') ? ogImage : `${SITE_URL}${ogImage}`,
      structuredData: structuredDataList,
    });
  }, [
    description,
    keywordContent,
    ogImage,
    resolvedAlternateUrls,
    resolvedCanonicalUrl,
    resolvedLanguage,
    resolvedRobots,
    siteTitle,
    structuredDataList,
    type,
  ]);

  return null;
}
