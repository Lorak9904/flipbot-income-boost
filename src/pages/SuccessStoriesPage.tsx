import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ClipboardCheck, Layers3, RefreshCw } from 'lucide-react';

import { SEOHead } from '@/components/SEOHead';
import { AnimatedGradientBackground } from '@/components/AnimatedGradientBackground';
import { MarketingCtaBanner } from '@/components/marketing/MarketingCtaBanner';
import { getCurrentLanguage, getLocalizedPathForLanguage, getTranslations } from '../components/language-utils';
import { getSeoMetadata } from '@/lib/seo-metadata';
import { successStoriesTranslations } from './successstories-translations';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({ opacity: 1, y: 0, transition: { delay: 0.12 * i, duration: 0.5 } }),
};

const SuccessStoriesPage = () => {
  const t = getTranslations(successStoriesTranslations);
  const language = getCurrentLanguage();
  const seo = getSeoMetadata('successStories', language);
  const localized = (path: string) => getLocalizedPathForLanguage(path, language);
  const workflows = [
    { icon: Layers3, title: t.workflow1Title, description: t.workflow1Description },
    { icon: ClipboardCheck, title: t.workflow2Title, description: t.workflow2Description },
    { icon: RefreshCw, title: t.workflow3Title, description: t.workflow3Description },
  ];
  const evidence = [t.evidence1, t.evidence2, t.evidence3];

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <SEOHead title={seo?.title} description={seo?.description} language={language} />
      <AnimatedGradientBackground />

      <section className="relative px-4 py-16 text-center md:py-24">
        <motion.h1 initial="hidden" animate="visible" variants={fadeUp} className="mx-auto max-w-4xl text-3xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
          {t.heroTitle} <span className="text-cyan-400">{t.heroTitleHighlight}</span>
        </motion.h1>
        <motion.p custom={2} initial="hidden" animate="visible" variants={fadeUp} className="mx-auto mt-6 max-w-3xl text-base text-neutral-300 md:text-lg">
          {t.heroDescription}
        </motion.p>
        <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp} className="mx-auto mt-8 flex flex-wrap justify-center gap-3 text-xs uppercase text-neutral-100">
          {[t.badge1, t.badge2, t.badge3].map((badge) => <span key={badge} className="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-4 py-1">{badge}</span>)}
        </motion.div>
      </section>

      <section className="relative px-6 py-16 md:py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <h2 className="text-2xl font-bold md:text-3xl">{t.sectionTitle}</h2>
            <p className="mt-3 text-neutral-300">{t.sectionDescription}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {workflows.map(({ icon: Icon, title, description }, index) => (
              <motion.article key={title} custom={index} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 backdrop-blur">
                <Icon className="h-6 w-6 text-cyan-400" aria-hidden="true" />
                <h3 className="mt-5 text-xl font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-neutral-300">{description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-6 py-16">
        <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-neutral-900/60 p-8 backdrop-blur md:p-10">
          <h2 className="text-2xl font-bold md:text-3xl">{t.evidenceTitle}</h2>
          <ul className="mt-6 space-y-4">
            {evidence.map((item) => <li key={item} className="flex items-start gap-3 text-neutral-200"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" aria-hidden="true" /><span>{item}</span></li>)}
          </ul>
          <p className="mt-8 border-t border-white/10 pt-6 text-sm leading-6 text-neutral-400">{t.note}</p>
        </div>
      </section>

      <section className="relative px-6 pb-24 pt-12">
        <MarketingCtaBanner
          title={t.ctaTitle}
          description={t.ctaDescription}
          primaryAction={{ text: t.ctaButton, href: localized('/login?register=1') }}
          secondaryAction={{ text: language === 'pl' ? 'Zobacz, jak to działa' : 'See how it works', href: localized('/how-it-works') }}
        />
      </section>
    </div>
  );
};

export default SuccessStoriesPage;
