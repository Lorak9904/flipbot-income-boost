// Language utility functions for FlipIt application
export type Language = 'en' | 'pl';

// Get current language from cookie
export const getCurrentLanguage = (): Language => {
  const match = document.cookie.match(/(?:^|; )lang=(pl|en)/);
  return (match?.[1] as Language) || 'en';
};

// Set language in cookie
export const setLanguage = (lang: Language): void => {
  document.cookie = `lang=${lang}; path=/; max-age=31536000`; // 1 year
  window.location.reload(); // Reload to apply language change
};

// Toggle between languages
export const toggleLanguage = (): void => {
  const currentLang = getCurrentLanguage();
  const newLang = currentLang === 'en' ? 'pl' : 'en';
  setLanguage(newLang);
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

