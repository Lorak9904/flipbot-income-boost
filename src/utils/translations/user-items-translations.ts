export const userItemsTranslations = {
  en: {
    // SEO & Meta
    pageTitle: "My Listings",
    pageDescription: "View and manage all your listings across platforms",
    
    // Statistics Cards
    stats: {
      totalItems: "Total Listings",
      published: "Published",
      drafts: "Unpublished",
      successRate: "Success Rate",
    },
    
    // Filters
    filters: {
      label: "Filters:",
      allStatuses: "All statuses",
      draft: "Unpublished",
      active: "Active",
      inactive: "Inactive",
      sold: "Sold",
      expired: "Expired",
      removed: "Removed",
      blocked: "Blocked",
      allPlatforms: "All platforms",
      facebook: "Facebook",
      olx: "OLX",
      vinted: "Vinted",
      ebay: "eBay",
      allegro: "Allegro",
    },
    statusTabs: {
      live: "Live",
      drafts: "Unpublished",
      needsAttention: "Needs attention",
      soldEnded: "Sold / Ended",
      all: "All statuses",
    },
    
    // Loading & Error States
    loading: "Loading...",
    error: "An error occurred",
    retry: "Retry",
    
    // Empty State
    empty: {
      title: "No listings found",
      description: {
        filtered: "Try adjusting your filters",
        noItems: "Start by adding your first listing",
      },
      addButton: "Add Listing",
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
      pageInfo: "Page {page} of {totalPages} ({total} listings)",
    },
    
    // Authentication
    authRequired: "Authentication Required",
    authMessage: "Please log in to view your listings",
    sessionExpired: "Session Expired",
    sessionMessage: "Your session has expired. Please log in again.",
    goToLogin: "Go to Login",
  },
  
  pl: {
    // SEO & Meta
    pageTitle: "Moje ogłoszenia",
    pageDescription: "Przeglądaj i zarządzaj wszystkimi ogłoszeniami na różnych platformach",
    
    // Karty statystyk
    stats: {
      totalItems: "Wszystkie ogłoszenia",
      published: "Opublikowane",
      drafts: "Nieopublikowane",
      successRate: "Wskaźnik sukcesu",
    },
    
    // Filtry
    filters: {
      label: "Filtry:",
      allStatuses: "Wszystkie statusy",
      draft: "Nieopublikowane",
      active: "Aktywne",
      inactive: "Nieaktywne",
      sold: "Sprzedane",
      expired: "Wygasłe",
      removed: "Usunięte",
      blocked: "Zablokowane",
      allPlatforms: "Wszystkie platformy",
      facebook: "Facebook",
      olx: "OLX",
      vinted: "Vinted",
      ebay: "eBay",
      allegro: "Allegro",
    },
    statusTabs: {
      live: "Aktywne",
      drafts: "Nieopublikowane",
      needsAttention: "Wymaga uwagi",
      soldEnded: "Sprzedane / Zakończone",
      all: "Wszystkie statusy",
    },
    
    // Stany ładowania i błędów
    loading: "Ładowanie...",
    error: "Wystąpił błąd",
    retry: "Spróbuj ponownie",
    
    // Pusty stan
    empty: {
      title: "Nie znaleziono ogłoszeń",
      description: {
        filtered: "Spróbuj dostosować filtry",
        noItems: "Zacznij od dodania pierwszego ogłoszenia",
      },
      addButton: "Dodaj ogłoszenie",
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
      pageInfo: "Strona {page} z {totalPages} ({total} ogłoszeń)",
    },
    
    // Uwierzytelnianie
    authRequired: "Wymagane logowanie",
    authMessage: "Zaloguj się, aby zobaczyć swoje ogłoszenia",
    sessionExpired: "Sesja wygasła",
    sessionMessage: "Twoja sesja wygasła. Zaloguj się ponownie.",
    goToLogin: "Przejdź do logowania",
  },
};

export type UserItemsTranslations = typeof userItemsTranslations.en;
