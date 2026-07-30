import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';
import { getTranslations, getCurrentLanguage, getLocalizedPathForLanguage } from '../components/language-utils';
import { pricingTranslations } from './pricing-translations';
import { PricingToggle } from '@/components/pricing/PricingToggle';
import { PricingCard } from '@/components/pricing/PricingCard';
import { PricingFAQ } from '@/components/pricing/PricingFAQ';
import { CurrencySelector } from '@/components/pricing/CurrencySelector';
import { AnimatedGradientBackground } from '@/components/AnimatedGradientBackground';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { createCheckoutSession } from '@/lib/api/billing';
import { MarketingCtaBanner } from '@/components/marketing/MarketingCtaBanner';
import { getSeoMetadata } from '@/lib/seo-metadata';
import {
  CHECKOUT_CURRENCY_STORAGE_KEY,
  type BillingCurrency,
  type PaidPlan,
  formatPlanPrice,
  getInitialBillingCurrency,
  normalizeBillingCurrency,
  persistBillingCurrency,
} from '@/lib/billing-pricing';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CheckoutDisclosure } from '@/components/billing/CheckoutDisclosure';
import { HeroCTA, SecondaryAction } from '@/components/ui/button-presets';

declare global {
  interface Window {
    Tawk_API?: {
      hideWidget?: () => void;
      showWidget?: () => void;
      onLoad?: () => void;
    };
  }
}

const PricingPage = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [billingCurrency, setBillingCurrency] = useState<BillingCurrency>(() =>
    getInitialBillingCurrency(getCurrentLanguage())
  );
  const [pendingCheckout, setPendingCheckout] = useState<{
    plan: PaidPlan;
    cycle: 'monthly' | 'annual';
    currency: BillingCurrency;
  } | null>(null);
  const t = getTranslations(pricingTranslations);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const language = getCurrentLanguage();
  const localized = (path: string) => getLocalizedPathForLanguage(path, language);

  const clearCheckoutIntent = () => {
    sessionStorage.removeItem('flipit_checkout_plan');
    sessionStorage.removeItem('flipit_checkout_billing');
    sessionStorage.removeItem(CHECKOUT_CURRENCY_STORAGE_KEY);
  };

  const seo = getSeoMetadata('pricing', language);
  const pageTitle = seo?.title ?? t.heroTitle;
  const pageDescription = seo?.description ?? t.heroDescription;
  const keywords = [
    'FlipIt pricing',
    'reselling platform cost',
    'marketplace automation pricing',
    'OLX automation price',
    'Vinted automation cost',
  ];

  const handleCurrencyChange = (currency: BillingCurrency) => {
    setBillingCurrency(currency);
    persistBillingCurrency(currency);
  };

  const startCheckout = useCallback(async (
    plan: PaidPlan,
    cycle: 'monthly' | 'annual',
    currency: BillingCurrency,
  ) => {
    try {
      const checkoutUrl = await createCheckoutSession(plan, cycle, currency);
      window.location.href = checkoutUrl;
    } catch (error: unknown) {
      toast({
        title: t.checkoutErrorTitle,
        description: error instanceof Error ? error.message : t.checkoutErrorMessage,
        variant: 'destructive',
      });
    }
  }, [t.checkoutErrorMessage, t.checkoutErrorTitle, toast]);

  const handleCheckout = (plan: 'plus' | 'scale' | 'unlimited') => {
    if (!isAuthenticated) {
      sessionStorage.setItem('flipit_checkout_plan', plan);
      sessionStorage.setItem('flipit_checkout_billing', billingCycle);
      sessionStorage.setItem(CHECKOUT_CURRENCY_STORAGE_KEY, billingCurrency);
      navigate(localized('/login?register=1'));
      return;
    }

    setPendingCheckout({ plan, cycle: billingCycle, currency: billingCurrency });
  };

  const handleStartSignup = () => {
    clearCheckoutIntent();
    navigate(localized('/login?register=1'));
  };

  useEffect(() => {
    const tawk = window.Tawk_API || (window.Tawk_API = {});
    const previousOnLoad = tawk.onLoad;
    const hideTawkWidget = () => {
      if (typeof tawk.hideWidget === 'function') {
        tawk.hideWidget();
      }
    };

    hideTawkWidget();
    tawk.onLoad = () => {
      if (typeof previousOnLoad === 'function') {
        previousOnLoad();
      }
      hideTawkWidget();
    };

    return () => {
      if (typeof previousOnLoad === 'function') {
        tawk.onLoad = previousOnLoad;
      } else {
        delete tawk.onLoad;
      }
      if (typeof tawk.showWidget === 'function') {
        tawk.showWidget();
      }
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const plan = params.get('plan') || sessionStorage.getItem('flipit_checkout_plan');
    const cycle = params.get('billing') || sessionStorage.getItem('flipit_checkout_billing') || billingCycle;
    const currency = normalizeBillingCurrency(
      params.get('currency') ||
      sessionStorage.getItem(CHECKOUT_CURRENCY_STORAGE_KEY) ||
      billingCurrency
    ) || billingCurrency;
    const shouldCheckout = params.get('checkout') === '1' || sessionStorage.getItem('flipit_checkout_plan');

    if (pendingCheckout || !isAuthenticated || !shouldCheckout || !plan) {
      return;
    }

    if (plan !== 'plus' && plan !== 'scale' && plan !== 'unlimited') {
      return;
    }

    const remainingParams = new URLSearchParams(location.search);
    for (const key of ['checkout', 'plan', 'billing', 'currency']) {
      remainingParams.delete(key);
    }
    navigate({
      pathname: location.pathname,
      search: remainingParams.size > 0 ? `?${remainingParams.toString()}` : '',
    }, { replace: true });

    sessionStorage.removeItem('flipit_checkout_plan');
    sessionStorage.removeItem('flipit_checkout_billing');
    sessionStorage.removeItem(CHECKOUT_CURRENCY_STORAGE_KEY);
    const normalizedCycle: 'monthly' | 'annual' = cycle === 'annual' ? 'annual' : 'monthly';
    if (currency !== billingCurrency) {
      handleCurrencyChange(currency);
    }
    setPendingCheckout({ plan, cycle: normalizedCycle, currency });
  }, [billingCycle, billingCurrency, isAuthenticated, location.pathname, location.search, navigate, pendingCheckout]);

  const confirmCheckout = () => {
    if (!pendingCheckout) return;
    const checkout = pendingCheckout;
    setPendingCheckout(null);
    void startCheckout(checkout.plan, checkout.cycle, checkout.currency);
  };

  const pricingPlans = [
    {
      name: t.starterName,
      description: t.starterDescription,
      price: t.starterPrice,
      features: [
        t.starterFeature1,
        t.starterFeature2,
        t.starterFeature3,
        t.starterFeature4,
        t.starterFeature5,
      ],
      ctaText: t.starterCta,
      ctaOnClick: handleStartSignup,
      featured: false,
    },
    {
      name: t.proName,
      description: t.proDescription,
      price: formatPlanPrice('plus', billingCurrency, 'monthly'),
      annualPrice: formatPlanPrice('plus', billingCurrency, 'annual'),
      features: [
        t.proFeature1,
        t.proFeature2,
        t.proFeature3,
        t.proFeature4,
        t.proFeature5,
        t.proFeature6,
        t.proFeature7,
        t.proFeature8,
        t.proFeature9,
      ],
      badge: t.proBadge,
      ctaText: t.proCta,
      ctaOnClick: () => handleCheckout('plus'),
      ctaLink: localized('/login?register=1&plan=plus'),
      featured: true,
    },
    {
      name: t.businessName,
      description: t.businessDescription,
      price: formatPlanPrice('scale', billingCurrency, 'monthly'),
      annualPrice: formatPlanPrice('scale', billingCurrency, 'annual'),
      features: [
        t.businessFeature1,
        t.businessFeature2,
        t.businessFeature3,
        t.businessFeature4,
        t.businessFeature5,
        t.businessFeature6,
        t.businessFeature7,
        t.businessFeature8,
        t.businessFeature9,
      ],
      ctaText: t.businessCta,
      ctaOnClick: () => handleCheckout('scale'),
      ctaLink: localized('/login?register=1&plan=scale'),
      featured: false,
    },
    {
      name: t.unlimitedName,
      description: t.unlimitedDescription,
      price: formatPlanPrice('unlimited', billingCurrency, 'monthly'),
      annualPrice: formatPlanPrice('unlimited', billingCurrency, 'annual'),
      features: [
        t.unlimitedFeature1,
        t.unlimitedFeature2,
        t.unlimitedFeature3,
        t.unlimitedFeature4,
        t.unlimitedFeature5,
        t.unlimitedFeature6,
        t.unlimitedFeature7,
        t.unlimitedFeature8,
        t.unlimitedFeature9,
      ],
      badge: t.unlimitedBadge,
      ctaText: t.unlimitedCta,
      ctaOnClick: () => handleCheckout('unlimited'),
      ctaLink: localized('/login?register=1&plan=unlimited'),
      featured: false,
    },
  ];

  const faqs = [
    { question: t.faq1Question, answer: t.faq1Answer },
    { question: t.faq2Question, answer: t.faq2Answer },
    { question: t.faq3Question, answer: t.faq3Answer },
    { question: t.faq4Question, answer: t.faq4Answer },
    { question: t.faq5Question, answer: t.faq5Answer },
    { question: t.faq6Question, answer: t.faq6Answer },
  ];

  return (
    <div className="relative min-h-screen overflow-x-clip text-white">
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        canonicalUrl="https://myflipit.live/pricing"
        keywords={keywords}
        language={language}
      />
      
      <AnimatedGradientBackground />

      <section className="relative isolate flex items-center justify-center border-b border-white/5 py-14 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
            <div className="space-y-5">
              <h1 className="text-balance text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                {t.heroTitle}
              </h1>
              <p className="mx-auto max-w-2xl text-base leading-7 text-neutral-300 sm:text-lg">
                {t.heroDescription}
              </p>
              
              <div className="flex flex-col items-center gap-4 pt-3">
                <PricingToggle
                  billingCycle={billingCycle}
                  onChange={setBillingCycle}
                  monthlyLabel={t.monthly}
                  annualLabel={t.annual}
                  savingsLabel={t.savePercent}
                />
                <CurrencySelector
                  currency={billingCurrency}
                  onChange={handleCurrencyChange}
                  label={t.currencyLabel || 'Currency'}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards Section */}
      <section className="relative py-16 md:py-20">
        <div className="container relative z-10 mx-auto px-4 sm:px-6">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {pricingPlans.map((plan, index) => (
              <PricingCard
                key={plan.name}
                {...plan}
                billingCycle={billingCycle}
                perMonthLabel={t.perMonth}
                perYearLabel={t.perYear}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <PricingFAQ title={t.faqTitle} faqs={faqs} />

      <section className="relative border-t border-white/5 py-16 md:py-20">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-bold md:text-3xl">{t.trustTitle}</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[t.trustPoint1, t.trustPoint2, t.trustPoint3].map((point) => (
              <div key={point} className="rounded-lg border border-white/10 bg-neutral-950/70 p-5 text-sm leading-6 text-neutral-200">
                {point}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-16 md:py-20">
        <div className="container relative z-10 mx-auto flex flex-col items-center justify-center px-4 sm:px-6">
          <div className="w-full">
            <MarketingCtaBanner
              title={t.ctaTitle}
              description={t.ctaDescription}
              primaryAction={{
                text: t.ctaButton,
                href: localized('/login?register=1'),
                onClick: clearCheckoutIntent,
              }}
              footer={t.ctaSubtext}
            />
          </div>
        </div>
      </section>

      <AlertDialog open={Boolean(pendingCheckout)} onOpenChange={(open) => !open && setPendingCheckout(null)}>
        <AlertDialogContent className="border-neutral-800 bg-neutral-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">{t.confirmCheckoutTitle}</AlertDialogTitle>
            {pendingCheckout && (
              <CheckoutDisclosure
                variant="subscription"
                price={formatPlanPrice(pendingCheckout.plan, pendingCheckout.currency, pendingCheckout.cycle)}
                period={pendingCheckout.cycle === 'monthly' ? t.perMonth : t.perYear}
              />
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <SecondaryAction>{t.cancelCheckout}</SecondaryAction>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <HeroCTA onClick={confirmCheckout}>{t.continueToCheckout}</HeroCTA>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PricingPage;
