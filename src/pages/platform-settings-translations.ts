import { Translations } from '../components/language-utils';

export const platformSettingsTranslations: Translations = {
  en: {
    // Page title & description
    pageTitle: 'Platform Settings',
    pageDescription: 'Configure pricing adjustments and address override for {platform}.',
    backToConnectedAccounts: 'Back to Connected Accounts',
    
    // Platform names
    platformFacebook: 'Facebook Marketplace',
    platformOlx: 'OLX',
    platformVinted: 'Vinted',
    platformEbay: 'eBay',
    
    // Pricing section
    pricingTitle: 'Pricing Adjustments',
    pricingDescription: 'Automatically adjust prices for listings on this platform.',
    marginLabel: 'Margin Multiplier',
    marginPlaceholder: '1.0',
    marginHelperText: '1.0 = same price, 1.1 = +10%, 0.9 = -10%',
    surchargeLabel: 'Fixed Surcharge',
    surchargePlaceholder: '0.00',
    surchargeHelperText: 'Fixed amount added after margin (can be negative)',
    
    // Address section
    addressTitle: 'Address Override',
    addressDescription: 'Override your default address for this platform. Leave empty to use your general address.',
    addressCityLabel: 'City',
    addressCityPlaceholder: 'Enter city',
    addressPostalCodeLabel: 'Postal Code',
    addressPostalCodePlaceholder: 'Enter postal code',
    addressCountryLabel: 'Country',
    addressCountryPlaceholder: 'Enter country',
    addressStreetLabel: 'Street Address (optional)',
    addressStreetPlaceholder: 'Enter street address',
    syncAddressButton: 'Sync from General Settings',
    syncAddressSuccess: 'Address synced from general settings',
    syncAddressError: 'Failed to sync address. Make sure you have set your default address in General Settings.',
    
    // Save button
    saveButton: 'Save Settings',
    savingButton: 'Saving…',
    
    // Toast messages
    toastSettingsSavedTitle: 'Settings saved',
    toastSettingsSavedDescription: 'Your {platform} settings have been updated successfully.',
    toastErrorTitle: 'Error',
    toastLoadError: 'Failed to load settings',
  },
  pl: {
    // Page title & description
    pageTitle: 'Ustawienia platformy',
    pageDescription: 'Skonfiguruj korekty cen i adres dla {platform}.',
    backToConnectedAccounts: 'Powrót do połączonych kont',
    
    // Platform names
    platformFacebook: 'Facebook Marketplace',
    platformOlx: 'OLX',
    platformVinted: 'Vinted',
    platformEbay: 'eBay',
    
    // Pricing section
    pricingTitle: 'Korekty cen',
    pricingDescription: 'Automatycznie dostosuj ceny ogłoszeń na tej platformie.',
    marginLabel: 'Mnożnik marży',
    marginPlaceholder: '1.0',
    marginHelperText: '1.0 = ta sama cena, 1.1 = +10%, 0.9 = -10%',
    surchargeLabel: 'Stała dopłata',
    surchargePlaceholder: '0.00',
    surchargeHelperText: 'Stała kwota dodawana po marży (może być ujemna)',
    
    // Address section
    addressTitle: 'Nadpisanie adresu',
    addressDescription: 'Nadpisz swój domyślny adres dla tej platformy. Zostaw puste, aby używać adresu ogólnego.',
    addressCityLabel: 'Miasto',
    addressCityPlaceholder: 'Wprowadź miasto',
    addressPostalCodeLabel: 'Kod pocztowy',
    addressPostalCodePlaceholder: 'Wprowadź kod pocztowy',
    addressCountryLabel: 'Kraj',
    addressCountryPlaceholder: 'Wprowadź kraj',
    addressStreetLabel: 'Adres (opcjonalnie)',
    addressStreetPlaceholder: 'Wprowadź adres ulicy',
    syncAddressButton: 'Synchronizuj z ustawieniami ogólnymi',
    syncAddressSuccess: 'Adres zsynchronizowany z ustawieniami ogólnymi',
    syncAddressError: 'Nie udało się zsynchronizować adresu. Upewnij się, że masz ustawiony domyślny adres w Ustawieniach ogólnych.',
    
    // Save button
    saveButton: 'Zapisz ustawienia',
    savingButton: 'Zapisuję…',
    
    // Toast messages
    toastSettingsSavedTitle: 'Ustawienia zapisane',
    toastSettingsSavedDescription: 'Twoje ustawienia dla {platform} zostały zaktualizowane pomyślnie.',
    toastErrorTitle: 'Błąd',
    toastLoadError: 'Nie udało się załadować ustawień',
  },
};
