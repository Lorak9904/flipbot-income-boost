/**
 * Translation keys for credits management UI
 * Supports EN and PL languages
 */

export const creditsTranslations = {
  en: {
    // Section headers
    sectionTitle: "Subscription & Credits",
    currentPlan: "Current Plan",
    managePlan: "Manage Plan",
    
    // Credits balance
    creditsBalance: "Credits Balance",
    monthlyAllowance: "Monthly allowance",
    usedThisPeriod: "Used this period",
    remainingCredits: "Remaining",
    bonusCredits: "Bonus credits",
    totalAvailable: "Total available",
    period: "Period",
    resetsOn: "Resets on",
    unlimited: "Unlimited",
    
    // Actions
    viewHistory: "View Transaction History",
    viewPlans: "Compare Plans",
    goToSettings: "Go to Settings",
    upgrade: "Upgrade",
    downgrade: "Downgrade",
    cancelSubscription: "Cancel Subscription",
    
    // What credits are used for
    whatCreditsFor: "What credits are used for:",
    publishCost: "Each listing publish = 1 credit",
    enhanceCost: "Each AI image enhancement = 1 credit",
    
    // Insufficient credits
    insufficientTitle: "Insufficient Credits",
    insufficientMessage: "You need {required} credit(s) but have {available}.",
    resetsIn: "Credits reset in {days} days",
    lowCreditsWarning: "Low Credits",
    lowCreditsMessage: "You have {remaining} credits remaining.",
    needMoreCredits: "Need more credits? Upgrade your plan, or if you use Unlimited, buy an image-credit add-on in Settings.",
    
    // Transaction history
    transactionHistory: "Credit Transaction History",
    filterAll: "All",
    filterPublish: "Publish",
    filterEnhance: "Enhance",
    filterBonus: "Bonus",
    noTransactions: "No transactions yet",
    loadMore: "Load More",
    showing: "Showing {count} of {total} transactions",
    
    // Action types
    actionPublish: "Publish Listing",
    actionEnhance: "Enhance Image",
    actionRefill: "Credit Refill",
    actionRefund: "Refund",
    actionUpgrade: "Plan Upgrade",
    actionReset: "Monthly Reset",
    actionRenewal: "Subscription Renewal",
    
    // Plan names
    planStarter: "Start",
    planPro: "Plus",
    planBusiness: "Scale",
    planUnlimited: "Unlimited",
    
    // Plan management
    planManagement: "Manage Your Subscription",
    currentlyActive: "Currently Active",
    nextBilling: "Next billing date",
    comparePlans: "Compare Plans",
    planFeatures: "Features",
    planPrice: "Price",
    planCredits: "Credits",
    planPlatforms: "Platforms",
    planSupport: "Support",
    perMonth: "per month",
    perYear: "per year",
    free: "Free",
    
    // Billing
    billingInfo: "Billing Information",
    paymentMethod: "Payment Method",
    updatePayment: "Update Payment Method",
    noPaymentMethod: "No payment method on file",
    
    // Status messages
    upgradeSuccess: "Plan upgraded successfully!",
    downgradeSuccess: "Plan change submitted. Check Stripe Billing Portal for timing.",
    cancelSuccess: "Cancellation submitted. Check Stripe Billing Portal for timing.",
    errorLoading: "Failed to load credits information",
    errorUpgrade: "Failed to upgrade plan",
    
    // Confirmation dialogs
    confirmUpgrade: "Upgrade to {plan}?",
    confirmUpgradeMessage: "Stripe Checkout shows the final amount and timing before you confirm. This plan includes {credits} credits/month.",
    confirmDowngrade: "Downgrade to {plan}?",
    confirmDowngradeMessage: "Stripe Billing Portal shows the available change options and their timing, which may vary.",
    confirmCancel: "Cancel Subscription?",
    confirmCancelMessage: "Stripe Billing Portal shows the cancellation options and effective timing for {plan}, which may vary.",
    confirm: "Confirm",
    cancel: "Cancel",
    
    // Stripe integration
    redirectingToCheckout: "Redirecting to secure checkout...",
    processingPayment: "Processing payment...",
    portalManagedNotice: "Your subscription is active. Stripe Billing Portal shows available plan, billing, and cancellation options; timing and final amounts may vary.",
    openBillingPortal: "Open Stripe Billing Portal",
    managedInStripe: "Managed in Stripe",
    tryAgain: "Please try again later.",
    mostPopular: "30 listings / month",
    securePaymentsTitle: "Secure payments with Stripe",
    securePaymentsDescription: "Card details are entered in Stripe Checkout, where the final amount is shown before confirmation.",
    needHelp: "Need help choosing a plan? Contact us at myflipit@arrpo.com",
    metadataPlatform: "Platform",
    metadataDraft: "Listing ID",
    metadataPrompt: "Prompt",
    metadataSource: "Source",
    balanceLabel: "Balance",
    
    // Credits health status
    healthyBalance: "Healthy balance",
    lowBalance: "Running low",
    criticalBalance: "Critical - consider upgrading",
    unlimitedBalance: "Unlimited credits",
    
    // Subscription details (Task 1)
    subscriptionTitle: "Subscription & Credits",
    subscriptionDetails: "Subscription Details",
    changePlan: "Change Plan",
    billingLabel: "Billing",
    billingMonthly: "Monthly",
    billingAnnual: "Annual",
    currencyLabel: "Currency",
    startedLabel: "Started",
    nextBillingLabel: "Next billing",
    activeUntilLabel: "Active until",
    cancelScheduled: "Cancellation timing is shown in Stripe Billing Portal",
    listingsRemaining: "Listings Remaining",
    imageEnhancements: "AI Photo Enhancements",
    includedImageEnhancements: "Included AI Photo Enhancements",
    addonImageCredits: "Add-on AI Photo Credits",
    buyAddonCredits: "Buy Add-on Credits",
    addonPack50: "Buy +50 credits",
    addonPack100: "Buy +100 credits",
    usedLabel: "Used",
  },
  
  pl: {
    // Section headers
    sectionTitle: "Subskrypcja i kredyty",
    currentPlan: "Obecny plan",
    managePlan: "Zarządzaj planem",
    
    // Credits balance
    creditsBalance: "Saldo kredytów",
    monthlyAllowance: "Miesięczny limit",
    usedThisPeriod: "Wykorzystane w tym okresie",
    remainingCredits: "Pozostało",
    bonusCredits: "Kredyty bonusowe",
    totalAvailable: "Dostępne łącznie",
    period: "Okres",
    resetsOn: "Odnowienie",
    unlimited: "Bez limitu",
    
    // Actions
    viewHistory: "Zobacz historię transakcji",
    viewPlans: "Porównaj plany",
    goToSettings: "Przejdź do ustawień",
    upgrade: "Ulepsz",
    downgrade: "Obniż",
    cancelSubscription: "Anuluj subskrypcję",
    
    // What credits are used for
    whatCreditsFor: "Do czego służą kredyty:",
    publishCost: "Każda publikacja ogłoszenia = 1 kredyt",
    enhanceCost: "Każde ulepszenie zdjęcia AI = 1 kredyt",
    
    // Insufficient credits
    insufficientTitle: "Niewystarczające kredyty",
    insufficientMessage: "Potrzebujesz {required} kredytów, ale masz {available}.",
    resetsIn: "Kredyty odnowią się za {days} dni",
    lowCreditsWarning: "Niski stan kredytów",
    lowCreditsMessage: "Pozostało {remaining} kredytów.",
    needMoreCredits: "Potrzebujesz więcej kredytów? Zmień plan lub, jeśli korzystasz z planu Unlimited, kup dodatkowe kredyty na zdjęcia w Ustawieniach.",
    
    // Transaction history
    transactionHistory: "Historia transakcji kredytowych",
    filterAll: "Wszystkie",
    filterPublish: "Publikacje",
    filterEnhance: "Ulepszenia",
    filterBonus: "Bonusy",
    noTransactions: "Brak transakcji",
    loadMore: "Załaduj więcej",
    showing: "Wyświetlono {count} z {total} transakcji",
    
    // Action types
    actionPublish: "Publikacja ogłoszenia",
    actionEnhance: "Ulepszenie zdjęcia",
    actionRefill: "Doładowanie kredytów",
    actionRefund: "Zwrot",
    actionUpgrade: "Zmiana planu",
    actionReset: "Miesięczne odnowienie",
    actionRenewal: "Odnowienie subskrypcji",
    
    // Plan names
    planStarter: "Start",
    planPro: "Plus",
    planBusiness: "Scale",
    planUnlimited: "Unlimited",
    
    // Plan management
    planManagement: "Zarządzaj subskrypcją",
    currentlyActive: "Aktualnie aktywny",
    nextBilling: "Następna płatność",
    comparePlans: "Porównaj plany",
    planFeatures: "Funkcje",
    planPrice: "Cena",
    planCredits: "Kredyty",
    planPlatforms: "Platformy",
    planSupport: "Wsparcie",
    perMonth: "miesięcznie",
    perYear: "rocznie",
    free: "Darmowy",
    
    // Billing
    billingInfo: "Informacje rozliczeniowe",
    paymentMethod: "Metoda płatności",
    updatePayment: "Aktualizuj metodę płatności",
    noPaymentMethod: "Brak zapisanej metody płatności",
    
    // Status messages
    upgradeSuccess: "Plan został zaktualizowany!",
    downgradeSuccess: "Zmiana planu została zgłoszona. Sprawdź termin w Stripe Billing Portal.",
    cancelSuccess: "Anulowanie zostało zgłoszone. Sprawdź termin w Stripe Billing Portal.",
    errorLoading: "Nie udało się załadować informacji o kredytach",
    errorUpgrade: "Nie udało się zaktualizować planu",
    
    // Confirmation dialogs
    confirmUpgrade: "Ulepszyć do {plan}?",
    confirmUpgradeMessage: "Stripe Checkout pokaże ostateczną kwotę i termin przed potwierdzeniem. Ten plan obejmuje {credits} kredytów/miesiąc.",
    confirmDowngrade: "Obniżyć do {plan}?",
    confirmDowngradeMessage: "Stripe Billing Portal pokazuje dostępne opcje zmiany i ich terminy, które mogą się różnić.",
    confirmCancel: "Anulować subskrypcję?",
    confirmCancelMessage: "Stripe Billing Portal pokazuje opcje anulowania planu {plan} i termin ich wejścia w życie, który może się różnić.",
    confirm: "Potwierdź",
    cancel: "Anuluj",
    
    // Stripe integration
    redirectingToCheckout: "Przekierowywanie do bezpiecznej płatności...",
    processingPayment: "Przetwarzanie płatności...",
    portalManagedNotice: "Twoja subskrypcja jest aktywna. Stripe Billing Portal pokazuje dostępne opcje planu, rozliczeń i anulowania; terminy i ostateczne kwoty mogą się różnić.",
    openBillingPortal: "Otwórz Stripe Billing Portal",
    managedInStripe: "Zarządzane w Stripe",
    tryAgain: "Spróbuj ponownie później.",
    mostPopular: "30 ogłoszeń / miesiąc",
    securePaymentsTitle: "Bezpieczne płatności przez Stripe",
    securePaymentsDescription: "Dane karty wprowadzasz w Stripe Checkout, gdzie przed potwierdzeniem zobaczysz ostateczną kwotę.",
    needHelp: "Potrzebujesz pomocy przy wyborze planu? Napisz na myflipit@arrpo.com",
    metadataPlatform: "Platforma",
    metadataDraft: "ID ogłoszenia",
    metadataPrompt: "Polecenie",
    metadataSource: "Źródło",
    balanceLabel: "Saldo",
    
    // Credits health status
    healthyBalance: "Dobry stan",
    lowBalance: "Niski stan",
    criticalBalance: "Krytyczny — rozważ ulepszenie",
    unlimitedBalance: "Nieograniczone kredyty",
    
    // Subscription details (Task 1)
    subscriptionTitle: "Subskrypcja i kredyty",
    subscriptionDetails: "Szczegóły subskrypcji",
    changePlan: "Zmień plan",
    billingLabel: "Rozliczenia",
    billingMonthly: "Miesięczne",
    billingAnnual: "Roczne",
    currencyLabel: "Waluta",
    startedLabel: "Rozpoczęto",
    nextBillingLabel: "Następna płatność",
    listingsRemaining: "Pozostałe ogłoszenia",
    imageEnhancements: "Ulepszenia zdjęć AI",
    includedImageEnhancements: "Wliczone ulepszenia zdjęć AI",
    addonImageCredits: "Dodatkowe kredyty AI",
    buyAddonCredits: "Kup dodatkowe kredyty",
    addonPack50: "Kup +50 kredytów",
    addonPack100: "Kup +100 kredytów",
    usedLabel: "Wykorzystano",
  },
};
