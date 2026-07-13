import { Translations } from './language-utils';

export const navbarTranslations: Translations = {
  en: {
    howItWorks: 'How It Works',
    guide: 'Marketplace Automation Guide',
    tutorials: 'Tutorials',
    pricing: 'Pricing',
    resources: 'Resources',
    successStories: 'Success Stories',
    faq: 'FAQ',
    addItem: 'Add listing',
    myItems: 'My Listings',
    stats: 'Stats',
    connectAccounts: 'Connect Accounts',
    login: 'Log in',
    signup: 'Sign up',
    languageToggle: 'PL', // Shows what language to switch TO
    unlimitedListings: 'listings',
    remainingListings: (count: number) => count === 1 ? 'listing left' : 'listings left',
    publishCredits: 'Publishing credits:',
    imageCredits: 'Image credits:',
    creditDetails: 'Open credit details',
    publishCreditsShort: 'publishing credits',
    manage: 'Manage',
    tapForDetails: 'Open details',
    toggleMenu: 'Toggle navigation',
    switchLanguage: 'Switch to Polish',
  },
  pl: {
    howItWorks: 'Jak to działa',
    guide: 'Przewodnik po automatyzacji ogłoszeń',
    tutorials: 'Poradniki',
    pricing: 'Cennik',
    resources: 'Zasoby',
    successStories: 'Historie sukcesu',
    faq: 'FAQ',
    addItem: 'Dodaj ogłoszenie',
    myItems: 'Moje ogłoszenia',
    stats: 'Statystyki',
    connectAccounts: 'Połącz konta',
    login: 'Zaloguj się',
    signup: 'Załóż konto',
    languageToggle: 'EN', // Shows what language to switch TO
    unlimitedListings: 'ogłoszeń',
    remainingListings: (count: number) => {
      if (count === 1) return 'ogłoszenie do wykorzystania';
      if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14)) {
        return 'ogłoszenia do wykorzystania';
      }
      return 'ogłoszeń do wykorzystania';
    },
    publishCredits: 'Kredyty publikacji:',
    imageCredits: 'Kredyty zdjęć:',
    creditDetails: 'Otwórz szczegóły kredytów',
    publishCreditsShort: 'kredytów publikacji',
    manage: 'Zarządzaj',
    tapForDetails: 'Otwórz szczegóły',
    toggleMenu: 'Otwórz lub zamknij nawigację',
    switchLanguage: 'Przełącz na angielski',
  }
};
