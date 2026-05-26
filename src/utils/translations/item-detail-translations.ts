export const itemDetailTranslations = {
  en: {
    // Page
    backToItems: "Back to Listings",
    
    // Actions
    actions: {
      edit: "Edit",
      editListing: "Edit",
      publish: "Publish",
      publishTo: "Publish to…",
      publishToAnother: "Publish to another platform",
      duplicate: "Duplicate",
      delete: "Remove from FlipIt",
      deleteDraft: "Remove unpublished listing",
      deleteFromPlatform: "Remove from platform",
      removeFromMarketplaces: "Remove from marketplaces",
    },
    
    // Action confirmations
    confirmations: {
      deleteTitle: "Remove from FlipIt",
      deleteDescription: "This removes the listing from FlipIt only. Marketplace listings are not removed.",
      deleteConfirm: "Remove from FlipIt",
      deleteCancel: "Cancel",
      removeFromFlipItTitle: "Remove from FlipIt",
      removeFromFlipItDescription: "This removes the listing from FlipIt only. Marketplace listings are not removed.",
      removeFromFlipItConfirm: "Remove from FlipIt",
      removeUnpublishedTitle: "Remove unpublished listing",
      removeUnpublishedDescription: "This listing has not been published yet. Removing it deletes it from FlipIt.",
      removeUnpublishedConfirm: "Remove listing",
      removeMarketplacesTitle: "Remove from marketplaces",
      removeMarketplacesDescription: "FlipIt will remove this listing from: {platforms}. The listing record stays in FlipIt for history and retry visibility.",
      removeMarketplacesUnsupported: "Manual removal is still required on: {platforms}.",
      removeMarketplacesConfirm: "Remove from marketplaces",
      deletePlatformTitle: "Remove from marketplace",
      deletePlatformDescription: "Remove this listing from {platform}? The listing stays in FlipIt.",
      deletePlatformConfirm: "Remove",
    },
    
    // Platform picker
    platformPicker: {
      title: "Select Platform",
      description: "Choose a platform to publish your listing",
      noConnected: "No platforms connected",
      connectAccount: "Connect Account",
      alreadyPublished: "Already published",
      publish: "Publish",
      cancel: "Cancel",
    },
    
    // Toasts
    toasts: {
      duplicateSuccess: "Listing duplicated successfully",
      duplicateError: "Failed to duplicate listing",
      deleteSuccess: "Listing removed from FlipIt",
      deleteError: "Failed to remove listing from FlipIt",
      removeMarketplacesSuccess: "Listing removed from marketplaces",
      removeMarketplacesPartial: "Some marketplaces could not be removed",
      removeMarketplacesError: "Failed to remove listing from marketplaces",
      deletePlatformSuccess: "Listing removed from {platform}",
      deletePlatformError: "Failed to remove listing from {platform}",
      publishSuccess: "Listing published to {platform}",
      publishError: "Failed to publish to {platform}",
      noCredits: "Insufficient credits to publish",
    },
    
    // Status badges
    status: {
      draft: "Unpublished",
      published: "Published",
      active: "Active",
      sold: "Sold",
      inactive: "Inactive",
    },
  },
  
  pl: {
    // Page
    backToItems: "Wróć do ogłoszeń",
    
    // Actions
    actions: {
      edit: "Edytuj",
      editListing: "Edytuj",
      publish: "Opublikuj",
      publishTo: "Opublikuj na…",
      publishToAnother: "Opublikuj na innej platformie",
      duplicate: "Duplikuj",
      delete: "Usuń z FlipIt",
      deleteDraft: "Usuń nieopublikowane ogłoszenie",
      deleteFromPlatform: "Usuń z platformy",
      removeFromMarketplaces: "Usuń z marketplace'ów",
    },
    
    // Action confirmations
    confirmations: {
      deleteTitle: "Usuń z FlipIt",
      deleteDescription: "To usuwa ogłoszenie tylko z FlipIt. Ogłoszenia na marketplace'ach nie zostaną usunięte.",
      deleteConfirm: "Usuń z FlipIt",
      deleteCancel: "Anuluj",
      removeFromFlipItTitle: "Usuń z FlipIt",
      removeFromFlipItDescription: "To usuwa ogłoszenie tylko z FlipIt. Ogłoszenia na marketplace'ach nie zostaną usunięte.",
      removeFromFlipItConfirm: "Usuń z FlipIt",
      removeUnpublishedTitle: "Usuń nieopublikowane ogłoszenie",
      removeUnpublishedDescription: "To ogłoszenie nie zostało jeszcze opublikowane. Usunięcie usuwa je z FlipIt.",
      removeUnpublishedConfirm: "Usuń ogłoszenie",
      removeMarketplacesTitle: "Usuń z marketplace'ów",
      removeMarketplacesDescription: "FlipIt usunie to ogłoszenie z: {platforms}. Rekord ogłoszenia zostaje w FlipIt dla historii i ponowienia próby.",
      removeMarketplacesUnsupported: "Ręczne usunięcie nadal jest wymagane na: {platforms}.",
      removeMarketplacesConfirm: "Usuń z marketplace'ów",
      deletePlatformTitle: "Usuń z marketplace'u",
      deletePlatformDescription: "Usunąć to ogłoszenie z {platform}? Ogłoszenie zostaje w FlipIt.",
      deletePlatformConfirm: "Usuń",
    },
    
    // Platform picker
    platformPicker: {
      title: "Wybierz platformę",
      description: "Wybierz platformę do publikacji ogłoszenia",
      noConnected: "Brak połączonych platform",
      connectAccount: "Połącz konto",
      alreadyPublished: "Już opublikowano",
      publish: "Opublikuj",
      cancel: "Anuluj",
    },
    
    // Toasts
    toasts: {
      duplicateSuccess: "Ogłoszenie zostało zduplikowane.",
      duplicateError: "Nie udało się zduplikować ogłoszenia",
      deleteSuccess: "Ogłoszenie zostało usunięte z FlipIt.",
      deleteError: "Nie udało się usunąć ogłoszenia z FlipIt",
      removeMarketplacesSuccess: "Ogłoszenie usunięte z marketplace'ów",
      removeMarketplacesPartial: "Niektórych marketplace'ów nie udało się usunąć",
      removeMarketplacesError: "Nie udało się usunąć ogłoszenia z marketplace'ów",
      deletePlatformSuccess: "Usunięto z {platform}",
      deletePlatformError: "Nie udało się usunąć z {platform}",
      publishSuccess: "Opublikowano na {platform}",
      publishError: "Nie udało się opublikować na {platform}",
      noCredits: "Brak wystarczającej liczby kredytów na publikację",
    },
    
    // Status badges
    status: {
      draft: "Nieopublikowane",
      published: "Opublikowano",
      active: "Aktywne",
      sold: "Sprzedane",
      inactive: "Nieaktywne",
    },
  },
};

export type ItemDetailTranslations = typeof itemDetailTranslations.en;
