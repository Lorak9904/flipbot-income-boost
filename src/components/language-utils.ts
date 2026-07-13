// Language utility functions for FlipIt application
import { updateUserLanguage } from '@/lib/api/user';
import { LISTING_EDITOR_DRAFT_SAVE_EVENT } from '@/lib/listing-editor-draft';
import {
  getLocalizedPath,
  getPathLanguage,
  type AppLanguage,
} from '@/lib/localized-routes';

export type Language = AppLanguage;

export const getLocalizedPathForLanguage = (pathname: string, lang: Language): string => {
  const hashIndex = pathname.indexOf('#');
  const hash = hashIndex >= 0 ? pathname.slice(hashIndex) : '';
  const withoutHash = hashIndex >= 0 ? pathname.slice(0, hashIndex) : pathname;
  const queryIndex = withoutHash.indexOf('?');
  const query = queryIndex >= 0 ? withoutHash.slice(queryIndex) : '';
  const path = queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash;
  return `${getLocalizedPath(path || '/', lang)}${query}${hash}`;
};

export const getLocalizedPathForCurrentLanguage = (pathname: string): string => {
  const lang = getCurrentLanguage();
  return getLocalizedPathForLanguage(pathname, lang);
};

// Get current language from cookie
export const getCurrentLanguage = (): Language => {
  if (typeof window !== 'undefined') {
    const routeLanguage = getPathLanguage(window.location.pathname);
    if (routeLanguage) return routeLanguage;
  }

  const match = typeof document !== 'undefined'
    ? document.cookie.match(/(?:^|; )lang=(pl|en)/)
    : null;
  return (match?.[1] as Language) || 'en';
};

// Set language in cookie (internal helper)
const setLanguageCookie = (lang: Language): void => {
  document.cookie = `lang=${lang}; path=/; max-age=31536000`; // 1 year
};

// Set language - handles both cookie and backend persistence for authenticated users
export const setLanguage = async (lang: Language): Promise<void> => {
  const token = localStorage.getItem('flipit_token');
  
  // If user is authenticated, persist to backend first

  if (token) {
    try {
      await updateUserLanguage(lang);
      console.log(`✅ Language preference saved to database: ${lang}`);
    } catch (error) {
      console.warn('⚠️  Failed to save language to backend, setting cookie only:', error);
      // Continue anyway - cookie fallback
    }
  }
  
  // Always set cookie (backend also sets it, but we ensure it locally too)
  setLanguageCookie(lang);
  window.dispatchEvent(new Event(LISTING_EDITOR_DRAFT_SAVE_EVENT));

  const targetPath = getLocalizedPathForLanguage(window.location.pathname, lang);
  if (targetPath !== window.location.pathname) {
    window.location.assign(`${targetPath}${window.location.search}${window.location.hash}`);
    return;
  }

  // Reload to apply language change across the app
  window.location.reload();
};

// Toggle between languages (async to support backend persistence)
export const toggleLanguage = async (): Promise<void> => {
  const currentLang = getCurrentLanguage();
  console.log("current language is", currentLang);
  const newLang = currentLang === 'en' ? 'pl' : 'en';
  console.log("toggling language to", newLang);
  await setLanguage(newLang);
};

// Translation type definitions
export interface Translations {
  // Page translation maps include strings and small formatting functions across the app.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  en: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pl: Record<string, any>;
}

// Get translations for current language
export const getTranslations = <T extends Translations>(translations: T): T['en'] | T['pl'] => {
  const lang = getCurrentLanguage();
  return translations[lang];
};

