import { Plug, Upload, Repeat } from 'lucide-react';
import { HeroCTAWithArrow } from '@/components/ui/button-presets';
import { SEOHead } from '@/components/SEOHead';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getTranslations, getCurrentLanguage } from '../components/language-utils';
import { howItWorksTranslations } from './howitworks-translations';
import { AnimatedGradientBackground } from '@/components/AnimatedGradientBackground';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 * i, duration: 0.6, ease: 'easeOut' },
  }),
};

const iconMap = [Plug, Upload, Repeat]; // keep icons aligned with steps order

  const HowItWorksPage = () => {
  const t = getTranslations(howItWorksTranslations);
  const pageTitle = 'How AI Crosslisting Works (OLX, Vinted, Facebook Marketplace, eBay)';
  const pageDescription = 'See how FlipIt turns one photo into marketplace-ready listing drafts for OLX, Vinted, Facebook Marketplace, and eBay — then publishes with your approval and tracks results per platform.';
  const keywords = [
    'automated reselling platform',
    'marketplace automation',
    'automation for marketplaces',
    'ecommerce automation',
    'OLX automation',
    'Vinted automation',
    'eBay automation',
    'Vinted app',
    'marketplace automation software',
    'AI crosslisting',
    'marketplace listing tool',
  ];
  const heroBadges = [t.badge1, t.badge2, t.badge3];

  const steps = [
    { title: t.step1Title, description: t.step1Description },
    { title: t.step2Title, description: t.step2Description },
    { title: t.step3Title, description: t.step3Description },
  ];

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: pageTitle,
    description: pageDescription,
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.title,
      text: step.description,
    })),
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        canonicalUrl="https://myflipit.live/how-it-works"
        keywords={keywords}
        structuredData={structuredData}
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
            </motion.div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="relative py-24">
        <div className="container mx-auto px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {steps.map(({ title, description }, i) => {
              const Icon = iconMap[i];
              return (
                <motion.div
                  key={title}
                  custom={i + 1}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="flex flex-col items-center gap-4 rounded-2xl bg-neutral-900/50 p-8 text-center backdrop-blur-sm ring-1 ring-neutral-700 hover:ring-cyan-400/40 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-400/10 ring-1 ring-cyan-400/20">
                    <Icon className="h-8 w-8 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-bold">{title}</h3>
                  <p className="text-neutral-300 text-base">{description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

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
            <Link to="/add-item">
              <HeroCTAWithArrow>
                {t.ctaButton}
              </HeroCTAWithArrow>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorksPage;



















