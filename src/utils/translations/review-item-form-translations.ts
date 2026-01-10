export const reviewItemFormTranslations = {
  en: {
    // Toast Messages
    toast: {
      noPlatformsTitle: "No platforms selected",
      noPlatformsDesc: "Please select at least one platform to publish to",
      successTitle: "Success!",
      publishedSuccess: "Published to {platform} successfully.",
      publishError: "Error publishing to {platform}",
      generalSuccess: "Your item has been published successfully",
      errorTitle: "Error",
      errorDesc: "Failed to publish item. Please try again.",
    },
    
    // Section Headers
    sections: {
      images: "Images",
      itemDetails: "Item Details",
      productAttributes: "Product Attributes",
      publishPlatforms: "Publish to Platforms",
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
      generalSuccess: "Przedmiot został opublikowany.",
      errorTitle: "Błąd",
      errorDesc: "Nie udało się opublikować przedmiotu. Spróbuj ponownie.",
    },
    
    // Nagłówki sekcji
    sections: {
      images: "Zdjęcia",
      itemDetails: "Szczegóły przedmiotu",
      productAttributes: "Atrybuty produktu",
      publishPlatforms: "Publikuj na platformach",
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
