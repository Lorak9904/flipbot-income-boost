
import { useState } from 'react';

export type Language = 'pl' | 'en';

export const useLanguage = () => {
  const [language, setLanguage] = useState<Language>('pl');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'pl' ? 'en' : 'pl');
  };

  return { language, setLanguage, toggleLanguage };
};
