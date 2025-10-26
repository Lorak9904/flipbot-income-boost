import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { getTranslations } from '@/components/language-utils';
import { indexTranslations } from './index-translations';

// Re–usable fade‑up animation
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 * i, duration: 0.6, ease: 'easeOut' },
  }),
};

const Index = () => {
  const t = getTranslations(indexTranslations);
  
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-950 text-white">
      {/* Neon blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[60%] top-[-20%] h-[36rem] w-[36rem] -translate-x-1/2 rotate-45 rounded-full bg-fuchsia-600 opacity-30 blur-3xl" />
        <div className="absolute right-[55%] bottom-[-25%] h-[28rem] w-[28rem] translate-x-1/2 rounded-full bg-cyan-500 opacity-20 blur-3xl" />
      </div>

      <section className="w-full py-24">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mx-auto max-w-4xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl"
          >
            {t.heroTitle1} <span className="text-cyan-400">{t.heroTitle2}</span> {t.heroTitle3}&nbsp;
            <span className="text-fuchsia-400">{t.heroTitle4}</span>
          </motion.h1>

          <motion.p
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mx-auto mt-6 max-w-xl text-lg text-neutral-300"
          >
            {t.heroDescription}
          </motion.p>

          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/20 hover:to-fuchsia-600"
            >
              <Link to="/get-started">{t.getStartedButton}</Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10"
            >
              <Link to="/how-it-works" className="flex items-center gap-2">
                {t.howItWorksButton} <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;
