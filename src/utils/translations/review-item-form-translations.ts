export const reviewItemFormTranslations = {
  en: {
    // Toast Messages
    toast: {
      noPlatformsTitle: "No platforms selected",
      noPlatformsDesc: "Please select at least one platform to publish to",
      successTitle: "Success!",
      publishedSuccess: "Published to {platform} successfully.",
      publishError: "Error publishing to {platform}",
      updateLocalSuccess: "Saved in FlipIt.",
      updatedSuccess: "Published changes to {platform}.",
      updateError: "Error publishing changes to {platform}",
      updateErrorDesc: "Failed to publish changes to the live listing.",
      saveAndUpdateSuccess: "Saved and published changes",
      saveAndUpdateSuccessDesc: "Changes were sent to {platforms}.",
      saveAndUpdatePartial: "Saved, but some publishes failed",
      saveAndUpdateMarketplaceError: "Saved in FlipIt, but publishing changes failed",
      saveAndUpdateFailedDesc: "Changes still need publishing for {platforms}.",
      saveAndUpdateNoMarketplaceChanges: "Saved in FlipIt. No marketplace changes needed.",
      generalSuccess: "Your item has been published successfully",
      errorTitle: "Error",
      errorDesc: "Failed to publish item. Please try again.",
    },

    ai: {
      regenerateLabel: "Regenerate {field} with AI",
      regenerateTooltip: "Rewrite this field with AI using the listing details and the current page language.",
      regeneratedTitle: "AI field updated",
      regeneratedDescription: "{field} was regenerated. Review it before saving.",
      regeneratedSavedDescription: "{field} was regenerated and saved.",
      missingItemTitle: "Save the listing first",
      missingItemDescription: "AI regeneration is available after the listing draft exists.",
      errorTitle: "AI regeneration failed",
    },
    
    // Section Headers
    sections: {
      images: "Images",
      itemDetails: "Item Details",
      productAttributes: "Product Attributes",
      platformOverrides: "Platform Overrides",
      publishPlatforms: "Publish to Platforms",
      updatePlatforms: "Publish changes to Platforms",
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
      currency: "Currency",
      olxCategoryId: "OLX Category ID",
      vintedCatalogId: "Vinted Catalog ID",
      ebayCategoryPath: "eBay Category Path",
      ebayMarketplaceId: "eBay Marketplace ID",
      allegroCategoryId: "Allegro Category ID",
      allegroMarketplaceId: "Allegro Marketplace ID",
      etsyCategoryId: "Etsy Category ID",
    },
    
    // Helper Text
    helper: {
      priceRange: "Suggested price range: {min}-{max} {currency}",
      notConnected: "(not connected)",
    },
    
    // Buttons
    buttons: {
      back: "Back",
      saving: "Saving...",
      saveChanges: "Save in FlipIt",
      savingAndUpdating: "Saving & publishing...",
      saveAndUpdateMarketplace: "Save & publish changes to {platform}",
      saveAndUpdateMarketplaces: "Save & publish changes to marketplaces",
      publishing: "Publishing...",
      publish: "Publish Item",
      updating: "Saving...",
      update: "Save in FlipIt",
    },
    
    // Platform Names (for capitalization)
    platforms: {
      facebook: "Facebook",
      olx: "OLX",
      vinted: "Vinted",
      ebay: "eBay",
      allegro: "Allegro",
      etsy: "Etsy",
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
      updateLocalSuccess: "Zapisano w FlipIt.",
      updatedSuccess: "Opublikowano zmiany na {platform}.",
      updateError: "Błąd publikacji zmian na {platform}",
      updateErrorDesc: "Nie udało się opublikować zmian w ogłoszeniu na żywo.",
      saveAndUpdateSuccess: "Zapisano i opublikowano zmiany",
      saveAndUpdateSuccessDesc: "Zmiany zostały wysłane do: {platforms}.",
      saveAndUpdatePartial: "Zapisano, ale część publikacji się nie powiodła",
      saveAndUpdateMarketplaceError: "Zapisano w FlipIt, ale publikacja zmian się nie powiodła",
      saveAndUpdateFailedDesc: "Zmiany nadal wymagają publikacji dla: {platforms}.",
      saveAndUpdateNoMarketplaceChanges: "Zapisano w FlipIt. Brak zmian do publikacji na marketplace'ach.",
      generalSuccess: "Przedmiot został opublikowany.",
      errorTitle: "Błąd",
      errorDesc: "Nie udało się opublikować przedmiotu. Spróbuj ponownie.",
    },

    ai: {
      regenerateLabel: "Wygeneruj ponownie pole {field} przez AI",
      regenerateTooltip: "Przepisuje to pole przez AI na podstawie szczegółów ogłoszenia i aktualnego języka strony.",
      regeneratedTitle: "Pole zaktualizowane przez AI",
      regeneratedDescription: "Pole {field} zostało wygenerowane ponownie. Sprawdź je przed zapisaniem.",
      regeneratedSavedDescription: "Pole {field} zostało wygenerowane ponownie i zapisane.",
      missingItemTitle: "Najpierw zapisz ogłoszenie",
      missingItemDescription: "Regeneracja AI jest dostępna po utworzeniu szkicu ogłoszenia.",
      errorTitle: "Regeneracja AI nie powiodła się",
    },
    
    // Nagłówki sekcji
    sections: {
      images: "Zdjęcia",
      itemDetails: "Szczegóły przedmiotu",
      productAttributes: "Atrybuty produktu",
      platformOverrides: "Nadpisania platform",
      publishPlatforms: "Publikuj na platformach",
      updatePlatforms: "Publikuj zmiany na platformach",
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
      currency: "Waluta",
      olxCategoryId: "ID kategorii OLX",
      vintedCatalogId: "ID katalogu Vinted",
      ebayCategoryPath: "Ścieżka kategorii eBay",
      ebayMarketplaceId: "ID giełdy eBay",
      allegroCategoryId: "ID kategorii Allegro",
      allegroMarketplaceId: "ID rynku Allegro",
      etsyCategoryId: "ID kategorii Etsy",
    },
    
    // Tekst pomocniczy
    helper: {
      priceRange: "Sugerowany zakres: {min}-{max} {currency}",
      notConnected: "(nie połączono)",
    },
    
    // Przyciski
    buttons: {
      back: "Wstecz",
      saving: "Zapisywanie...",
      saveChanges: "Zapisz w FlipIt",
      saveAndUpdateMarketplace: "Zapisz i opublikuj zmiany na {platform}",
      saveAndUpdateMarketplaces: "Zapisz i opublikuj zmiany na marketplace'ach",
      savingAndUpdating: "Zapisywanie i publikowanie...",
      publishing: "Publikowanie...",
      publish: "Opublikuj przedmiot",
      updating: "Zapisywanie...",
      update: "Zapisz w FlipIt",
    },
    
    // Nazwy platform
    platforms: {
      facebook: "Facebook",
      olx: "OLX",
      vinted: "Vinted",
      ebay: "eBay",
      allegro: "Allegro",
      etsy: "Etsy",
    },
  },
};

export type ReviewItemFormTranslations = typeof reviewItemFormTranslations.en;
