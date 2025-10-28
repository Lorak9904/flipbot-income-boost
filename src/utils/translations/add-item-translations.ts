export const addItemTranslations = {
  en: {
    // SEO & Meta
    pageTitle: "Add New Item",
    reviewTitle: "Review Your Item",
    
    // Step: Add
    addCard: {
      title: "Upload Item",
      description: "Start by adding images and basic information about your item",
    },
    
    // Step: Review
    reviewCard: {
      title: "Review and Publish",
      description: "Review your item details before publishing to your selected platforms",
    },
    
    // Loading States
    loading: {
      importing: "Importing item from URL...",
      analyzing: "Analyzing images...",
    },
    
    // Authentication
    authRequired: "Authentication Required",
    authMessage: "Please log in to add items",
    sessionExpired: "Session Expired",
    sessionMessage: "Your session has expired. Please log in again.",
    goToLogin: "Go to Login",
    
    // Toasts & Messages
    toast: {
      importSuccess: "Item imported successfully!",
      importError: "Failed to import item. Please try again.",
      uploadSuccess: "Item uploaded successfully!",
      uploadError: "Failed to upload item. Please try again.",
      sessionError: "Your session has expired. Please log in again.",
    },
    
    // Form placeholders and labels (if needed)
    form: {
      imagesPlaceholder: "Start by adding images...",
      titlePlaceholder: "Enter item title",
      descriptionPlaceholder: "Describe your item...",
      pricePlaceholder: "Price",
    },
  },
  
  pl: {
    // SEO & Meta
    pageTitle: "Dodaj Nowy Przedmiot",
    reviewTitle: "Sprawdź Swój Przedmiot",
    
    // Krok: Dodawanie
    addCard: {
      title: "Prześlij Przedmiot",
      description: "Zacznij od dodania zdjęć i podstawowych informacji o Twoim przedmiocie",
    },
    
    // Krok: Przegląd
    reviewCard: {
      title: "Sprawdź i Opublikuj",
      description: "Przejrzyj szczegóły przedmiotu przed opublikowaniem na wybranych platformach",
    },
    
    // Stany ładowania
    loading: {
      importing: "Importowanie przedmiotu z adresu URL...",
      analyzing: "Analizowanie zdjęć...",
    },
    
    // Uwierzytelnianie
    authRequired: "Wymagane Uwierzytelnienie",
    authMessage: "Zaloguj się, aby dodać przedmioty",
    sessionExpired: "Sesja Wygasła",
    sessionMessage: "Twoja sesja wygasła. Zaloguj się ponownie.",
    goToLogin: "Przejdź do Logowania",
    
    // Powiadomienia i Komunikaty
    toast: {
      importSuccess: "Przedmiot zaimportowany pomyślnie!",
      importError: "Nie udało się zaimportować przedmiotu. Spróbuj ponownie.",
      uploadSuccess: "Przedmiot przesłany pomyślnie!",
      uploadError: "Nie udało się przesłać przedmiotu. Spróbuj ponownie.",
      sessionError: "Twoja sesja wygasła. Zaloguj się ponownie.",
    },
    
    // Formularz - placeholdery i etykiety
    form: {
      imagesPlaceholder: "Zacznij od dodania zdjęć...",
      titlePlaceholder: "Wprowadź tytuł przedmiotu",
      descriptionPlaceholder: "Opisz swój przedmiot...",
      pricePlaceholder: "Cena",
    },
  },
};

export type AddItemTranslations = typeof addItemTranslations.en;
