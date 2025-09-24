import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEOHead } from '@/components/SEOHead';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Zap, BadgeCheck } from 'lucide-react';
import { getTranslations } from '../components/language-utils';
import { homePageTranslations } from './homepage-translations';

// Simple fade-up animation variant
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 * i, duration: 0.6, ease: 'easeOut' },
  }),
};

const HomePage = () => {
  const t = getTranslations(homePageTranslations);
  const pageTitle = 'myflipit.live | Automated Reselling Platform for OLX & Vinted';
  const pageDescription = 'FlipIt automates OLX and Vinted reselling with AI-powered sourcing, profit analytics, and cross-posting.';
  const keywords = [
    'automated reselling platform',
    'marketplace automation',
    'OLX reselling software',
    'Vinted reselling tool',
    'online arbitrage AI',
    'find undervalued items',
    'crossposting automation',
    'side hustle ideas',
  ];

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'FlipIt',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'PLN',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '128',
    },
    featureList: [
      'Automated marketplace scanning',
      'Cross-posting to OLX and Vinted',
      'AI pricing recommendations',
    ],
  };

  const seoBadges = [t.seoBadge1, t.seoBadge2, t.seoBadge3];
  const seoPoints = [t.seoPoint1, t.seoPoint2, t.seoPoint3];

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        canonicalUrl="https://myflipit.live/"
        keywords={keywords}
        structuredData={structuredData}
      />
      {/* Unified Animated Gradient Background */}
      <div className="fixed inset-0 -z-20">
        {/* Base dark background */}
        <div className="absolute inset-0 bg-neutral-950"></div>
        
        {/* Animated gradient overlay - refactored for smooth transitions */}
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
        </div>
        
        {/* Moving orbs for extra dynamism */}
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

      {/* CSS Animations */}
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

      {/* Hero Section - Improved layout with title as main eye-catcher */}
      <section className="relative isolate overflow-hidden min-h-[70vh] flex items-center justify-center py-24">
        <div className="container mx-auto px-8">
          <div className="flex flex-col items-center text-center w-full max-w-3xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="space-y-8 mb-16"
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-8 py-1 text-sm font-medium text-white backdrop-blur-md">
                {t.newRelease}
              </span>
              <h1 className="my-custom-font text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight">
                {t.heroTitle} <span className="text-cyan-400">{t.heroTitleHighlight1}</span> {t.heroTitleEnd}&nbsp;
                <span className="bg-gradient-to-r from-fuchsia-400 to-cyan-400 inline-block text-transparent bg-clip-text">{t.heroTitleHighlight2}</span>.
              </h1>
              <p className="max-w-2xl text-lg/relaxed text-neutral-300 mx-auto">
                {t.heroDescription}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:to-fuchsia-600 text-white shadow-lg shadow-fuchsia-500/20"
                >
                  <Link to="/add-item">{t.startFlipping}</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10"
                >
                  <Link to="/how-it-works" className="flex items-center">
                    {t.seeHowItWorks} <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
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
                'polygon(74% 44%, 100% 74%, 91% 50%, 28% 93%, 0 53%, 33% 0, 67% 0)',
            }}
          ></div>
        </div>
      </section>

      {/* Features Section - Now seamlessly integrated */}
      <section className="relative py-24">
        <div className="container mx-auto px-8 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={fadeUp}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl md:text-4xl font-bold">{t.whyLoveTitle}</h2>
            <p className="mt-4 text-neutral-300 max-w-3xl mx-auto p-8">
              {t.whyLoveSubtitle}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                  Icon: Users,
                  title: t.feature1Title,
                  desc: t.feature1Desc,
                },
                {
                  Icon: Zap,
                  title: t.feature2Title,
                  desc: t.feature2Desc,
                },
                {
                  Icon: BadgeCheck,
                  title: t.feature3Title,
                  desc: t.feature3Desc,
                },
            ].map(({ Icon, title, desc }, i) => (
              <motion.div
                key={title}
                custom={i + 1}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="group relative overflow-hidden rounded-2xl bg-neutral-900/50 backdrop-blur-sm p-8 shadow-lg ring-1 ring-cyan-400/20 transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-2xl hover:ring-cyan-400/40 hover:bg-neutral-900/60 transition-transform"
              >
                <div className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="h-full w-full bg-gradient-to-br from-cyan-600/20 to-fuchsia-400/10 blur-2xl"></div>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-cyan-400/10 mb-6 ring-1 ring-cyan-400/20">
                  <Icon className="h-6 w-6 text-cyan-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                <p className="text-neutral-300">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Product widget section - Moved below the features section */}
      <section className="relative py-16">
        <div className="container mx-auto px-8">
          <motion.div
            custom={4}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="w-full max-w-3xl mx-auto rounded-3xl border border-white/10 bg-neutral-900/60 p-8 text-center shadow-xl shadow-fuchsia-500/10 backdrop-blur"
          >
            <span className="text-xs uppercase tracking-[0.4em] text-cyan-300">{t.seoRibbon}</span>
            <h2 className="mt-4 text-2xl font-semibold text-white sm:text-3xl">{t.seoBlurbTitle}</h2>
            <p className="mt-4 text-neutral-300">{t.seoBlurbSubtitle}</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs uppercase tracking-wider text-neutral-100">
              {seoBadges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 shadow-md shadow-cyan-500/20"
                >
                  {badge}
                </span>
              ))}
            </div>
            <ul className="mt-6 space-y-3 text-left text-neutral-200 max-w-xl mx-auto">
              {seoPoints.map((point) => (
                <li key={point} className="flex items-start gap-2">
                  <span className="mt-[6px] h-2 w-2 flex-shrink-0 rounded-full bg-cyan-400" aria-hidden="true" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Enhanced gradient ring decoration */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-[-40%] -z-10 transform-gpu overflow-hidden blur-3xl"
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
      
      {/* Greatest Call to Action Section */}
      <section className="relative py-12">
        <div className="container mx-auto px-8 relative z-10 flex flex-col items-center justify-center">
          <div className="w-full max-w-2xl mx-auto rounded-3xl bg-gradient-to-r from-cyan-500/30 via-fuchsia-500/20 to-cyan-400/30 p-8 shadow-2xl text-center">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6 text-white drop-shadow-lg">
              {t.ctaTitle}
            </h2>
            <p className="md:text-lg text-neutral-300 mb-8">
              {t.ctaDescription}
            </p>
            <Button
              asChild
              size="xl"
              className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:to-fuchsia-600 text-white text-xl px-10 py-5 shadow-lg shadow-fuchsia-500/30 font-bold rounded-full"
            >
              <Link to="/add-item">{t.ctaButton}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;











