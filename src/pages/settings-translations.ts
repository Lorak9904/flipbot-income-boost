import { Translations } from '../components/language-utils';

export const settingsTranslations: Translations = {
  en: {
    // Page title & description
    pageTitle: 'Account Settings',
    pageDescription: 'Manage your profile, marketplace connections and notifications.',
    
    // Language toggle
    languageToggle: 'EN',
    
    // Profile section
    profileTitle: 'Profile',
    displayNameLabel: 'Display Name',
    emailLabel: 'Email',
    
    // Password section
    passwordTitle: 'Change Password',
    currentPasswordLabel: 'Current Password',
    currentPasswordPlaceholder: 'Enter current password',
    newPasswordLabel: 'New Password',
    newPasswordPlaceholder: 'Enter new password (min 8 characters)',
    confirmPasswordLabel: 'Confirm New Password',
    confirmPasswordPlaceholder: 'Confirm new password',
    changePasswordButton: 'Change Password',
    changingPasswordButton: 'Changing Password...',
    
    // Marketplaces section
    marketplacesTitle: 'Marketplaces',
    facebookMarketplace: 'Facebook Marketplace',
    allegro: 'Allegro',
    
    // Address section
    addressTitle: 'Default Address',
    addressDescription: 'This address will be used as the default for all marketplace listings. You can override it per-platform.',
    addressCityLabel: 'City',
    addressCityPlaceholder: 'Enter your city',
    addressPostalCodeLabel: 'Postal Code',
    addressPostalCodePlaceholder: 'Enter postal code',
    addressCountryLabel: 'Country',
    addressCountryPlaceholder: 'Enter your country',
    addressStreetLabel: 'Street Address (optional)',
    addressStreetPlaceholder: 'Enter street address',
    
    // Notifications section
    notificationsTitle: 'Notifications',
    productUpdates: 'Product updates & tips',
    
    // Save button
    saveButton: 'Save Profile Settings',
    savingButton: 'Saving…',
    
    // Danger zone
    dangerZoneTitle: 'Danger Zone',
    dangerZoneDescription: 'Once you delete your account, there is no going back. This action will permanently delete your account, all your items, and all associated data.',
    deleteAccountButton: 'Delete Account',
    
    // Delete confirmation dialog
    deleteDialogTitle: 'Are you absolutely sure?',
    deleteDialogDescription: 'This action cannot be undone. This will permanently delete your account and remove all your data from our servers, including:',
    deleteDialogListItem1: 'All your listed items',
    deleteDialogListItem2: 'Your profile information',
    deleteDialogListItem3: 'All marketplace connections',
    deleteDialogListItem4: 'All item statistics and history',
    deleteDialogCancel: 'Cancel',
    deleteDialogConfirm: 'Yes, delete my account',
    deletingDialogConfirm: 'Deleting...',
    
    // Toast messages
    toastSettingsSavedTitle: 'Settings saved',
    toastSettingsSavedDescription: 'Your profile has been updated successfully.',
    toastErrorTitle: 'Error',
    toastPasswordChangedTitle: 'Password changed',
    toastPasswordChangedDescription: 'Your password has been updated successfully',
    toastMissingFieldsTitle: 'Missing fields',
    toastMissingFieldsDescription: 'Please fill in all password fields',
    toastPasswordsNoMatchTitle: 'Passwords do not match',
    toastPasswordsNoMatchDescription: 'New password and confirmation must match',
    toastPasswordTooShortTitle: 'Password too short',
    toastPasswordTooShortDescription: 'Password must be at least 8 characters',
    toastAccountDeletedTitle: 'Account deleted',
    toastAccountDeletedDescription: 'Your account has been permanently deleted',
  },
  pl: {
    // Page title & description
    pageTitle: 'Ustawienia konta',
    pageDescription: 'Zarządzaj swoim profilem, połączeniami z platformami i powiadomieniami.',
    
    // Language toggle
    languageToggle: 'PL',
    
    // Profile section
    profileTitle: 'Profil',
    displayNameLabel: 'Nazwa wyświetlana',
    emailLabel: 'Email',
    
    // Password section
    passwordTitle: 'Zmień hasło',
    currentPasswordLabel: 'Obecne hasło',
    currentPasswordPlaceholder: 'Wprowadź obecne hasło',
    newPasswordLabel: 'Nowe hasło',
    newPasswordPlaceholder: 'Wprowadź nowe hasło (min. 8 znaków)',
    confirmPasswordLabel: 'Potwierdź nowe hasło',
    confirmPasswordPlaceholder: 'Potwierdź nowe hasło',
    changePasswordButton: 'Zmień hasło',
    changingPasswordButton: 'Zmieniam hasło...',
    
    // Marketplaces section
    marketplacesTitle: 'Platformy',
    facebookMarketplace: 'Facebook Marketplace',
    allegro: 'Allegro',
    
    // Address section
    addressTitle: 'Domyślny adres',
    addressDescription: 'Ten adres będzie używany jako domyślny dla wszystkich ogłoszeń. Możesz go nadpisać dla każdej platformy osobno.',
    addressCityLabel: 'Miasto',
    addressCityPlaceholder: 'Wprowadź miasto',
    addressPostalCodeLabel: 'Kod pocztowy',
    addressPostalCodePlaceholder: 'Wprowadź kod pocztowy',
    addressCountryLabel: 'Kraj',
    addressCountryPlaceholder: 'Wprowadź kraj',
    addressStreetLabel: 'Adres ',
    addressStreetPlaceholder: 'Wprowadź adres ulicy',
    
    // Notifications section
    notificationsTitle: 'Powiadomienia',
    productUpdates: 'Aktualizacje produktu i wskazówki',
    
    // Save button
    saveButton: 'Zapisz ustawienia profilu',
    savingButton: 'Zapisuję…',
    
    // Danger zone
    dangerZoneTitle: 'Strefa niebezpieczna',
    dangerZoneDescription: 'Po usunięciu konta nie ma odwrotu. Ta akcja trwale usunie Twoje konto, wszystkie ogłoszenia i powiązane dane.',
    deleteAccountButton: 'Usuń konto',
    
    // Delete confirmation dialog
    deleteDialogTitle: 'Czy na pewno chcesz to zrobić?',
    deleteDialogDescription: 'Ta akcja jest nieodwracalna. Spowoduje trwałe usunięcie Twojego konta i wszystkich danych z naszych serwerów, w tym:',
    deleteDialogListItem1: 'Wszystkie Twoje ogłoszenia',
    deleteDialogListItem2: 'Informacje o Twoim profilu',
    deleteDialogListItem3: 'Wszystkie połączenia z platformami',
    deleteDialogListItem4: 'Wszystkie statystyki i historię',
    deleteDialogCancel: 'Anuluj',
    deleteDialogConfirm: 'Tak, usuń moje konto',
    deletingDialogConfirm: 'Usuwam...',
    
    // Toast messages
    toastSettingsSavedTitle: 'Ustawienia zapisane',
    toastSettingsSavedDescription: 'Twój profil został zaktualizowany pomyślnie.',
    toastErrorTitle: 'Błąd',
    toastPasswordChangedTitle: 'Hasło zmienione',
    toastPasswordChangedDescription: 'Twoje hasło zostało zaktualizowane pomyślnie',
    toastMissingFieldsTitle: 'Brakujące pola',
    toastMissingFieldsDescription: 'Proszę wypełnić wszystkie pola hasła',
    toastPasswordsNoMatchTitle: 'Hasła się nie zgadzają',
    toastPasswordsNoMatchDescription: 'Nowe hasło i potwierdzenie muszą być takie same',
    toastPasswordTooShortTitle: 'Hasło za krótkie',
    toastPasswordTooShortDescription: 'Hasło musi mieć co najmniej 8 znaków',
    toastAccountDeletedTitle: 'Konto usunięte',
    toastAccountDeletedDescription: 'Twoje konto zostało trwale usunięte',
  },
};
