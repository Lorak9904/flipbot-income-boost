// Language utility functions for FlipIt application
import { updateUserLanguage } from '@/lib/api/user';

export type Language = 'en' | 'pl';

const localizedRouteMap: Record<string, { en: string; pl: string }> = {
  '/articles/jak-sprzedawac-na-allegro': {
    en: '/articles/how-to-sell-on-allegro',
    pl: '/articles/jak-sprzedawac-na-allegro',
  },
  '/articles/how-to-sell-on-allegro': {
    en: '/articles/how-to-sell-on-allegro',
    pl: '/articles/jak-sprzedawac-na-allegro',
  },
  '/articles/vinted-relisting-tool': {
    en: '/articles/vinted-relisting-tool',
    pl: '/articles/odswiezanie-ogloszen-vinted',
  },
  '/articles/odswiezanie-ogloszen-vinted': {
    en: '/articles/vinted-relisting-tool',
    pl: '/articles/odswiezanie-ogloszen-vinted',
  },
  '/articles/cross-list-vinted-to-facebook-marketplace': {
    en: '/articles/cross-list-vinted-to-facebook-marketplace',
    pl: '/articles/crosslisting-z-vinted-na-facebook-marketplace',
  },
  '/articles/crosslisting-z-vinted-na-facebook-marketplace': {
    en: '/articles/cross-list-vinted-to-facebook-marketplace',
    pl: '/articles/crosslisting-z-vinted-na-facebook-marketplace',
  },
  '/articles/product-relister-for-vinted': {
    en: '/articles/product-relister-for-vinted',
    pl: '/articles/relister-produktow-vinted',
  },
  '/articles/relister-produktow-vinted': {
    en: '/articles/product-relister-for-vinted',
    pl: '/articles/relister-produktow-vinted',
  },
  '/articles/how-to-price-items-for-ebay': {
    en: '/articles/how-to-price-items-for-ebay',
    pl: '/articles/jak-wycenic-przedmiot-na-ebay',
  },
  '/articles/jak-wycenic-przedmiot-na-ebay': {
    en: '/articles/how-to-price-items-for-ebay',
    pl: '/articles/jak-wycenic-przedmiot-na-ebay',
  },
  '/articles/ebay-active-listings-vs-sold-prices': {
    en: '/articles/ebay-active-listings-vs-sold-prices',
    pl: '/articles/aktywne-oferty-ebay-a-ceny-sprzedazy',
  },
  '/articles/aktywne-oferty-ebay-a-ceny-sprzedazy': {
    en: '/articles/ebay-active-listings-vs-sold-prices',
    pl: '/articles/aktywne-oferty-ebay-a-ceny-sprzedazy',
  },
  '/articles/olx-listing-automation-by-country': {
    en: '/articles/olx-listing-automation-by-country',
    pl: '/articles/automatyzacja-ogloszen-olx-wedlug-kraju',
  },
  '/articles/automatyzacja-ogloszen-olx-wedlug-kraju': {
    en: '/articles/olx-listing-automation-by-country',
    pl: '/articles/automatyzacja-ogloszen-olx-wedlug-kraju',
  },
};

export const getLocalizedPathForLanguage = (pathname: string, lang: Language): string => {
  const normalized = pathname !== '/' && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  const mapping = localizedRouteMap[normalized];
  return mapping ? mapping[lang] : pathname;
};

export const getLocalizedPathForCurrentLanguage = (pathname: string): string => {
  const lang = getCurrentLanguage();
  return getLocalizedPathForLanguage(pathname, lang);
};

// Get current language from cookie
export const getCurrentLanguage = (): Language => {
  if (typeof window !== 'undefined') {
    const pathname =
      window.location.pathname !== '/' && window.location.pathname.endsWith('/')
        ? window.location.pathname.slice(0, -1)
        : window.location.pathname;
    const mapping = localizedRouteMap[pathname];

    if (mapping?.pl === pathname) {
      return 'pl';
    }

    if (mapping?.en === pathname) {
      return 'en';
    }
  }

  const match = document.cookie.match(/(?:^|; )lang=(pl|en)/);
  return (match?.[1] as Language) || 'en';
};

// Set language in cookie (internal helper)
const setLanguageCookie = (lang: Language): void => {
  document.cookie = `lang=${lang}; path=/; max-age=31536000`; // 1 year
};

// Set language - handles both cookie and backend persistence for authenticated users
export const setLanguage = async (lang: Language): Promise<void> => {
  const token = localStorage.getItem('flipit_token');
  console.log("setting language to", lang);
  console.log("token is", token);
  
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
  en: Record<string, any>;
  pl: Record<string, any>;
}

// Get translations for current language
export const getTranslations = <T extends Translations>(translations: T): T['en'] | T['pl'] => {
  const lang = getCurrentLanguage();
  return translations[lang];
};

