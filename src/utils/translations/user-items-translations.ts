export const userItemsTranslations = {
  en: {
    // SEO & Meta
    pageTitle: "My Listings",
    pageDescription: "Manage listings from all your marketplaces in one place",
    
    // Statistics Cards
    stats: {
      totalItems: "Total Listings",
      published: "Published",
      drafts: "Unpublished",
      successRate: "Publishing success",
    },
    actions: {
      refreshStatuses: "Refresh statuses",
      refreshingStatuses: "Refreshing...",
    },
    statusRefresh: {
      failedTitle: "Status refresh failed",
      failedDescription: "Check the connected marketplace account and try again.",
      unavailableTitle: "Status refresh is not available",
      unavailableDescription: "Remote checks currently support OLX, eBay, and Etsy listings.",
      partialTitle: "Some statuses were refreshed",
      successTitle: "Statuses refreshed",
      partialDescription: "Supported marketplaces were refreshed. Other listings still show their last known status.",
      successDescription: "The visible listing statuses are up to date.",
    },
    lifecycle: {
      locale: "en-GB",
      ariaLabel: "Marketplace statuses",
      removed: "Removed",
      needsAttention: "Needs attention",
      pending: "Pending",
      pendingChanges: "Pending changes",
      live: "Live",
      notChecked: "Not checked",
      lastChecked: "Last checked",
      neverChecked: "Not checked yet",
      providerMessage: "Marketplace response",
      detailsLabel: "View {platform} status details",
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
      etsy: "Etsy",
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
      imageUnavailable: "Image unavailable",
      noImage: "No image",
      openListing: "Open {title}",
      untitled: "Untitled listing",
      statuses: {
        draft: "Unpublished",
        active: "Active",
        inactive: "Inactive",
        sold: "Sold",
        expired: "Expired",
        removed: "Removed",
        blocked: "Blocked",
      },
    },
    duplicateSuggestions: {
      title: "Possible duplicates",
      summary: "Review similar listings before combining them.",
      countLabel: (count: number) => `${count} ${count === 1 ? 'suggestion' : 'suggestions'}`,
      reviewButton: "Review duplicates",
      dialogTitle: "Review possible duplicates",
      dialogDescription: "Choose which listing details to keep. FlipIt will combine marketplace links and unique photos.",
      closeButton: "Close",
      recommendedLabel: "Recommended",
      selectedLabel: "Details kept",
      chooseDetailsLabel: "Choose the listing whose details should remain",
      untitledListing: "Untitled listing",
      noDescription: "No description",
      photoCount: (count: number) => `${count} ${count === 1 ? 'photo' : 'photos'}`,
      mergeButton: "Merge listings",
      mergingButton: "Merging...",
      dismissButton: "Not a duplicate",
      dismissingButton: "Dismissing...",
      bulkMergeButton: "Merge without conflicts ({count})",
      bulkMergingButton: "Merging...",
      conflictLabel: (count: number) => `${count} ${count === 1 ? 'difference' : 'differences'}`,
      conflictSummary: "The selected listing's details will remain. Unique photos from both listings will be kept.",
      noConflictSummary: "These listings have no conflicting details.",
      remoteListingsUnchanged: "This only combines records in FlipIt. Marketplace listings are not deleted or edited.",
      reasonsLabel: "Why these may match",
      differencesLabel: "Differences",
      reasonLabels: {
        "same remote listing id": "Same marketplace listing",
        "same title": "Same title",
        "similar title": "Similar title",
        "same description": "Same description",
        "similar description": "Similar description",
        "shared image": "Same photo",
        "similar image": "Similar photo",
        "same price": "Same price",
        "similar price": "Similar price",
        "same brand": "Same brand",
        "same condition": "Same condition",
        "same size": "Same size",
        "different marketplaces": "Different marketplaces",
      },
      fieldLabels: {
        title: "Title",
        description: "Description",
        brand: "Brand",
        condition: "Condition",
        category: "Category",
        price: "Price",
        currency: "Currency",
        size: "Size",
        images: "Photos",
      },
      mergedTitle: "Listings merged",
      mergedDescription: "Marketplace links and unique photos are now combined in one listing.",
      mergeErrorTitle: "Could not merge listings",
      mergeErrorDescription: "Nothing was changed. Review the listings and try again.",
      dismissedTitle: "Suggestion dismissed",
      dismissedDescription: "This pair will no longer appear as a duplicate suggestion.",
      dismissErrorTitle: "Could not dismiss suggestion",
      dismissErrorDescription: "The suggestion is still visible. Try again.",
      undoButton: "Undo",
      unmergedTitle: "Merge undone",
      unmergedDescription: "The second listing was restored.",
      unmergeErrorTitle: "Could not undo merge",
      unmergeErrorDescription: "The listings remain combined. Try again.",
      bulkMergedTitle: "Duplicates merged",
      bulkMergedDescription: "Merged {count} duplicate pairs without conflicting details.",
      bulkMergeErrorTitle: "Could not merge duplicates",
      bulkMergeErrorDescription: "No uncertain pairs were merged. Review the suggestions and try again.",
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
    pageDescription: "Zarządzaj ogłoszeniami ze wszystkich platform w jednym miejscu",
    
    // Karty statystyk
    stats: {
      totalItems: "Wszystkie ogłoszenia",
      published: "Opublikowane",
      drafts: "Nieopublikowane",
      successRate: "Skuteczność publikacji",
    },
    actions: {
      refreshStatuses: "Odśwież statusy",
      refreshingStatuses: "Odświeżanie...",
    },
    statusRefresh: {
      failedTitle: "Nie udało się odświeżyć statusów",
      failedDescription: "Sprawdź połączenie z platformą i spróbuj ponownie.",
      unavailableTitle: "Odświeżanie statusów jest niedostępne",
      unavailableDescription: "Zdalne sprawdzanie działa obecnie dla ogłoszeń z OLX, eBay i Etsy.",
      partialTitle: "Odświeżono część statusów",
      successTitle: "Statusy odświeżone",
      partialDescription: "Odświeżono obsługiwane platformy. Pozostałe ogłoszenia nadal pokazują ostatni znany status.",
      successDescription: "Statusy widocznych ogłoszeń są aktualne.",
    },
    lifecycle: {
      locale: "pl-PL",
      ariaLabel: "Statusy na platformach",
      removed: "Usunięte",
      needsAttention: "Wymaga uwagi",
      pending: "W toku",
      pendingChanges: "Zmiany oczekują",
      live: "Aktywne",
      notChecked: "Niesprawdzone",
      lastChecked: "Ostatnio sprawdzono",
      neverChecked: "Jeszcze nie sprawdzono",
      providerMessage: "Odpowiedź platformy",
      detailsLabel: "Pokaż szczegóły statusu na {platform}",
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
      etsy: "Etsy",
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
      imageUnavailable: "Zdjęcie jest niedostępne",
      noImage: "Brak zdjęcia",
      openListing: "Otwórz ogłoszenie: {title}",
      untitled: "Ogłoszenie bez tytułu",
      statuses: {
        draft: "Nieopublikowane",
        active: "Aktywne",
        inactive: "Nieaktywne",
        sold: "Sprzedane",
        expired: "Wygasłe",
        removed: "Usunięte",
        blocked: "Zablokowane",
      },
    },
    duplicateSuggestions: {
      title: "Możliwe duplikaty",
      summary: "Sprawdź podobne ogłoszenia przed ich połączeniem.",
      countLabel: (count: number) => {
        if (count === 1) return "1 sugestia";
        if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14)) {
          return `${count} sugestie`;
        }
        return `${count} sugestii`;
      },
      reviewButton: "Sprawdź duplikaty",
      dialogTitle: "Sprawdź możliwe duplikaty",
      dialogDescription: "Wybierz dane ogłoszenia, które mają zostać. FlipIt połączy odnośniki do platform i unikalne zdjęcia.",
      closeButton: "Zamknij",
      recommendedLabel: "Rekomendowane",
      selectedLabel: "Te dane zostają",
      chooseDetailsLabel: "Wybierz ogłoszenie, którego dane mają zostać",
      untitledListing: "Ogłoszenie bez tytułu",
      noDescription: "Brak opisu",
      photoCount: (count: number) => {
        if (count === 1) return "1 zdjęcie";
        if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14)) {
          return `${count} zdjęcia`;
        }
        return `${count} zdjęć`;
      },
      mergeButton: "Połącz ogłoszenia",
      mergingButton: "Scalanie...",
      dismissButton: "To nie duplikat",
      dismissingButton: "Odrzucanie...",
      bulkMergeButton: "Połącz bez różnic ({count})",
      bulkMergingButton: "Scalanie...",
      conflictLabel: (count: number) => {
        if (count === 1) return "1 różnica";
        if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14)) {
          return `${count} różnice`;
        }
        return `${count} różnic`;
      },
      conflictSummary: "Zostaną dane wybranego ogłoszenia. Zachowamy unikalne zdjęcia z obu ogłoszeń.",
      noConflictSummary: "Te ogłoszenia nie mają sprzecznych danych.",
      remoteListingsUnchanged: "Łączymy tylko dane w FlipIt. Ogłoszenia na platformach nie zostaną usunięte ani zmienione.",
      reasonsLabel: "Dlaczego mogą być duplikatami",
      differencesLabel: "Różnice",
      reasonLabels: {
        "same remote listing id": "To samo ogłoszenie na platformie",
        "same title": "Ten sam tytuł",
        "similar title": "Podobny tytuł",
        "same description": "Ten sam opis",
        "similar description": "Podobny opis",
        "shared image": "To samo zdjęcie",
        "similar image": "Podobne zdjęcie",
        "same price": "Ta sama cena",
        "similar price": "Podobna cena",
        "same brand": "Ta sama marka",
        "same condition": "Ten sam stan",
        "same size": "Ten sam rozmiar",
        "different marketplaces": "Różne platformy",
      },
      fieldLabels: {
        title: "Tytuł",
        description: "Opis",
        brand: "Marka",
        condition: "Stan",
        category: "Kategoria",
        price: "Cena",
        currency: "Waluta",
        size: "Rozmiar",
        images: "Zdjęcia",
      },
      mergedTitle: "Ogłoszenia scalone",
      mergedDescription: "Odnośniki do platform i unikalne zdjęcia są teraz połączone w jednym ogłoszeniu.",
      mergeErrorTitle: "Nie udało się scalić ogłoszeń",
      mergeErrorDescription: "Nic nie zostało zmienione. Sprawdź ogłoszenia i spróbuj ponownie.",
      dismissedTitle: "Sugestia odrzucona",
      dismissedDescription: "Ta para nie będzie już pokazywana jako duplikat.",
      dismissErrorTitle: "Nie udało się odrzucić sugestii",
      dismissErrorDescription: "Sugestia nadal jest widoczna. Spróbuj ponownie.",
      undoButton: "Cofnij",
      unmergedTitle: "Scalanie cofnięte",
      unmergedDescription: "Przywrócono drugie ogłoszenie.",
      unmergeErrorTitle: "Nie udało się cofnąć scalania",
      unmergeErrorDescription: "Ogłoszenia nadal są połączone. Spróbuj ponownie.",
      bulkMergedTitle: "Duplikaty połączone",
      bulkMergedDescription: "Połączono {count} par bez sprzecznych danych.",
      bulkMergeErrorTitle: "Nie udało się połączyć duplikatów",
      bulkMergeErrorDescription: "Nie połączono żadnej niepewnej pary. Sprawdź sugestie i spróbuj ponownie.",
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
