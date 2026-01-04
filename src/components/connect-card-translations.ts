import { Translations } from '../components/language-utils';

export const connectCardTranslations: Translations = {
  en: {
    // Connection statuses
    statusConnected: 'Connected',
    statusConnecting: 'Connecting…',
    statusNotConnected: 'Not Connected',
    
    // Connected state
    connectedTitle: 'Successfully Connected!',
    connectedDescription: 'FlipIt is now analyzing {platform} for flipping opportunities.',
    disconnectButton: 'Disconnect',
    settingsButton: 'Settings',
    
    // Manual connection form
    manualConnectTitle: 'Connect your {platform} account',
    manualConnectDescription: 'Paste your cookies for {platform} below. Your user ID will be linked automatically.',
    manualConnectButton: 'Connect {platform}',
    manualConnectCancel: 'Cancel',
    
    // Cookie instructions
    cookieInstructionsToggle: 'How to get {platform} cookies?',
    cookieInstructionsTitle: 'Get {platform} Cookies in 4 Simple Steps',
    cookieStep1: 'Install the {extensionLink} in your browser.',
    cookieExtensionText: 'Cookie-Editor extension',
    cookieStep2: 'Go to {platform} and log in to your account.',
    cookieStep3: 'Click the Cookie-Editor extension icon, then click the {exportBtn} button (bottom right), choose {exportFormat}, and copy the result.',
    cookieStep3Export: 'Export',
    cookieStep3Format: 'Export → Header String',
    cookieStep4: 'Paste this string into the cookies field below.',
    
    // DTSG instructions (Facebook)
    dtsgInstructionsToggle: 'How to get dtsg token?',
    dtsgInstructionsTitle: 'Get dtsg Token in 5 Simple Steps',
    dtsgStep1: 'Visit {fbLink} and log in to your account',
    dtsgStep2: 'Open Developer Tools:',
    dtsgStep2Keys: '{keys} or right-click → Inspect → Console',
    dtsgStep3: 'Click on the {consoleTab} tab',
    dtsgStep3Console: 'Console',
    dtsgStep4: 'Type or paste this command:',
    dtsgStep5: 'Press {enterKey} and copy the value shown, then paste it below.',
    dtsgStep5Enter: 'Enter',
    dtsgCommandCopied: 'Command copied to clipboard!',
    
    // Form placeholders
    cookiesPlaceholder: 'Paste {platform} cookies here...',
    dtsgPlaceholder: 'Paste your dtsg token here...',
    
    // Not connected state
    notConnectedDescription: 'Connect your {platform} account to let FlipIt find and flip items automatically.',
    manualConnectButtonCta: 'Manual Connect',
    
    // Auth required
    authRequiredMessage: 'You must be logged in to connect your {platform} account.',
    authRequiredToast: 'Please log in to connect your accounts',
    
    // Toast messages
    toastConnectedSuccess: 'Successfully connected to {platform}',
    toastConnectedError: 'Failed to connect to {platform}. Please try again.',
    toastDisconnectedSuccess: '{platform} disconnected.',
    toastDisconnectedError: 'Failed to disconnect. Please try again.',
    toastManualConnectedSuccess: 'Manually connected to {platform}',
    toastManualConnectedError: 'Manual connection failed. Please check your cookies and try again.',
    
    // Platform-specific placeholders
    facebookCookiePlaceholder: 'Paste Facebook cookies here...',
    olxCookiePlaceholder: 'Paste OLX cookies here...',
    vintedCookiePlaceholder: 'Paste Vinted cookies here...',
  },
  pl: {
    // Connection statuses
    statusConnected: 'Połączono',
    statusConnecting: 'Łączenie…',
    statusNotConnected: 'Nie połączono',
    
    // Connected state
    connectedTitle: 'Pomyślnie połączono!',
    connectedDescription: 'FlipIt teraz analizuje {platform} w poszukiwaniu okazji do zarobku.',
    disconnectButton: 'Rozłącz',
    settingsButton: 'Ustawienia',
    
    // Manual connection form
    manualConnectTitle: 'Połącz swoje konto {platform}',
    manualConnectDescription: 'Wklej swoje ciasteczka dla {platform} poniżej. Twój identyfikator użytkownika zostanie automatycznie połączony.',
    manualConnectButton: 'Połącz {platform}',
    manualConnectCancel: 'Anuluj',
    
    // Cookie instructions
    cookieInstructionsToggle: 'Jak pobrać ciasteczka?',
    cookieInstructionsTitle: 'Pobierz ciasteczka {platform} w 4 krokach',
    cookieStep1: 'Zainstaluj {extensionLink} w swojej przeglądarce.',
    cookieExtensionText: 'rozszerzenie Cookie-Editor',
    cookieStep2: 'Przejdź do {platform} i zaloguj się na swoje konto.',
    cookieStep3: 'Kliknij ikonę rozszerzenia Cookie-Editor, następnie kliknij przycisk {exportBtn} (w prawym dolnym rogu), wybierz {exportFormat} i skopiuj wynik.',
    cookieStep3Export: 'Export',
    cookieStep3Format: 'Export → Header String',
    cookieStep4: 'Wklej ten ciąg znaków w pole ciasteczek poniżej.',
    
    // DTSG instructions (Facebook)
    dtsgInstructionsToggle: 'Jak uzyskać token dtsg?',
    dtsgInstructionsTitle: 'Uzyskaj token dtsg w 5 prostych krokach',
    dtsgStep1: 'Odwiedź {fbLink} i zaloguj się na swoje konto',
    dtsgStep2: 'Otwórz narzędzia deweloperskie:',
    dtsgStep2Keys: '{keys} lub kliknij prawym przyciskiem → Zbadaj → Konsola',
    dtsgStep3: 'Kliknij zakładkę {consoleTab}',
    dtsgStep3Console: 'Konsola',
    dtsgStep4: 'Wpisz lub wklej to polecenie:',
    dtsgStep5: 'Naciśnij {enterKey} i skopiuj wyświetloną wartość, następnie wklej ją poniżej.',
    dtsgStep5Enter: 'Enter',
    dtsgCommandCopied: 'Polecenie skopiowane do schowka!',
    
    // Form placeholders
    cookiesPlaceholder: 'Wklej ciasteczka {platform} tutaj...',
    dtsgPlaceholder: 'Wklej swój token dtsg tutaj...',
    
    // Not connected state
    notConnectedDescription: 'Połącz swoje konto {platform}, aby FlipIt automatycznie znajdował i sprzedawał przedmioty.',
    manualConnectButtonCta: 'Połącz ręcznie',
    
    // Auth required
    authRequiredMessage: 'Musisz być zalogowany, aby połączyć swoje konto {platform}.',
    authRequiredToast: 'Proszę się zalogować, aby połączyć konta',
    
    // Toast messages
    toastConnectedSuccess: 'Pomyślnie połączono z {platform}',
    toastConnectedError: 'Nie udało się połączyć z {platform}. Spróbuj ponownie.',
    toastDisconnectedSuccess: '{platform} rozłączono.',
    toastDisconnectedError: 'Nie udało się rozłączyć. Spróbuj ponownie.',
    toastManualConnectedSuccess: 'Ręcznie połączono z {platform}',
    toastManualConnectedError: 'Ręczne połączenie nie powiodło się. Sprawdź swoje ciasteczka i spróbuj ponownie.',
    
    // Platform-specific placeholders
    facebookCookiePlaceholder: 'Wklej ciasteczka Facebook tutaj...',
    olxCookiePlaceholder: 'Wklej ciasteczka OLX tutaj...',
    vintedCookiePlaceholder: 'Wklej ciasteczka Vinted tutaj...',
  },
};
