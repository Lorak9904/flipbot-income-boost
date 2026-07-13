interface ClientSeoConfig {
  title: string;
  description: string;
  canonicalUrl: string;
  alternateUrls: Array<{ hrefLang: string; href: string }>;
  language: string;
  robots?: string;
  keywords: string;
  type: 'website' | 'article';
  imageUrl: string;
  structuredData: Record<string, unknown>[];
}

const upsertMeta = (attribute: 'name' | 'property', key: string, content: string) => {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
};

const upsertLink = (rel: string, href: string) => {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.rel = rel;
    document.head.appendChild(element);
  }
  element.href = href;
  return element;
};

export const syncClientSeo = ({
  title,
  description,
  canonicalUrl,
  alternateUrls,
  language,
  robots,
  keywords,
  type,
  imageUrl,
  structuredData,
}: ClientSeoConfig) => {
  document.title = title;
  document.documentElement.lang = language;

  upsertMeta('name', 'title', title);
  upsertMeta('name', 'description', description);
  upsertMeta('name', 'keywords', keywords);
  if (robots) {
    upsertMeta('name', 'robots', robots);
  } else {
    document.head.querySelector('meta[name="robots"]')?.remove();
  }

  upsertMeta('property', 'og:type', type);
  upsertMeta('property', 'og:url', canonicalUrl);
  upsertMeta('property', 'og:title', title);
  upsertMeta('property', 'og:description', description);
  upsertMeta('property', 'og:image', imageUrl);
  upsertMeta('property', 'og:site_name', 'FlipIt');
  upsertMeta('property', 'og:locale', language === 'pl' ? 'pl_PL' : 'en_US');
  upsertMeta('property', 'og:locale:alternate', language === 'pl' ? 'en_US' : 'pl_PL');

  upsertMeta('name', 'twitter:card', 'summary_large_image');
  upsertMeta('name', 'twitter:url', canonicalUrl);
  upsertMeta('name', 'twitter:title', title);
  upsertMeta('name', 'twitter:description', description);
  upsertMeta('name', 'twitter:image', imageUrl);

  upsertLink('canonical', canonicalUrl);
  document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((element) => element.remove());
  alternateUrls.forEach(({ hrefLang, href }) => {
    const element = document.createElement('link');
    element.rel = 'alternate';
    element.hreflang = hrefLang;
    element.href = href;
    element.dataset.flipitSeo = 'alternate';
    document.head.appendChild(element);
  });

  document.head
    .querySelectorAll('script[type="application/ld+json"][data-flipit-seo], script[type="application/ld+json"][data-seo-prerender]')
    .forEach((element) => element.remove());
  structuredData.forEach((data) => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.flipitSeo = 'structured-data';
    script.text = JSON.stringify(data).replaceAll('<', '\\u003c');
    document.head.appendChild(script);
  });
};
