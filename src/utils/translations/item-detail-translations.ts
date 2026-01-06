export const itemDetailTranslations = {
  en: {
    // Page
    backToItems: "Back to Items",
    
    // Actions
    actions: {
      edit: "Edit",
      editListing: "Edit Listing",
      publish: "Publish",
      publishTo: "Publish to…",
      publishToAnother: "Publish to another platform",
      duplicate: "Duplicate",
      delete: "Delete",
      deleteDraft: "Delete Draft",
    },
    
    // Action confirmations
    confirmations: {
      deleteTitle: "Delete Item",
      deleteDescription: "Are you sure you want to delete this item? This action cannot be undone.",
      deleteConfirm: "Delete",
      deleteCancel: "Cancel",
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
      duplicateSuccess: "Item duplicated successfully",
      duplicateError: "Failed to duplicate item",
      deleteSuccess: "Item deleted successfully",
      deleteError: "Failed to delete item",
      publishSuccess: "Item published to {platform}",
      publishError: "Failed to publish to {platform}",
      noCredits: "Insufficient credits to publish",
    },
    
    // Status badges
    status: {
      draft: "Draft",
      published: "Published",
      active: "Active",
      sold: "Sold",
      inactive: "Inactive",
    },
  },
  
  pl: {
    // Page
    backToItems: "Powrót do przedmiotów",
    
    // Actions
    actions: {
      edit: "Edytuj",
      editListing: "Edytuj ogłoszenie",
      publish: "Opublikuj",
      publishTo: "Opublikuj na…",
      publishToAnother: "Opublikuj na innej platformie",
      duplicate: "Duplikuj",
      delete: "Usuń",
      deleteDraft: "Usuń szkic",
    },
    
    // Action confirmations
    confirmations: {
      deleteTitle: "Usuń przedmiot",
      deleteDescription: "Czy na pewno chcesz usunąć ten przedmiot? Tej akcji nie można cofnąć.",
      deleteConfirm: "Usuń",
      deleteCancel: "Anuluj",
    },
    
    // Platform picker
    platformPicker: {
      title: "Wybierz platformę",
      description: "Wybierz platformę, na której chcesz opublikować ogłoszenie",
      noConnected: "Brak połączonych platform",
      connectAccount: "Połącz konto",
      alreadyPublished: "Już opublikowano",
      publish: "Opublikuj",
      cancel: "Anuluj",
    },
    
    // Toasts
    toasts: {
      duplicateSuccess: "Przedmiot zduplikowany pomyślnie",
      duplicateError: "Nie udało się zduplikować przedmiotu",
      deleteSuccess: "Przedmiot usunięty pomyślnie",
      deleteError: "Nie udało się usunąć przedmiotu",
      publishSuccess: "Opublikowano na {platform}",
      publishError: "Nie udało się opublikować na {platform}",
      noCredits: "Niewystarczająca liczba kredytów do publikacji",
    },
    
    // Status badges
    status: {
      draft: "Szkic",
      published: "Opublikowano",
      active: "Aktywne",
      sold: "Sprzedane",
      inactive: "Nieaktywne",
    },
  },
};

export type ItemDetailTranslations = typeof itemDetailTranslations.en;
