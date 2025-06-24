import { ArrowRight, Plug, Upload, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getTranslations } from '../components/language-utils';
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

  const steps = [
    { title: t.step1Title, description: t.step1Description },
    { title: t.step2Title, description: t.step2Description },
    { title: t.step3Title, description: t.step3Description },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      {/* Background blocks stay exactly as they were */}
      <div className="fixed inset-0 -z-20">
        <div className="absolute inset-0 bg-neutral-950" />
        {/* animated radial layers (unchanged) */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 1 }}
          animate={{ opacity: [1, 0.7, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            background:
              'radial-gradient(circle at 20% 20%, rgba(236,72,153,.3) 0%, transparent 50%)',
          }}
        />
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0.7 }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            background:
              'radial-gradient(circle at 80% 40%, rgba(6,182,212,.25) 0%, transparent 50%)',
          }}
        />
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            background:
              'radial-gradient(circle at 40% 80%, rgba(168,85,247,.2) 0%, transparent 50%)',
          }}
        />
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            background:
              'radial-gradient(circle at 90% 90%, rgba(236,72,153,.15) 0%, transparent 50%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(6,182,212,.1) 0%, rgba(236,72,153,.1) 100%)',
          }}
        />
      </div>

      {/* Hero */}
      <section className="relative py-24 text-center">
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mx-auto mb-6 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl"
        >
          {t.heroTitle}
        </motion.h1>
        <motion.p
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mx-auto max-w-xl text-lg text-neutral-300"
        >
          {t.heroDescription}
        </motion.p>
      </section>

      {/* Steps */}
      <section className="relative isolate overflow-hidden py-24">
        <div className="container relative z-10 mx-auto grid gap-10 px-4 md:grid-cols-3">
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
                className="flex flex-col items-center gap-4 rounded-2xl bg-neutral-900/50 p-8 text-center backdrop-blur-sm ring-1 ring-cyan-400/20"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-400/10 ring-1 ring-cyan-400/20">
                  <Icon className="h-8 w-8 text-cyan-400" />
                </div>
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="text-neutral-300">{description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 text-center">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          variants={fadeUp}
          className="mb-8 text-3xl font-bold md:text-4xl"
        >
          {t.ctaTitle}
        </motion.h2>
        <Button
          asChild
          size="lg"
          className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/20 hover:to-fuchsia-600"
        >
          <Link to="/add-item" className="flex items-center gap-2">
            {t.ctaButton} <ArrowRight className="h-5 w-5" />
          </Link>
        </Button>
      </section>
    </div>
  );
};

export default HowItWorksPage;

