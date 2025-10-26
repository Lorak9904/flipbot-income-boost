// Language utility functions for FlipIt application
import { updateUserLanguage } from '@/lib/api/user';

export type Language = 'en' | 'pl';

// Get current language from cookie
export const getCurrentLanguage = (): Language => {
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

