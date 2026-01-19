export const reviewItemFormTranslations = {
  en: {
    // Toast Messages
    toast: {
      noPlatformsTitle: "No platforms selected",
      noPlatformsDesc: "Please select at least one platform to publish to",
      successTitle: "Success!",
      publishedSuccess: "Published to {platform} successfully.",
      publishError: "Error publishing to {platform}",
      updateLocalSuccess: "Item updated successfully.",
      updatedSuccess: "Updated on {platform} successfully.",
      updateError: "Error updating {platform}",
      updateErrorDesc: "Failed to update listing on platform.",
      generalSuccess: "Your item has been published successfully",
      errorTitle: "Error",
      errorDesc: "Failed to publish item. Please try again.",
    },
    
    // Section Headers
    sections: {
      images: "Images",
      itemDetails: "Item Details",
      productAttributes: "Product Attributes",
      platformOverrides: "Platform Overrides",
      publishPlatforms: "Publish to Platforms",
      updatePlatforms: "Update on Platforms",
    },
    
    // Form Labels
    labels: {
      title: "Title",
      description: "Description",
      brand: "Brand",
      condition: "Condition",
      category: "Category",
      size: "Size",
      gender: "Gender",
      price: "Price",
      olxCategoryId: "OLX Category ID",
      vintedCatalogId: "Vinted Catalog ID",
      ebayCategoryPath: "eBay Category Path",
    },
    
    // Helper Text
    helper: {
      priceRange: "Suggested price range: PLN{min} - PLN{max}",
      notConnected: "(not connected)",
    },
    
    // Buttons
    buttons: {
      back: "Back",
      publishing: "Publishing...",
      publish: "Publish Item",
      updating: "Updating...",
      update: "Update Item",
    },
    
    // Platform Names (for capitalization)
    platforms: {
      facebook: "Facebook",
      olx: "OLX",
      vinted: "Vinted",
      ebay: "eBay",
    },
  },
  
  pl: {
    // Powiadomienia Toast
    toast: {
      noPlatformsTitle: "Nie wybrano platform",
      noPlatformsDesc: "Wybierz przynajmniej jedną platformę do publikacji",
      successTitle: "Sukces!",
      publishedSuccess: "Opublikowano na {platform}.",
      publishError: "Błąd publikacji na {platform}",
      updateLocalSuccess: "Przedmiot został zaktualizowany.",
      updatedSuccess: "Zaktualizowano na {platform}.",
      updateError: "Błąd aktualizacji na {platform}",
      updateErrorDesc: "Nie udało się zaktualizować ogłoszenia na platformie.",
      generalSuccess: "Przedmiot został opublikowany.",
      errorTitle: "Błąd",
      errorDesc: "Nie udało się opublikować przedmiotu. Spróbuj ponownie.",
    },
    
    // Nagłówki sekcji
    sections: {
      images: "Zdjęcia",
      itemDetails: "Szczegóły przedmiotu",
      productAttributes: "Atrybuty produktu",
      platformOverrides: "Nadpisania platform",
      publishPlatforms: "Publikuj na platformach",
      updatePlatforms: "Aktualizuj na platformach",
    },
    
    // Etykiety formularza
    labels: {
      title: "Tytuł",
      description: "Opis",
      brand: "Marka",
      condition: "Stan",
      category: "Kategoria",
      size: "Rozmiar",
      gender: "Płeć",
      price: "Cena",
      olxCategoryId: "ID kategorii OLX",
      vintedCatalogId: "ID katalogu Vinted",
      ebayCategoryPath: "Ścieżka kategorii eBay",
    },
    
    // Tekst pomocniczy
    helper: {
      priceRange: "Sugerowany zakres: {min}–{max} PLN",
      notConnected: "(nie połączono)",
    },
    
    // Przyciski
    buttons: {
      back: "Wstecz",
      publishing: "Publikowanie...",
      publish: "Opublikuj przedmiot",
      updating: "Aktualizowanie...",
      update: "Zaktualizuj przedmiot",
    },
    
    // Nazwy platform
    platforms: {
      facebook: "Facebook",
      olx: "OLX",
      vinted: "Vinted",
      ebay: "eBay",
    },
  },
};

export type ReviewItemFormTranslations = typeof reviewItemFormTranslations.en;
