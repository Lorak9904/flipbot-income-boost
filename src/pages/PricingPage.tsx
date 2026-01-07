import { useState } from 'react';
import { motion } from 'framer-motion';
import { HeroCTA } from '@/components/ui/button-presets';
import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';
import { getTranslations, getCurrentLanguage } from '../components/language-utils';
import { pricingTranslations } from './pricing-translations';
import { PricingToggle } from '@/components/pricing/PricingToggle';
import { PricingCard } from '@/components/pricing/PricingCard';
import { PricingFAQ } from '@/components/pricing/PricingFAQ';
import { TrustSection } from '@/components/pricing/TrustSection';
import { AnimatedGradientBackground } from '@/components/AnimatedGradientBackground';

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
  const t = getTranslations(pricingTranslations);

  const pageTitle = 'FlipIt Pricing - Choose Your Reselling Plan | myflipit.live';
  const pageDescription = 'Transparent pricing for FlipIt\'s marketplace automation. Free Starter plan, Pro at 99 PLN/month, Business at 299 PLN/month. All plans include OLX, Vinted, and Facebook integration.';
  const keywords = [
    'FlipIt pricing',
    'reselling platform cost',
    'marketplace automation pricing',
    'OLX automation price',
    'Vinted automation cost',
  ];

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
      ctaLink: '/login?register=1',
      featured: false,
    },
    {
      name: t.proName,
      description: t.proDescription,
      price: t.proPrice,
      annualPrice: t.proAnnualPrice,
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
      ctaLink: '/login?register=1&plan=pro',
      featured: true,
    },
    {
      name: t.businessName,
      description: t.businessDescription,
      price: t.businessPrice,
      annualPrice: t.businessAnnualPrice,
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
      ctaLink: '/login?register=1&plan=business',
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
              
              <div className="pt-4">
                <PricingToggle
                  billingCycle={billingCycle}
                  onChange={setBillingCycle}
                  monthlyLabel={t.monthly}
                  annualLabel={t.annual}
                  savingsLabel={t.savePercent}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Cards Section */}
      <section className="relative py-24">
        <div className="container mx-auto px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <PricingCard
                key={plan.name}
                {...plan}
                billingCycle={billingCycle}
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
            className="w-full max-w-2xl mx-auto rounded-3xl bg-gradient-to-r from-cyan-500/30 via-fuchsia-500/20 to-cyan-400/30 p-8 shadow-2xl text-center"
          >
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6 text-white drop-shadow-lg">
              {t.ctaTitle}
            </h2>
            <p className="md:text-lg text-neutral-300 mb-8">
              {t.ctaDescription}
            </p>
            <HeroCTA asChild>
              <Link to="/login?register=1">{t.ctaButton}</Link>
            </HeroCTA>
            <p className="text-sm text-neutral-400 mt-4">{t.ctaSubtext}</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;
