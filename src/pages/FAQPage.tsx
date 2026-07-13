import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, MessageCircle, Sparkles, Upload } from 'lucide-react';

import { SEOHead } from '@/components/SEOHead';
import { AnimatedGradientBackground } from '@/components/AnimatedGradientBackground';
import { MarketingCtaBanner } from '@/components/marketing/MarketingCtaBanner';
import { HeroCTA, SecondaryAction } from '@/components/ui/button-presets';
import { getCurrentLanguage, getLocalizedPathForLanguage } from '@/components/language-utils';
import { getSeoMetadata } from '@/lib/seo-metadata';
import { faqContent } from './faq-content';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 * i, duration: 0.6, ease: 'easeOut' },
  }),
};

const sectionIcons = [Upload, MessageCircle, Sparkles];

const FAQPage = () => {
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);
  const language = getCurrentLanguage();
  const copy = faqContent[language];
  const seo = getSeoMetadata('faq', language);
  const localized = (path: string) => getLocalizedPathForLanguage(path, language);
  const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: language,
    mainEntity: copy.sections.flatMap((section) =>
      section.items.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      })),
    ),
  };

  return (
    <div className="relative overflow-hidden bg-neutral-950 text-white">
      <SEOHead
        title={seo?.title}
        description={seo?.description}
        structuredData={faqStructuredData}
        language={language}
      />
      <AnimatedGradientBackground />

      <section className="relative px-4 py-16 text-center md:py-24">
        <motion.h1 initial="hidden" animate="visible" variants={fadeUp} className="mx-auto max-w-4xl text-3xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
          {copy.heroTitle}
        </motion.h1>
        <motion.p custom={2} initial="hidden" animate="visible" variants={fadeUp} className="mx-auto mt-6 max-w-2xl text-base text-neutral-300 md:text-lg">
          {copy.heroDescription}
        </motion.p>
        <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp} className="mx-auto mt-8 flex flex-wrap justify-center gap-3 text-xs uppercase text-neutral-100">
          {copy.badges.map((badge) => <span key={badge} className="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-4 py-1">{badge}</span>)}
        </motion.div>
      </section>

      <section className="relative pb-16 md:pb-24">
        <div className="container mx-auto grid gap-6 px-6 md:gap-8 md:px-8">
          {copy.sections.map((section, sectionIndex) => {
            const Icon = sectionIcons[sectionIndex];
            return (
              <motion.div key={section.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="rounded-3xl border border-white/10 bg-neutral-900/60 p-6 shadow-xl backdrop-blur md:p-8">
                <div className="flex items-center gap-3 border-b border-white/10 pb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10"><Icon className="h-6 w-6 text-cyan-400" aria-hidden="true" /></div>
                  <h2 className="text-xl font-semibold md:text-2xl">{section.title}</h2>
                </div>
                <div className="mt-6 space-y-4">
                  {section.items.map((item, itemIndex) => {
                    const id = `${sectionIndex}-${itemIndex}`;
                    const isOpen = openQuestion === id;
                    return (
                      <div key={id} className="rounded-2xl border border-white/10 bg-neutral-900/80">
                        <button type="button" onClick={() => setOpenQuestion(isOpen ? null : id)} aria-expanded={isOpen} className="flex min-h-12 w-full items-center justify-between gap-4 px-5 py-4 text-left font-medium text-neutral-100">
                          <span>{item.question}</span>
                          {isOpen ? <ChevronUp className="h-5 w-5 shrink-0 text-cyan-400" /> : <ChevronDown className="h-5 w-5 shrink-0 text-cyan-400" />}
                        </button>
                        {isOpen && (
                          <div className="px-5 pb-5 text-sm text-neutral-300">
                            {item.answer}
                            {'linkHref' in item && item.linkHref && <Link to={localized(item.linkHref)} className="mt-3 block font-medium text-cyan-300 underline underline-offset-4">{item.linkText}</Link>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="relative px-6 py-12 md:py-16">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-neutral-900/60 p-8 text-center backdrop-blur">
          <h2 className="text-2xl font-bold md:text-3xl">{copy.deeperTitle}</h2>
          <p className="mt-4 text-neutral-300">{copy.deeperDescription}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <HeroCTA asChild><Link to={localized('/how-it-works')}>{copy.howItWorks}</Link></HeroCTA>
            <SecondaryAction asChild><Link to={localized('/automated-reselling-platform-guide')}>{copy.readGuide}</Link></SecondaryAction>
          </div>
        </motion.div>
      </section>

      <section className="relative px-6 py-16 text-center">
        <h2 className="text-2xl font-bold md:text-3xl">{copy.contactTitle}</h2>
        <p className="mt-4 text-neutral-300">{copy.contactBefore} <a href="mailto:myflipit@arrpo.com" className="text-cyan-300 underline">myflipit@arrpo.com</a>, {copy.contactAfter}</p>
      </section>

      <section className="relative px-6 pb-24">
        <MarketingCtaBanner
          title={copy.ctaTitle}
          description={copy.ctaDescription}
          primaryAction={{ text: copy.ctaButton, href: localized('/login?register=1') }}
        />
      </section>
    </div>
  );
};

export default FAQPage;
