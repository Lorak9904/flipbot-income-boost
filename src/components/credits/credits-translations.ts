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
    
    // Plan names
    planStarter: "Start",
    planPro: "Plus",
    planBusiness: "Scale",
    
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
    free: "Free",
    
    // Billing
    billingInfo: "Billing Information",
    paymentMethod: "Payment Method",
    updatePayment: "Update Payment Method",
    noPaymentMethod: "No payment method on file",
    
    // Status messages
    upgradeSuccess: "Plan upgraded successfully!",
    downgradeSuccess: "Plan downgrade scheduled for end of billing period",
    cancelSuccess: "Subscription cancelled. You'll keep access until",
    errorLoading: "Failed to load credits information",
    errorUpgrade: "Failed to upgrade plan",
    
    // Confirmation dialogs
    confirmUpgrade: "Upgrade to {plan}?",
    confirmUpgradeMessage: "You'll be charged {price} immediately and get {credits} credits/month.",
    confirmDowngrade: "Downgrade to {plan}?",
    confirmDowngradeMessage: "This will take effect at the end of your current billing period.",
    confirmCancel: "Cancel Subscription?",
    confirmCancelMessage: "You'll lose access to {plan} features at the end of your billing period.",
    confirm: "Confirm",
    cancel: "Cancel",
    
    // Stripe integration
    redirectingToCheckout: "Redirecting to secure checkout...",
    processingPayment: "Processing payment...",
    
    // Credits health status
    healthyBalance: "Healthy balance",
    lowBalance: "Running low",
    criticalBalance: "Critical - consider upgrading",
    unlimitedBalance: "Unlimited credits",
    
    // Subscription details (Task 1)
    subscriptionTitle: "Subscription & Credits",
    subscriptionDetails: "Subscription Details",
    changePlan: "Change Plan",
    startedLabel: "Started",
    nextBillingLabel: "Next billing",
    activeUntilLabel: "Active until",
    cancelScheduled: "Subscription will cancel at period end",
    listingsRemaining: "Listings Remaining",
    imageEnhancements: "AI Photo Enhancements",
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
    
    // Plan names
    planStarter: "Start",
    planPro: "Plus",
    planBusiness: "Scale",
    
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
    free: "Darmowy",
    
    // Billing
    billingInfo: "Informacje rozliczeniowe",
    paymentMethod: "Metoda płatności",
    updatePayment: "Aktualizuj metodę płatności",
    noPaymentMethod: "Brak zapisanej metody płatności",
    
    // Status messages
    upgradeSuccess: "Plan został zaktualizowany!",
    downgradeSuccess: "Obniżenie planu zaplanowane na koniec okresu rozliczeniowego",
    cancelSuccess: "Subskrypcja anulowana. Zachowasz dostęp do",
    errorLoading: "Nie udało się załadować informacji o kredytach",
    errorUpgrade: "Nie udało się zaktualizować planu",
    
    // Confirmation dialogs
    confirmUpgrade: "Ulepszyć do {plan}?",
    confirmUpgradeMessage: "Zostaniesz obciążony {price} natychmiast i otrzymasz {credits} kredytów/miesiąc.",
    confirmDowngrade: "Obniżyć do {plan}?",
    confirmDowngradeMessage: "Zmiany wejdą w życie z końcem bieżącego okresu rozliczeniowego.",
    confirmCancel: "Anulować subskrypcję?",
    confirmCancelMessage: "Stracisz dostęp do funkcji planu {plan} z końcem okresu rozliczeniowego.",
    confirm: "Potwierdź",
    cancel: "Anuluj",
    
    // Stripe integration
    redirectingToCheckout: "Przekierowywanie do bezpiecznej płatności...",
    processingPayment: "Przetwarzanie płatności...",
    
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
    startedLabel: "Rozpoczęto",
    nextBillingmaining: "Pozostałe ogłoszenia",
    imageEnhancements: "Ulepszenia zdjęć AI",
    usedLabel: "Wykorzystano",
  },
};
