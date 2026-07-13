export const faqContent = {
  en: {
    heroTitle: 'Questions about FlipIt',
    heroDescription: 'Clear answers about listing drafts, connected marketplaces, seller approval, and what FlipIt does today.',
    badges: ['Prepare once', 'Review every detail', 'Publish with approval'],
    sections: [
      {
        title: 'Creating and publishing listings',
        items: [
          { question: 'How does FlipIt create a listing from photos?', answer: 'Upload one or more product photos. FlipIt prepares a draft title, description, category suggestions, price context, and known marketplace requirements. You can edit the result before saving or publishing it.' },
          { question: 'Does FlipIt publish without my approval?', answer: 'No. You review the listing and choose the destination marketplaces before any publication attempt.' },
          { question: 'Do I need the same details for every marketplace?', answer: 'No. Each marketplace and category can require different information. FlipIt shows destination-specific required fields, such as brand, size, package size, storage capacity, or shipping settings, when that metadata is available.' },
          { question: 'Can I use FlipIt in English and Polish?', answer: 'Yes. The interface is available in English and Polish. Changing the interface language does not translate or discard data already entered in a listing form.' },
        ],
      },
      {
        title: 'Connections and listing status',
        items: [
          { question: 'Which marketplace connections are available?', answer: 'FlipIt includes workflows for OLX, Vinted, eBay, Allegro, Etsy, and Facebook Marketplace. Capabilities vary by provider because each platform exposes different APIs and account requirements.' },
          { question: 'Which OLX countries are supported?', answer: 'The current OLX integration supports country-specific accounts for Poland, Bulgaria, Romania, Portugal, Ukraine, and Kazakhstan. Availability can change with provider access.', linkText: 'Read the OLX country guide', linkHref: '/articles/olx-listing-automation-by-country' },
          { question: 'Are listing statuses always synchronized?', answer: 'Not for every marketplace. FlipIt stores the last known result and can refresh remote status where a supported provider check exists. A successful past publication does not guarantee that an offer is still live.' },
          { question: 'What happens when a connection expires?', answer: 'FlipIt reports that the account needs attention. Reconnect the marketplace before retrying actions that require its credentials.' },
        ],
      },
      {
        title: 'AI, privacy, and billing',
        items: [
          { question: 'Can AI invent missing product details?', answer: 'It should not. AI suggestions are intended to use visible or supplied evidence. Confirm important facts such as quantity, brand, condition, size, compatibility, and model before publishing.' },
          { question: 'Where are my marketplace credentials stored?', answer: 'Marketplace credentials and session data are handled by the backend and stored according to the integration type. Sensitive values are not intended to be exposed in normal application logs.' },
          { question: 'How do plans and credits work?', answer: 'The free Start plan has limited monthly usage. Paid plans increase publication and AI image limits. Current prices and included credits are shown on the pricing page.' },
          { question: 'Can FlipIt answer buyer messages or negotiate for me?', answer: 'No. Buyer messaging and automated negotiation are not part of the current product.' },
        ],
      },
    ],
    deeperTitle: 'Want to see the complete workflow?',
    deeperDescription: 'See how a photo becomes a marketplace-specific draft, or read the detailed marketplace automation guide.',
    howItWorks: 'How FlipIt works',
    readGuide: 'Read the guide',
    contactTitle: 'Still have a question?',
    contactBefore: 'Email us at',
    contactAfter: 'and we will help you understand the right workflow.',
    ctaTitle: 'Prepare your first listing draft',
    ctaDescription: 'Create an account, connect a supported marketplace, and review every detail before publication.',
    ctaButton: 'Create an account',
  },
  pl: {
    heroTitle: 'Pytania o FlipIt',
    heroDescription: 'Konkretne odpowiedzi o szkicach ogłoszeń, połączonych platformach, akceptacji sprzedawcy i obecnych możliwościach FlipIt.',
    badges: ['Przygotuj raz', 'Sprawdź wszystkie dane', 'Publikuj po akceptacji'],
    sections: [
      {
        title: 'Tworzenie i publikowanie ogłoszeń',
        items: [
          { question: 'Jak FlipIt tworzy ogłoszenie ze zdjęć?', answer: 'Dodaj jedno lub kilka zdjęć produktu. FlipIt przygotuje szkic tytułu, opisu, sugestie kategorii, kontekst ceny oraz znane wymagania platform. Przed zapisaniem lub publikacją możesz wszystko edytować.' },
          { question: 'Czy FlipIt publikuje bez mojej zgody?', answer: 'Nie. Najpierw sprawdzasz ogłoszenie i wybierasz platformy docelowe. Dopiero potem możesz rozpocząć publikację.' },
          { question: 'Czy każda platforma wymaga tych samych danych?', answer: 'Nie. Wymagania zależą od platformy i kategorii. Gdy metadane są dostępne, FlipIt pokazuje wymagane pola dla konkretnego miejsca publikacji, np. markę, rozmiar, wielkość paczki, pojemność pamięci lub ustawienia wysyłki.' },
          { question: 'Czy mogę korzystać z FlipIt po polsku i angielsku?', answer: 'Tak. Interfejs jest dostępny po polsku i angielsku. Zmiana języka strony nie tłumaczy ani nie usuwa danych wpisanych wcześniej w formularzu ogłoszenia.' },
        ],
      },
      {
        title: 'Połączenia i statusy ogłoszeń',
        items: [
          { question: 'Jakie platformy można połączyć?', answer: 'FlipIt zawiera procesy dla OLX, Vinted, eBay, Allegro, Etsy i Facebook Marketplace. Zakres funkcji różni się, ponieważ każda platforma udostępnia inne API i wymaga innych danych konta.' },
          { question: 'Które kraje OLX są obsługiwane?', answer: 'Obecna integracja OLX obsługuje konta dla Polski, Bułgarii, Rumunii, Portugalii, Ukrainy i Kazachstanu. Dostępność może zmienić się wraz z zasadami dostawcy.', linkText: 'Przeczytaj poradnik o krajach OLX', linkHref: '/articles/olx-listing-automation-by-country' },
          { question: 'Czy statusy ogłoszeń zawsze są synchronizowane?', answer: 'Nie na każdej platformie. FlipIt zapisuje ostatni znany wynik i może odświeżyć zdalny status tam, gdzie mamy obsługiwany mechanizm sprawdzania. Dawna udana publikacja nie gwarantuje, że oferta nadal jest aktywna.' },
          { question: 'Co się stanie, gdy połączenie wygaśnie?', answer: 'FlipIt poinformuje, że konto wymaga uwagi. Przed ponowieniem operacji wymagającej dostępu połącz platformę ponownie.' },
        ],
      },
      {
        title: 'AI, prywatność i płatności',
        items: [
          { question: 'Czy AI może wymyślać brakujące informacje o produkcie?', answer: 'Nie powinno. Sugestie AI mają opierać się na zdjęciach i podanych informacjach. Przed publikacją potwierdź ważne dane, takie jak liczba sztuk, marka, stan, rozmiar, zgodność i model.' },
          { question: 'Gdzie przechowywane są dane dostępu do platform?', answer: 'Dane uwierzytelniające i sesje obsługuje backend zgodnie z typem integracji. Wrażliwe wartości nie powinny pojawiać się w zwykłych logach aplikacji.' },
          { question: 'Jak działają plany i kredyty?', answer: 'Bezpłatny plan Start ma ograniczony miesięczny limit. Płatne plany zwiększają limity publikacji i zdjęć AI. Aktualne ceny i dostępne kredyty znajdziesz w cenniku.' },
          { question: 'Czy FlipIt odpowiada kupującym lub negocjuje w moim imieniu?', answer: 'Nie. Obsługa wiadomości od kupujących i automatyczne negocjacje nie należą do obecnych funkcji produktu.' },
        ],
      },
    ],
    deeperTitle: 'Chcesz zobaczyć cały proces?',
    deeperDescription: 'Zobacz, jak zdjęcie staje się szkicem dopasowanym do platformy, albo przeczytaj dokładny przewodnik po automatyzacji.',
    howItWorks: 'Jak działa FlipIt',
    readGuide: 'Przeczytaj przewodnik',
    contactTitle: 'Masz jeszcze pytanie?',
    contactBefore: 'Napisz do nas na',
    contactAfter: 'a pomożemy dobrać właściwy proces.',
    ctaTitle: 'Przygotuj pierwszy szkic ogłoszenia',
    ctaDescription: 'Załóż konto, połącz obsługiwaną platformę i sprawdź wszystkie dane przed publikacją.',
    ctaButton: 'Załóż konto',
  },
} as const;
