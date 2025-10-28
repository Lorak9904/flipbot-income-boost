export const userItemsTranslations = {
  en: {
    // SEO & Meta
    pageTitle: "My Items",
    pageDescription: "View and manage all your listings across platforms",
    
    // Statistics Cards
    stats: {
      totalItems: "Total Items",
      published: "Published",
      drafts: "Drafts",
      successRate: "Success Rate",
    },
    
    // Filters
    filters: {
      label: "Filters:",
      allStages: "All stages",
      draft: "Draft",
      published: "Published",
      allPlatforms: "All platforms",
      facebook: "Facebook",
      olx: "OLX",
      vinted: "Vinted",
    },
    
    // Loading & Error States
    loading: "Loading...",
    error: "An error occurred",
    retry: "Retry",
    
    // Empty State
    empty: {
      title: "No items found",
      description: {
        filtered: "Try adjusting your filters",
        noItems: "Start by adding your first item",
      },
      addButton: "Add Item",
    },
    
    // Item Card
    item: {
      brand: "Brand:",
      price: "$",
    },
    
    // Pagination
    pagination: {
      previous: "Previous",
      next: "Next",
      pageInfo: "Page {page} of {totalPages} ({total} items)",
    },
    
    // Authentication
    authRequired: "Authentication Required",
    authMessage: "Please log in to view your items",
    sessionExpired: "Session Expired",
    sessionMessage: "Your session has expired. Please log in again.",
    goToLogin: "Go to Login",
  },
  
  pl: {
    // SEO & Meta
    pageTitle: "Moje Przedmioty",
    pageDescription: "Przeglądaj i zarządzaj wszystkimi swoimi ogłoszeniami na różnych platformach",
    
    // Karty statystyk
    stats: {
      totalItems: "Wszystkie Przedmioty",
      published: "Opublikowane",
      drafts: "Szkice",
      successRate: "Wskaźnik Sukcesu",
    },
    
    // Filtry
    filters: {
      label: "Filtry:",
      allStages: "Wszystkie stany",
      draft: "Szkic",
      published: "Opublikowane",
      allPlatforms: "Wszystkie platformy",
      facebook: "Facebook",
      olx: "OLX",
      vinted: "Vinted",
    },
    
    // Stany ładowania i błędów
    loading: "Ładowanie...",
    error: "Wystąpił błąd",
    retry: "Spróbuj ponownie",
    
    // Pusty stan
    empty: {
      title: "Nie znaleziono przedmiotów",
      description: {
        filtered: "Spróbuj dostosować filtry",
        noItems: "Zacznij od dodania pierwszego przedmiotu",
      },
      addButton: "Dodaj Przedmiot",
    },
    
    // Karta przedmiotu
    item: {
      brand: "Marka:",
      price: "zł",
    },
    
    // Paginacja
    pagination: {
      previous: "Poprzednia",
      next: "Następna",
      pageInfo: "Strona {page} z {totalPages} ({total} przedmiotów)",
    },
    
    // Uwierzytelnianie
    authRequired: "Wymagane Uwierzytelnienie",
    authMessage: "Zaloguj się, aby zobaczyć swoje przedmioty",
    sessionExpired: "Sesja Wygasła",
    sessionMessage: "Twoja sesja wygasła. Zaloguj się ponownie.",
    goToLogin: "Przejdź do Logowania",
  },
};

export type UserItemsTranslations = typeof userItemsTranslations.en;
