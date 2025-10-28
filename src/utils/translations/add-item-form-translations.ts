export const addItemFormTranslations = {
  en: {
    // Toast Messages
    toast: {
      noImagesTitle: "No images",
      noImagesDesc: "Please add at least one image of your item",
      uploadInProgressTitle: "Upload in progress",
      uploadInProgressDesc: "Please wait until all images finish uploading",
      errorTitle: "Error",
      errorDesc: "Failed to generate item data. Please try again.",
    },
    
    // Section Headers
    sections: {
      uploadImages: "Upload Images",
      itemDetails: "Item Details (Optional)",
      helperText: "Fill in what you know. Our system will help generate the rest.",
    },
    
    // Form Labels
    labels: {
      title: "Title",
      description: "Description",
      brand: "Brand",
      condition: "Condition",
      category: "Category",
      price: "Price",
      size: "Size",
      gender: "Gender",
    },
    
    // Placeholders
    placeholders: {
      title: "e.g., Nike Air Max 90",
      description: "Describe your item",
      brand: "e.g., Nike, Samsung, IKEA",
      condition: "e.g., New, Used - Like New",
      category: "e.g., Electronics, Clothing",
      price: "e.g., 49.99",
      size: "e.g., M, L, XL",
      gender: "e.g., Man, woman, unisex",
    },
    
    // Buttons
    buttons: {
      generating: "Generating...",
      continue: "Continue",
    },
  },
  
  pl: {
    // Powiadomienia Toast
    toast: {
      noImagesTitle: "Brak zdjęć",
      noImagesDesc: "Dodaj przynajmniej jedno zdjęcie swojego przedmiotu",
      uploadInProgressTitle: "Trwa przesyłanie",
      uploadInProgressDesc: "Poczekaj, aż wszystkie zdjęcia zostaną przesłane",
      errorTitle: "Błąd",
      errorDesc: "Nie udało się wygenerować danych przedmiotu. Spróbuj ponownie.",
    },
    
    // Nagłówki sekcji
    sections: {
      uploadImages: "Prześlij Zdjęcia",
      itemDetails: "Szczegóły Przedmiotu (Opcjonalne)",
      helperText: "Wypełnij to, co wiesz. Nasz system pomoże wygenerować resztę.",
    },
    
    // Etykiety formularza
    labels: {
      title: "Tytuł",
      description: "Opis",
      brand: "Marka",
      condition: "Stan",
      category: "Kategoria",
      price: "Cena",
      size: "Rozmiar",
      gender: "Płeć",
    },
    
    // Placeholdery
    placeholders: {
      title: "np. Nike Air Max 90",
      description: "Opisz swój przedmiot",
      brand: "np. Nike, Samsung, IKEA",
      condition: "np. Nowy, Używany - Jak Nowy",
      category: "np. Elektronika, Odzież",
      price: "np. 49.99",
      size: "np. M, L, XL",
      gender: "np. Mężczyzna, kobieta, unisex",
    },
    
    // Przyciski
    buttons: {
      generating: "Generowanie...",
      continue: "Kontynuuj",
    },
  },
};

export type AddItemFormTranslations = typeof addItemFormTranslations.en;
