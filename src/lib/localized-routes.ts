import routeManifest from './localized-routes.json';

export type AppLanguage = 'en' | 'pl';

export interface LocalizedRouteDefinition {
  en: string;
  pl: string;
  indexable: boolean;
}

export const localizedRoutes = routeManifest.routes satisfies Record<
  string,
  LocalizedRouteDefinition
>;

export type LocalizedRouteKey = keyof typeof localizedRoutes;

export interface LocalizedRouteMatch {
  key: LocalizedRouteKey;
  language: AppLanguage;
  params: Record<string, string>;
  isLegacyAlias: boolean;
}

export interface LegacyLocalizedRoute {
  path: string;
  key: LocalizedRouteKey;
  language: AppLanguage;
}

export const legacyLocalizedRoutes = routeManifest.legacyAliases as LegacyLocalizedRoute[];

const normalizePath = (pathname: string): string => {
  if (!pathname) return '/';
  const withoutQuery = pathname.split(/[?#]/, 1)[0] || '/';
  return withoutQuery !== '/' && withoutQuery.endsWith('/')
    ? withoutQuery.slice(0, -1)
    : withoutQuery;
};

const matchPattern = (pattern: string, pathname: string): Record<string, string> | null => {
  const patternParts = normalizePath(pattern).split('/').filter(Boolean);
  const pathParts = normalizePath(pathname).split('/').filter(Boolean);
  if (patternParts.length !== pathParts.length) return null;

  const params: Record<string, string> = {};
  for (let index = 0; index < patternParts.length; index += 1) {
    const patternPart = patternParts[index];
    const pathPart = pathParts[index];
    if (patternPart.startsWith(':')) {
      params[patternPart.slice(1)] = decodeURIComponent(pathPart);
      continue;
    }
    if (patternPart !== pathPart) return null;
  }
  return params;
};

const buildPath = (pattern: string, params: Record<string, string> = {}): string =>
  pattern.replace(/:([A-Za-z0-9_]+)/g, (_match, key: string) => {
    const value = params[key];
    return value === undefined ? `:${key}` : encodeURIComponent(value);
  });

export const matchLocalizedRoute = (pathname: string): LocalizedRouteMatch | null => {
  for (const [key, definition] of Object.entries(localizedRoutes) as Array<
    [LocalizedRouteKey, LocalizedRouteDefinition]
  >) {
    for (const language of ['en', 'pl'] as const) {
      const params = matchPattern(definition[language], pathname);
      if (params) return { key, language, params, isLegacyAlias: false };
    }
  }

  for (const alias of legacyLocalizedRoutes) {
    const params = matchPattern(alias.path, pathname);
    if (params) {
      return {
        key: alias.key,
        language: alias.language,
        params,
        isLegacyAlias: true,
      };
    }
  }
  return null;
};

export const getRoutePath = (
  key: LocalizedRouteKey,
  language: AppLanguage,
  params: Record<string, string> = {},
): string => buildPath(localizedRoutes[key][language], params);

export const getLocalizedRoutePaths = (key: LocalizedRouteKey): [string, string] => [
  localizedRoutes[key].en,
  localizedRoutes[key].pl,
];

export const getLocalizedPath = (pathname: string, language: AppLanguage): string => {
  const match = matchLocalizedRoute(pathname);
  if (match) return getRoutePath(match.key, language, match.params);

  const normalized = normalizePath(pathname);
  if (language === 'pl') return normalized === '/' ? '/pl' : `/pl${normalized}`;
  return normalized === '/pl' ? '/' : normalized.replace(/^\/pl(?=\/)/, '');
};

export const getPathLanguage = (pathname: string): AppLanguage | null => {
  const match = matchLocalizedRoute(pathname);
  if (match) return match.language;
  return normalizePath(pathname) === '/pl' || normalizePath(pathname).startsWith('/pl/')
    ? 'pl'
    : null;
};

export const getLocalizedSeoUrls = (pathname: string, siteUrl = 'https://myflipit.live') => {
  const match = matchLocalizedRoute(pathname);
  if (!match) return null;

  const definition = localizedRoutes[match.key];
  const enPath = getRoutePath(match.key, 'en', match.params);
  const plPath = getRoutePath(match.key, 'pl', match.params);
  const currentPath = getRoutePath(match.key, match.language, match.params);
  return {
    language: match.language,
    indexable: definition.indexable,
    canonicalUrl: `${siteUrl}${currentPath === '/' ? '/' : currentPath}`,
    alternateUrls: [
      { hrefLang: 'en', href: `${siteUrl}${enPath === '/' ? '/' : enPath}` },
      { hrefLang: 'pl', href: `${siteUrl}${plPath}` },
      { hrefLang: 'x-default', href: `${siteUrl}${enPath === '/' ? '/' : enPath}` },
    ],
  };
};

export const indexableRouteKeys = (
  Object.entries(localizedRoutes) as Array<[LocalizedRouteKey, LocalizedRouteDefinition]>
)
  .filter(([, route]) => route.indexable)
  .map(([key]) => key);
