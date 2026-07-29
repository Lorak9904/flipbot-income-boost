export const CANONICAL_LISTING_ANALYTICS_PATH = '/user/items/:item_id';
const LISTING_PATHS = [
  /^\/user\/items\/[^/]+(?:\/edit)?\/?$/,
  /^\/pl\/moje-ogloszenia\/[^/]+(?:\/edytuj)?\/?$/,
];

export const normalizeAnalyticsPath = (value: string): string => {
  const rawValue = value || '/';
  let pathname = rawValue.split(/[?#]/, 1)[0] || '/';

  try {
    if (/^https?:\/\//i.test(rawValue)) pathname = new URL(rawValue).pathname;
  } catch {
    return '/';
  }

  if (!pathname.startsWith('/')) return '/';
  return LISTING_PATHS.some((pattern) => pattern.test(pathname))
    ? CANONICAL_LISTING_ANALYTICS_PATH
    : pathname;
};

const sanitizeUrl = (value: unknown): unknown => {
  if (typeof value !== 'string') return value;
  try {
    const url = new URL(value);
    return `${url.origin}${normalizeAnalyticsPath(url.pathname)}`;
  } catch {
    return normalizeAnalyticsPath(value);
  }
};

export const sanitizePostHogEvent = <T extends { properties?: Record<string, unknown> }>(event: T): T => {
  if (!event.properties) return event;

  const properties = { ...event.properties };
  for (const key of ['$current_url', '$referrer', '$pathname', '$prev_pageview_pathname']) {
    if (key in properties) properties[key] = sanitizeUrl(properties[key]);
  }
  return { ...event, properties };
};
