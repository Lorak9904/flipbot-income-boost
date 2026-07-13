import metadata from './seo-page-metadata.json';

import type { AppLanguage, LocalizedRouteKey } from './localized-routes';

type SeoMetadata = { title: string; description: string };
type SeoMetadataRouteKey = keyof typeof metadata;

export function getSeoMetadata(
  routeKey: LocalizedRouteKey,
  language: AppLanguage,
): SeoMetadata | null {
  const routeMetadata = metadata[routeKey as SeoMetadataRouteKey];
  return routeMetadata?.[language] ?? null;
}
