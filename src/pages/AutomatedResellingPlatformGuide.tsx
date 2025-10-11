import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SEOHead } from '@/components/SEOHead';
import { getCurrentLanguage, getTranslations } from '@/components/language-utils';
import { guideTranslations } from './guide-translations';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 * i, duration: 0.6, ease: 'easeOut' },
  }),
};

const keywords = [
  'automated reselling platform',
  'AI crosslisting',
  'marketplace automation software',
  'OLX crosslisting tool',
  'Vinted crosslisting automation',
  'one photo crosslisting',
  'seller automation',
  'future sourcing alerts',
  'automation for marketplaces',
  'ecommerce automation',
  'OLX automation',
  'Vinted automation',
  'Vinted app',
];

const AutomatedResellingPlatformGuide = () => {
  const t = getTranslations(guideTranslations);
  
  const pageTitle = t.pageTitle;
  const pageDescription = t.pageDescription;
  
  const articleStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: pageTitle,
    description: pageDescription,
    author: {
      '@type': 'Organization',
      name: 'FlipIt',
      url: 'https://myflipit.live',
    },
    publisher: {
      '@type': 'Organization',
      name: 'FlipIt',
      logo: {
        '@type': 'ImageObject',
        url: 'https://myflipit.live/placeholder.svg',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': 'https://myflipit.live/automated-reselling-platform-guide',
    },
    datePublished: '2025-09-23',
    dateModified: '2025-09-23',
    keywords,
  };
  
  const heroBadges = [t.heroBadge1, t.heroBadge2, t.heroBadge3];
  const crosslistingHighlights = [t.crosslistingPoint1, t.crosslistingPoint2, t.crosslistingPoint3];
  const futureHighlights = [t.futurePoint1, t.futurePoint2, t.futurePoint3];  return (
    <div className="relative overflow-hidden bg-neutral-950 text-white">
      <SEOHead
        title={t.pageTitle}
        description={t.pageDescription}
        canonicalUrl="https://myflipit.live/automated-reselling-platform-guide"
        type="article"
        keywords={keywords}
        structuredData={articleStructuredData}
        language={getCurrentLanguage()}
      />

      {/* Unified Animated Gradient Background */}
      <div className="fixed inset-0 -z-20">
        {/* Base dark background */}
        <div className="absolute inset-0 bg-neutral-950"></div>
        
        {/* Animated gradient overlay - matches HomePage and HowItWorks exactly */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 1 }}
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            style={{
              background:
                "radial-gradient(circle at 20% 20%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)",
            }}
          />
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0.7 }}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
            style={{
              background:
                "radial-gradient(circle at 80% 40%, rgba(6, 182, 212, 0.25) 0%, transparent 50%)",
            }}
          />
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
            style={{
              background:
                "radial-gradient(circle at 40% 80%, rgba(168, 85, 247, 0.2) 0%, transparent 50%)",
            }}
          />
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0.3 }}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            style={{
              background:
                "radial-gradient(circle at 90% 90%, rgba(236, 72, 153, 0.15) 0%, transparent 50%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)",
            }}
          />
          {/* Subtle warm overlay for guide page differentiation */}
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(circle at 60% 30%, rgba(249, 115, 22, 0.08) 0%, transparent 60%)",
            }}
          />
        </div>
        
        {/* Moving orbs for extra dynamism - standardized */}
        <div className="absolute inset-0">
          <div 
            className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-cyan-500/20 to-fuchsia-500/20 blur-3xl"
            style={{
              animation: 'float1 25s ease-in-out infinite',
              left: '10%',
              top: '10%'
            }}
          ></div>
          <div 
            className="absolute w-80 h-80 rounded-full bg-gradient-to-r from-fuchsia-500/15 to-cyan-500/15 blur-3xl"
            style={{
              animation: 'float2 30s ease-in-out infinite',
              right: '15%',
              top: '30%'
            }}
          ></div>
          <div 
            className="absolute w-72 h-72 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-3xl"
            style={{
              animation: 'float3 35s ease-in-out infinite',
              left: '30%',
              bottom: '20%'
            }}
          ></div>
        </div>
      </div>
      
      {/* CSS Animations - standardized to match HomePage */}
      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(30px, -20px) scale(1.1); }
          50% { transform: translate(-20px, 30px) scale(0.9); }
          75% { transform: translate(20px, 10px) scale(1.05); }
        }
        
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-25px, 20px) scale(1.1); }
          66% { transform: translate(15px, -30px) scale(0.95); }
        }
        
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          20% { transform: translate(20px, -15px) scale(1.05); }
          40% { transform: translate(-30px, 25px) scale(0.9); }
          60% { transform: translate(25px, 20px) scale(1.1); }
          80% { transform: translate(-15px, -25px) scale(0.95); }
        }
      `}</style>

            {/* Hero Section */}
      <section className="relative isolate overflow-hidden min-h-[60vh] flex items-center justify-center py-24">
        <div className="container mx-auto px-8">
          <div className="flex flex-col items-center text-center w-full max-w-3xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="space-y-8"
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-8 py-1 text-sm font-medium text-white backdrop-blur-md">
                {t.guideLabel}
              </span>
              <h1 className="my-custom-font text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
                {t.heroTitle} <span className="text-cyan-400">{t.heroTitleHighlight}</span> {t.heroTitleEnd} <span className="bg-gradient-to-r from-fuchsia-400 to-cyan-400 inline-block text-transparent bg-clip-text">{t.heroTitleBrand}</span>
              </h1>
              <p className="max-w-2xl text-lg/relaxed text-neutral-300 mx-auto">
                {t.heroDescription}
              </p>
              <motion.div
                custom={4}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs uppercase tracking-wide text-neutral-300"
              >
                {heroBadges.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-cyan-400/40 bg-neutral-900/80 px-3 py-1 text-neutral-100 shadow-md shadow-cyan-500/10"
                  >
                    {tag}
                  </span>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
        
        {/* Enhanced gradient ring decoration */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-[-10%] -z-10 transform-gpu overflow-hidden blur-3xl"
        >
          <div
            className="relative left-1/2 aspect-[1155/678] w-[72.1875rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-fuchsia-500/30 to-cyan-500/20 opacity-30"
            style={{
              clipPath:
                'polygon(74% 44%, 100% 74%, 91% 100%, 28% 93%, 0 53%, 33% 0, 67% 0)',
            }}
          ></div>
        </div>
      </section>

      <article className="relative mx-auto max-w-4xl px-8 pb-24 md:px-8 lg:px-0">
        {/* One photo widget section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mb-16 w-full max-w-3xl mx-auto rounded-3xl border border-white/10 bg-neutral-900/60 p-8 text-center shadow-xl shadow-fuchsia-500/10 backdrop-blur"
        >
          <span className="text-xs uppercase tracking-[0.4em] text-cyan-300">{t.widgetLabel}</span>
          <h2 className="mt-4 text-2xl font-semibold text-white sm:text-3xl">{t.widgetTitle}</h2>
          <ul className="mt-6 space-y-3 text-left text-neutral-200 max-w-xl mx-auto">
            {crosslistingHighlights.map((point) => (
              <li key={point} className="flex items-start gap-2">
                <span className="mt-[6px] h-2 w-2 flex-shrink-0 rounded-full bg-cyan-400" aria-hidden="true" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </motion.section>

        {/* First content section */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mb-16 p-8 rounded-2xl bg-neutral-900/40 backdrop-blur-sm ring-1 ring-white/5"
        >
          <h2 className="text-2xl font-bold text-white mb-6">{t.section1Title}</h2>
          <p className="text-neutral-300 mb-4">
            {t.section1Para1}
          </p>
          <p className="text-neutral-300">
            {t.section1Para2}
          </p>
        </motion.section>

        {/* What is section with gradient background */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mb-16 p-8 rounded-2xl bg-gradient-to-br from-neutral-900/80 to-neutral-900/40 backdrop-blur-sm ring-1 ring-cyan-500/10 shadow-lg shadow-cyan-500/5"
        >
          <h2 className="text-2xl font-bold text-white mb-6">{t.section2Title}</h2>
          <p className="text-neutral-300 mb-4">
            {t.section2Para1}
          </p>
          <p className="text-neutral-300">
            {t.section2Para2}
          </p>
        </motion.section>

        {/* Introduction section with featured styling */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mb-16 p-8 rounded-2xl bg-gradient-to-br from-neutral-900/60 via-fuchsia-900/10 to-neutral-900/40 backdrop-blur-sm ring-1 ring-fuchsia-500/10 shadow-lg shadow-fuchsia-500/5"
        >
          <h2 className="text-2xl font-bold text-white mb-6">{t.section3Title}</h2>
          <p className="text-neutral-300 mb-4">
            {t.section3Para1}
          </p>
          <p className="text-neutral-300">
            {t.section3Para2} <Link to="/how-it-works" className="text-cyan-300 underline hover:text-cyan-200">{t.section3LinkText}</Link>.
          </p>
        </motion.section>

        {/* Steps section with cards */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-white mb-8 text-center">{t.stepsTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group relative overflow-hidden rounded-2xl bg-neutral-900/50 backdrop-blur-sm p-6 shadow-lg ring-1 ring-cyan-400/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:ring-cyan-400/40">
              <div className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="h-full w-full bg-gradient-to-br from-cyan-600/20 to-fuchsia-400/10 blur-2xl"></div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-400/10 mb-4 ring-1 ring-cyan-400/20">
                <span className="font-bold text-xl text-cyan-400">1</span>
              </div>
              <p className="font-semibold text-white text-lg mb-2">{t.step1Title}</p>
              <p className="text-neutral-300">
                {t.step1Description} <Link to="/login" className="text-cyan-300 underline hover:text-cyan-200">{t.step1LinkText}</Link> {t.step1DescriptionEnd}
              </p>
            </div>
            
            <div className="group relative overflow-hidden rounded-2xl bg-neutral-900/50 backdrop-blur-sm p-6 shadow-lg ring-1 ring-cyan-400/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:ring-cyan-400/40">
              <div className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="h-full w-full bg-gradient-to-br from-cyan-600/20 to-fuchsia-400/10 blur-2xl"></div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-400/10 mb-4 ring-1 ring-cyan-400/20">
                <span className="font-bold text-xl text-cyan-400">2</span>
              </div>
              <p className="font-semibold text-white text-lg mb-2">{t.step2Title}</p>
              <p className="text-neutral-300">
                {t.step2Description}
              </p>
            </div>
            
            <div className="group relative overflow-hidden rounded-2xl bg-neutral-900/50 backdrop-blur-sm p-6 shadow-lg ring-1 ring-cyan-400/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:ring-cyan-400/40">
              <div className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="h-full w-full bg-gradient-to-br from-cyan-600/20 to-fuchsia-400/10 blur-2xl"></div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-400/10 mb-4 ring-1 ring-cyan-400/20">
                <span className="font-bold text-xl text-cyan-400">3</span>
              </div>
              <p className="font-semibold text-white text-lg mb-2">{t.step3Title}</p>
              <p className="text-neutral-300">
                {t.step3Description}
              </p>
            </div>
            
            <div className="group relative overflow-hidden rounded-2xl bg-neutral-900/50 backdrop-blur-sm p-6 shadow-lg ring-1 ring-cyan-400/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:ring-cyan-400/40">
              <div className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="h-full w-full bg-gradient-to-br from-cyan-600/20 to-fuchsia-400/10 blur-2xl"></div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-400/10 mb-4 ring-1 ring-cyan-400/20">
                <span className="font-bold text-xl text-cyan-400">4</span>
              </div>
              <p className="font-semibold text-white text-lg mb-2">{t.step4Title}</p>
              <p className="text-neutral-300">
                {t.step4Description}
              </p>
            </div>
          </div>
        </motion.section>

        {/* Who can benefit section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mb-16 p-8 rounded-2xl bg-neutral-900/40 backdrop-blur-sm ring-1 ring-white/5"
        >
          <h2 className="text-2xl font-bold text-white mb-6">{t.whoBenefitsTitle}</h2>
          <p className="text-neutral-300 mb-4">
            {t.whoBenefitsText1}
          </p>
          <p className="text-neutral-300">
            {t.whoBenefitsText2}
          </p>
        </motion.section>

        {/* What's next section */}
                {/* What's next section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-white mb-8 text-center">{t.futureTitle}</h2>
          <div className="w-full max-w-3xl mx-auto rounded-3xl border border-white/10 bg-gradient-to-br from-neutral-900/80 via-fuchsia-900/5 to-neutral-900/60 p-8 text-center shadow-xl shadow-fuchsia-500/10 backdrop-blur">
            <span className="text-xs uppercase tracking-[0.4em] text-cyan-300">{t.roadmapHighlights}</span>
            <p className="mt-4 text-neutral-300">
              {t.futureDescription}
            </p>
            <ul className="mt-6 space-y-4 text-left text-neutral-200 max-w-2xl mx-auto">
              <li className="flex items-start gap-3">
                <span className="mt-[6px] h-3 w-3 flex-shrink-0 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-400" aria-hidden="true" />
                <span>{t.futurePoint1}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-[6px] h-3 w-3 flex-shrink-0 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-400" aria-hidden="true" />
                <span>{t.futurePoint2}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-[6px] h-3 w-3 flex-shrink-0 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-400" aria-hidden="true" />
                <span>{t.futurePoint3}</span>
              </li>
            </ul>
          </div>
        </motion.section>

        {/* FAQ section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-white mb-8 text-center">{t.faqTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group rounded-2xl border border-white/5 bg-neutral-900/60 p-6 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 hover:border-cyan-400/20">
              <p className="font-semibold text-white text-lg mb-3">{t.faq1Question}</p>
              <p className="text-neutral-300">
                {t.faq1Answer}
              </p>
            </div>
            <div className="group rounded-2xl border border-white/5 bg-neutral-900/60 p-6 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 hover:border-cyan-400/20">
              <p className="font-semibold text-white text-lg mb-3">{t.faq2Question}</p>
              <p className="text-neutral-300">
                {t.faq2Answer}
              </p>
            </div>
            <div className="group rounded-2xl border border-white/5 bg-neutral-900/60 p-6 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 hover:border-cyan-400/20">
              <p className="font-semibold text-white text-lg mb-3">{t.faq3Question}</p>
              <p className="text-neutral-300">
                {t.faq3Answer}
              </p>
            </div>
            <div className="group rounded-2xl border border-white/5 bg-neutral-900/60 p-6 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 hover:border-cyan-400/20">
              <p className="font-semibold text-white text-lg mb-3">{t.faq4Question}</p>
              <p className="text-neutral-300">
                {t.faq4Answer}
              </p>
            </div>
          </div>
        </motion.section>

        {/* FAQ section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-white mb-8 text-center">{t.faqTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group rounded-2xl border border-white/5 bg-neutral-900/60 p-6 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 hover:border-cyan-400/20">
              <p className="font-semibold text-white text-lg mb-3">{t.faq1Question}</p>
              <p className="text-neutral-300">
                {t.faq1Answer}
              </p>
            </div>
            <div className="group rounded-2xl border border-white/5 bg-neutral-900/60 p-6 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 hover:border-cyan-400/20">
              <p className="font-semibold text-white text-lg mb-3">{t.faq2Question}</p>
              <p className="text-neutral-300">
                {t.faq2Answer}
              </p>
            </div>
            <div className="group rounded-2xl border border-white/5 bg-neutral-900/60 p-6 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 hover:border-cyan-400/20">
              <p className="font-semibold text-white text-lg mb-3">{t.faq3Question}</p>
              <p className="text-neutral-300">
                {t.faq3Answer}
              </p>
            </div>
            <div className="group rounded-2xl border border-white/5 bg-neutral-900/60 p-6 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 hover:border-cyan-400/20">
              <p className="font-semibold text-white text-lg mb-3">{t.faq4Question}</p>
              <p className="text-neutral-300">
                {t.faq4Answer}
              </p>
            </div>
          </div>
        </motion.section>

        {/* Call to Action Section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mb-8 py-16"
        >
          <div className="w-full max-w-2xl mx-auto rounded-3xl bg-gradient-to-r from-cyan-500/30 via-fuchsia-500/20 to-cyan-400/30 p-8 shadow-2xl text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-6 text-white drop-shadow-lg">
              {t.ctaTitle}
            </h2>
            <p className="md:text-lg text-neutral-300 mb-8">
              {t.ctaDescription}
            </p>
            <Link
              to="/get-started"
              className="inline-flex items-center rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-8 py-4 font-semibold text-white text-lg shadow-lg shadow-fuchsia-500/30 transition hover:to-fuchsia-600"
            >
              {t.ctaButton}
            </Link>
            <p className="mt-6 text-sm text-neutral-400">
              {t.ctaFooterText}{' '}
              <Link to="/login" className="text-cyan-300 underline hover:text-cyan-200">
                {t.ctaLoginLink}
              </Link>
              {t.ctaFooterMiddle}{' '}
              <Link to="/how-it-works" className="text-cyan-300 underline hover:text-cyan-200">
                {t.ctaHowItWorksLink}
              </Link>
              .
            </p>
          </div>
        </motion.section>
      </article>
    </div>
  );
};

export default AutomatedResellingPlatformGuide;
