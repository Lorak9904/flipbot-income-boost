import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, MessageCircle, Sparkles, Upload } from 'lucide-react';
import { HeroCTA, SecondaryAction } from '@/components/ui/button-presets';
import { SEOHead } from '@/components/SEOHead';
import { getCurrentLanguage } from '@/components/language-utils';
import { AnimatedGradientBackground } from '@/components/AnimatedGradientBackground';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 * i, duration: 0.6, ease: 'easeOut' },
  }),
};

const pageTitle = 'FlipIt FAQ | AI Marketplace Automation & Crosslisting';
const pageDescription = 'Answers about automation for marketplaces: OLX automation, Vinted automation (Vinted app), AI crosslisting, and ecommerce automation features.';
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
  'listing automation FAQ',
];

const heroBadges = ['Upload once', 'AI listing drafts', 'Manual approval'];

const faqSections = [
  {
    icon: Upload,
    title: 'Crosslisting Basics',
    items: [
      {
        question: 'How does one-photo crosslisting work in FlipIt?',
        answer:
          'Upload your product images and details once. FlipIt uses AI to draft optimized titles, descriptions, and hashtags tailored for OLX, Vinted, Facebook Marketplace, and eBay. You review, edit, and approve before publishing.',
      },
      {
        question: 'Do I need to rewrite listings for each marketplace?',
        answer:
          'No. The platform adapts copy to each channel automatically, including category suggestions, localized keywords, and pricing guidance so every listing fits marketplace norms.',
      },
      {
        question: 'Will FlipIt keep my inventory synced?',
        answer:
          'Not yet. FlipIt does not sync sold status or availability between marketplaces in the current version. You still manage availability on each marketplace directly.',
      },
    ],
  },
  {
    icon: MessageCircle,
    title: 'Automation & Control',
    items: [
      {
        question: 'Can FlipIt reply to buyers for me?',
        answer:
          'Not in the current version. FlipIt does not integrate with marketplace messaging or unify chat inboxes yet.',
      },
      {
        question: 'Does automation work if I list in multiple languages?',
        answer:
          'FlipIt supports English and Polish UI. You can edit your listing text in your preferred language, and (where available) AI drafts are generated in the selected language.',
      },
      {
        question: 'How much time will automation actually save?',
        answer:
          'Most sellers reclaim hours each week that were previously spent rewriting listings, resizing photos, and filling categories/required fields across multiple dashboards.',
      },
    ],
  },
  {
    icon: Sparkles,
    title: 'Roadmap & Future Features',
    items: [
      {
        question: 'Will FlipIt help me find undervalued items?',
        answer:
          'Not in the current version. Deal discovery and sourcing alerts are not implemented yet and may be considered in future iterations.',
      },
      {
        question: 'Are there plans for automated negotiations?',
        answer:
          'Not in the current version. We may explore optional negotiation templates in the future, but FlipIt will not negotiate automatically on your behalf.',
      },
      {
        question: 'What other upgrades are coming next?',
        answer:
          'We focus on improving listing quality and publishing reliability, and expanding supported marketplaces over time. We’ll share roadmap updates as features become available.',
      },
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

const FAQPage = () => {
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  const toggleQuestion = (id: string) => {
    setOpenQuestion((prev) => (prev === id ? null : id));
  };

  return (
    <div className="relative overflow-hidden bg-neutral-950 text-white">
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        canonicalUrl="https://myflipit.live/faq"
        keywords={keywords}
        structuredData={faqStructuredData}
        language={getCurrentLanguage()}
      />

      <AnimatedGradientBackground />

      <section className="relative py-16 md:py-24 text-center px-4">
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mx-auto max-w-4xl text-3xl md:text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
        >
          Your FlipIt FAQ Hub
        </motion.h1>
        <motion.p
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mx-auto mt-6 max-w-2xl text-base md:text-lg text-neutral-300 px-2"
        >
          Everything you need to know about AI-powered crosslisting, manual approval, and what FlipIt does (and doesn’t) automate today.
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
          <h2 className="text-2xl md:text-3xl font-bold text-white">Need a deeper dive?</h2>
          <p className="mt-4 text-sm md:text-base text-neutral-300 px-2">
            Explore how AI crosslisting works in detail, or jump into the guide for growth ideas.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <HeroCTA asChild>
              <Link to="/how-it-works">How FlipIt Works</Link>
            </HeroCTA>
            <SecondaryAction asChild>
              <Link to="/automated-reselling-platform-guide">Read the Playbook</Link>
            </SecondaryAction>
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
           <h2 className="text-3xl md:text-4xl font-extrabold text-white">Ready to automate your crosslisting?</h2>
           <p className="mt-4 text-neutral-100">
            Create an account and turn a single photo into listing drafts for OLX, Vinted, Facebook Marketplace, and eBay — then publish with your approval.
           </p>
           <HeroCTA
             asChild
             className="mt-6"
           >
            <Link to="/login?register=1">Create your account</Link>
           </HeroCTA>
         </motion.div>
       </section>
     </div>
  );
};

export default FAQPage;
