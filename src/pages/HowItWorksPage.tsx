import { ArrowRight, Plug, Upload, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEOHead } from '@/components/SEOHead';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getTranslations, getCurrentLanguage } from '../components/language-utils';
import { howItWorksTranslations } from './howitworks-translations';

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
  const pageTitle = 'How AI Marketplace Automation Works (OLX, Vinted, Facebook)';
  const pageDescription = 'Learn how automation for marketplaces turns one photo into synchronized OLX, Vinted (Vinted app), and Facebook listings with AI and ecommerce automation.';
  const keywords = [
    'automated reselling platform',
    'marketplace automation',
    'automation for marketplaces',
    'ecommerce automation',
    'OLX automation',
    'Vinted automation',
    'Vinted app',
    'marketplace automation software',
    'online arbitrage workflows',
    'find undervalued items',
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
      {/* Unified Animated Gradient Background */}
      <div className="fixed inset-0 -z-20">
        {/* Base dark background */}
        <div className="absolute inset-0 bg-neutral-950"></div>
        
        {/* Animated gradient overlay */}
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
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight">
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
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:to-fuchsia-600 text-white text-lg px-10 py-6 shadow-lg shadow-fuchsia-500/30 font-bold rounded-full"
            >
              <Link to="/add-item" className="flex items-center gap-2">
                {t.ctaButton} <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorksPage;



















