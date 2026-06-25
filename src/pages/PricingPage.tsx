import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';
import { getTranslations, getCurrentLanguage } from '../components/language-utils';
import { pricingTranslations } from './pricing-translations';
import { PricingToggle } from '@/components/pricing/PricingToggle';
import { PricingCard } from '@/components/pricing/PricingCard';
import { PricingFAQ } from '@/components/pricing/PricingFAQ';
import { TrustSection } from '@/components/pricing/TrustSection';
import { CurrencySelector } from '@/components/pricing/CurrencySelector';
import { AnimatedGradientBackground } from '@/components/AnimatedGradientBackground';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { createCheckoutSession } from '@/lib/api/billing';
import { MarketingCtaBanner } from '@/components/marketing/MarketingCtaBanner';
import {
  CHECKOUT_CURRENCY_STORAGE_KEY,
  type BillingCurrency,
  type PaidPlan,
  formatPlanPrice,
  getInitialBillingCurrency,
  normalizeBillingCurrency,
  persistBillingCurrency,
} from '@/lib/billing-pricing';

declare global {
  interface Window {
    Tawk_API?: {
      hideWidget?: () => void;
      showWidget?: () => void;
      onLoad?: () => void;
    };
  }
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 * i, duration: 0.6, ease: 'easeOut' },
  }),
};

const PricingPage = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [billingCurrency, setBillingCurrency] = useState<BillingCurrency>(() =>
    getInitialBillingCurrency(getCurrentLanguage())
  );
  const [checkoutAttempted, setCheckoutAttempted] = useState(false);
  const t = getTranslations(pricingTranslations);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const clearCheckoutIntent = () => {
    sessionStorage.removeItem('flipit_checkout_plan');
    sessionStorage.removeItem('flipit_checkout_billing');
    sessionStorage.removeItem(CHECKOUT_CURRENCY_STORAGE_KEY);
  };

  const pageTitle = 'FlipIt Pricing - Choose Your Reselling Plan | myflipit.live';
  const pageDescription = 'Transparent pricing for FlipIt\'s marketplace automation. Start is free and paid plans are available in PLN and EUR. All plans include supported marketplaces.';
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

  const startCheckout = async (
    plan: PaidPlan,
    cycle: 'monthly' | 'annual',
    currency: BillingCurrency,
  ) => {
    try {
      const checkoutUrl = await createCheckoutSession(plan, cycle, currency);
      window.location.href = checkoutUrl;
    } catch (error: any) {
      toast({
        title: t.checkoutErrorTitle,
        description: error.message || t.checkoutErrorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleCheckout = async (plan: 'plus' | 'scale' | 'unlimited') => {
    if (!isAuthenticated) {
      sessionStorage.setItem('flipit_checkout_plan', plan);
      sessionStorage.setItem('flipit_checkout_billing', billingCycle);
      sessionStorage.setItem(CHECKOUT_CURRENCY_STORAGE_KEY, billingCurrency);
      navigate('/login?register=1');
      return;
    }

    await startCheckout(plan, billingCycle, billingCurrency);
  };

  const handleStartSignup = () => {
    clearCheckoutIntent();
    navigate('/login?register=1');
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

    if (checkoutAttempted || !isAuthenticated || !shouldCheckout || !plan) {
      return;
    }

    if (plan !== 'plus' && plan !== 'scale' && plan !== 'unlimited') {
      return;
    }

    sessionStorage.removeItem('flipit_checkout_plan');
    sessionStorage.removeItem('flipit_checkout_billing');
    sessionStorage.removeItem(CHECKOUT_CURRENCY_STORAGE_KEY);
    setCheckoutAttempted(true);
    const normalizedCycle: 'monthly' | 'annual' = cycle === 'annual' ? 'annual' : 'monthly';
    if (currency !== billingCurrency) {
      handleCurrencyChange(currency);
    }
    void startCheckout(plan, normalizedCycle, currency);
  }, [billingCycle, billingCurrency, checkoutAttempted, isAuthenticated, location.search]);

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
      ctaLink: '/login?register=1&plan=plus',
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
      ctaLink: '/login?register=1&plan=scale',
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
      ctaLink: '/login?register=1&plan=unlimited',
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

  const testimonials = [
    {
      quote: t.testimonial1,
      author: t.testimonial1Author,
      location: t.testimonial1Location,
    },
    {
      quote: t.testimonial2,
      author: t.testimonial2Author,
      location: t.testimonial2Location,
    },
    {
      quote: t.testimonial3,
      author: t.testimonial3Author,
      location: t.testimonial3Location,
    },
  ];

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        canonicalUrl="https://myflipit.live/pricing"
        keywords={keywords}
        language={getCurrentLanguage()}
      />
      
      <AnimatedGradientBackground />

      {/* Hero Section */}
      <section className="relative isolate overflow-hidden min-h-[50vh] flex items-center justify-center py-24">
        <div className="container mx-auto px-8">
          <div className="flex flex-col items-center text-center w-full max-w-3xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="space-y-8"
            >
              <h1 className="fluid-text-xl font-extrabold tracking-tight leading-tight text-balance">
                {t.heroTitle}
              </h1>
              <p className="max-w-2xl text-lg/relaxed text-neutral-300 mx-auto">
                {t.heroDescription}
              </p>
              
              <div className="flex flex-col items-center gap-5 pt-4">
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
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Cards Section */}
      <section className="relative py-24">
        <div className="container mx-auto px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
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

      {/* Trust Section */}
      <TrustSection title={t.trustTitle} testimonials={testimonials} />

      {/* Final CTA Section */}
      <section className="relative py-16">
        <div className="container mx-auto px-8 relative z-10 flex flex-col items-center justify-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="w-full"
          >
            <MarketingCtaBanner
              title={t.ctaTitle}
              description={t.ctaDescription}
              primaryAction={{
                text: t.ctaButton,
                href: '/login?register=1',
                onClick: clearCheckoutIntent,
              }}
              footer={t.ctaSubtext}
            />
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;
