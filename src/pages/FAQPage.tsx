import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, MessageCircle, Sparkles, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEOHead } from '@/components/SEOHead';
import { getCurrentLanguage, getTranslations } from '@/components/language-utils';
import { faqTranslations } from './faq-translations';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 * i, duration: 0.6, ease: 'easeOut' },
  }),
};

const keywords = [
  'AI crosslisting FAQ',
  'marketplace automation',
  'automation for marketplaces',
  'ecommerce automation',
  'OLX automation',
  'OLX crosslisting help',
  'Vinted automation',
  'Vinted app',
  'Vinted crossposting automation',
  'seller automation support',
  'marketplace sync FAQ',
];

const faqStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqSections.flatMap((section) =>
    section.items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    }))
  ),
};

const FAQPage = () => {
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);
  const t = getTranslations(faqTranslations);

  const toggleQuestion = (id: string) => {
    setOpenQuestion((prev) => (prev === id ? null : id));
  };

  const heroBadges = [t.heroBadge1, t.heroBadge2, t.heroBadge3];

  const faqSections = [
    {
      icon: Upload,
      title: t.crosslistingTitle,
      items: [
        { question: t.q1, answer: t.a1 },
        { question: t.q2, answer: t.a2 },
        { question: t.q3, answer: t.a3 },
      ],
    },
    {
      icon: MessageCircle,
      title: t.automationTitle,
      items: [
        { question: t.q4, answer: t.a4 },
        { question: t.q5, answer: t.a5 },
        { question: t.q6, answer: t.a6 },
      ],
    },
    {
      icon: Sparkles,
      title: t.roadmapTitle,
      items: [
        { question: t.q7, answer: t.a7 },
        { question: t.q8, answer: t.a8 },
        { question: t.q9, answer: t.a9 },
      ],
    },
  ];

  const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqSections.flatMap((section) =>
      section.items.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      }))
    ),
  };

  return (
    <div className="relative overflow-hidden bg-neutral-950 text-white">
      <SEOHead
        title={t.pageTitle}
        description={t.pageDescription}
        canonicalUrl="https://myflipit.live/faq"
        keywords={keywords}
        structuredData={faqStructuredData}
        language={getCurrentLanguage()}
      />

      <div className="pointer-events-none fixed inset-0 -z-20">
        <div className="absolute inset-0 bg-neutral-950" />
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 1 }}
          animate={{ opacity: [1, 0.7, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          style={{ background: 'radial-gradient(circle at 20% 20%, rgba(236,72,153,.3) 0%, transparent 50%)' }}
        />
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0.7 }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          style={{ background: 'radial-gradient(circle at 80% 40%, rgba(6,182,212,.25) 0%, transparent 50%)' }}
        />
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          style={{ background: 'radial-gradient(circle at 40% 80%, rgba(168,85,247,.2) 0%, transparent 50%)' }}
        />
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          style={{ background: 'radial-gradient(circle at 90% 90%, rgba(236,72,153,.15) 0%, transparent 50%)' }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(6,182,212,.1) 0%, rgba(236,72,153,.1) 100%)',
          }}
        />
      </div>

      <section className="relative py-16 md:py-24 text-center px-4">
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mx-auto max-w-4xl text-3xl md:text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
        >
          {t.heroTitle}
        </motion.h1>
        <motion.p
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mx-auto mt-6 max-w-2xl text-base md:text-lg text-neutral-300 px-2"
        >
          {t.heroDescription}
        </motion.p>
        <motion.div
          custom={3}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mx-auto mt-8 flex flex-wrap items-center justify-center gap-3 text-xs uppercase tracking-[0.4em] text-neutral-100 px-2"
        >
          {heroBadges.map((badge) => (
            <span
              key={badge}
              className="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-4 py-1 shadow-md shadow-cyan-500/20"
            >
              {badge}
            </span>
          ))}
        </motion.div>
      </section>

      <section className="relative pb-16 md:pb-24">
        <div className="container mx-auto px-6 md:px-8">
          <div className="grid gap-6 md:gap-8">
            {faqSections.map(({ icon: Icon, title, items }, sectionIndex) => (
              <motion.div
                key={title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="rounded-3xl border border-white/10 bg-neutral-900/60 p-6 md:p-8 shadow-xl shadow-fuchsia-500/10 backdrop-blur mx-2 md:mx-0"
              >
                <div className="flex items-center gap-3 border-b border-white/10 pb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10">
                    <Icon className="h-6 w-6 text-cyan-400" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-semibold text-white lg:text-3xl">{title}</h2>
                </div>
                <div className="mt-6 space-y-4">
                  {items.map((item, itemIndex) => {
                    const id = `${sectionIndex}-${itemIndex}`;
                    const isOpen = openQuestion === id;
                    return (
                      <div key={id} className="rounded-2xl border border-white/10 bg-neutral-900/80">
                        <button
                          type="button"
                          onClick={() => toggleQuestion(id)}
                          className="flex w-full items-center justify-between gap-4 px-4 md:px-5 py-4 text-left text-sm md:text-base font-medium text-neutral-100 transition hover:text-white"
                        >
                          <span className="pr-2">{item.question}</span>
                          {isOpen ? <ChevronUp className="h-5 w-5 text-cyan-400 flex-shrink-0" /> : <ChevronDown className="h-5 w-5 text-cyan-400 flex-shrink-0" />}
                        </button>
                        {isOpen && (
                          <div className="px-4 md:px-5 pb-5 text-sm text-neutral-300">
                            {item.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-12 md:py-16 px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-neutral-900/60 p-6 md:p-8 text-center shadow-xl shadow-fuchsia-500/10 backdrop-blur"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white">{t.deepDiveTitle}</h2>
          <p className="mt-4 text-sm md:text-base text-neutral-300 px-2">
            {t.deepDiveDescription}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Button asChild className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/20 hover:to-fuchsia-600">
              <Link to="/how-it-works">{t.howItWorksButton}</Link>
            </Button>
            <Button asChild variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10">
              <Link to="/automated-reselling-platform-guide">{t.readPlaybookButton}</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      <section className="relative py-16 text-center px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mx-auto max-w-3xl"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white">Still have questions?</h2>
          <p className="mt-4 text-neutral-300">
            Email us anytime at <a href="mailto:info@arrpo.com" className="text-cyan-300 underline hover:text-cyan-200">info@arrpo.com</a> and we’ll help tailor FlipIt to your workflow.
          </p>
        </motion.div>
      </section>

      <section className="relative pb-24 text-center px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mx-auto max-w-3xl rounded-3xl bg-gradient-to-r from-cyan-500/30 via-fuchsia-500/20 to-cyan-400/30 p-10 shadow-2xl"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">{t.ctaTitle}</h2>
          <p className="mt-4 text-neutral-100">
            {t.ctaDescription}
          </p>
          <Button
            asChild
            size="lg"
            className="mt-6 bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-8 py-6 text-lg font-semibold text-white hover:to-fuchsia-600"
          >
            <Link to="/get-started">{t.ctaButton}</Link>
          </Button>
        </motion.div>
      </section>
    </div>
  );
};

export default FAQPage;
