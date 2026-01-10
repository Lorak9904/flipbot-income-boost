import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';
import { HeroCTAWithArrow, SecondaryAction } from '@/components/ui/button-presets';
import { getCurrentLanguage, getTranslations } from '../components/language-utils';
import { getStartedTranslations } from './getstarted-translations';
import { AnimatedGradientBackground } from '@/components/AnimatedGradientBackground';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 * i, duration: 0.6, ease: 'easeOut' },
  }),
};

const keywords = [
  'marketplace automation',
  'AI crosslisting',
  'crosslisting automation',
  'OLX listing tool',
  'Vinted listing tool',
  'Facebook Marketplace listing tool',
  'eBay listing tool',
  'reseller tools',
  'ecommerce automation',
  'reselling side hustle',
];

const GetStartedPage = () => {
  const t = getTranslations(getStartedTranslations);
  const language = getCurrentLanguage();

  const pageTitle = t.pageTitle;
  const pageDescription = t.pageDescription;

  const benefits = [
    { title: t.benefit1Title, desc: t.benefit1Description },
    { title: t.benefit2Title, desc: t.benefit2Description },
    { title: t.benefit3Title, desc: t.benefit3Description },
    { title: t.benefit4Title, desc: t.benefit4Description },
  ];

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: pageTitle,
    description: pageDescription,
    url: 'https://myflipit.live/get-started',
    inLanguage: language === 'pl' ? 'pl-PL' : 'en-US',
    potentialAction: {
      '@type': 'RegisterAction',
      target: 'https://myflipit.live/login?register=1',
      name: t.primaryCta,
    },
  };

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        canonicalUrl="https://myflipit.live/get-started"
        keywords={keywords}
        structuredData={structuredData}
        language={language}
      />
      <AnimatedGradientBackground />

      {/* Hero Section */}
      <section className="relative py-24">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="fluid-text-lg font-extrabold tracking-tight leading-tight mb-6 text-balance"
          >
            {t.heroTitle} <span className="text-cyan-400">{t.heroTitleHighlight}</span> {t.heroTitleEnd}
          </motion.h1>
          <motion.p
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="max-w-2xl mx-auto text-lg text-neutral-300"
          >
            {t.heroDescription}
          </motion.p>
          <motion.div
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <HeroCTAWithArrow asChild>
              <Link to="/login?register=1">{t.primaryCta}</Link>
            </HeroCTAWithArrow>
            <SecondaryAction asChild>
              <Link to="/login">{t.secondaryCta}</Link>
            </SecondaryAction>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="relative py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="text-2xl md:text-3xl font-bold mb-10 text-center"
            >
              {t.benefitsTitle}
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {benefits.map((benefit, i) => (
                <motion.div
                  key={benefit.title}
                  custom={i + 1}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="bg-neutral-900/50 backdrop-blur-sm rounded-xl p-6 ring-1 ring-cyan-400/20"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-cyan-400/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-cyan-400 font-medium">{i + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-xl mb-2">{benefit.title}</h3>
                      <p className="text-neutral-300">{benefit.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-16 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="max-w-3xl mx-auto px-4"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-6">{t.finalCtaTitle}</h2>
          <HeroCTAWithArrow asChild>
            <Link to="/login?register=1">{t.finalCtaButton}</Link>
          </HeroCTAWithArrow>
        </motion.div>
      </section>
    </div>
  );
};

export default GetStartedPage;
