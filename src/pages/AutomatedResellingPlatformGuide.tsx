import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SEOHead } from '@/components/SEOHead';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 * i, duration: 0.6, ease: 'easeOut' },
  }),
};

const pageTitle = 'Automated Reselling Platform Playbook: Crosslist Faster with myflipit.live';
const pageDescription = 'See how myflipit.live turns a single photo into synchronized OLX and Vinted listings today—and what crosslisting automation features are coming next.';
const keywords = [
  'automated reselling platform',
  'AI crosslisting',
  'marketplace automation software',
  'OLX crosslisting tool',
  'Vinted crosslisting automation',
  'one photo crosslisting',
  'seller automation',
  'future sourcing alerts',
];

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
      url: 'https://myflipit.live/og-image.jpg',
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

const heroBadges = [
  'AI crosslisting automation',
  'One-photo listings',
  'Auto-synced messaging',
];

const crosslistingHighlights = [
  'Upload a single product photo and FlipIt drafts marketplace-ready copy for OLX, Vinted, and Facebook.',
  'Inventory, pricing, and availability stay in lockstep across every channel without spreadsheets.',
  'AI-powered replies keep buyers engaged while you focus on sourcing, packing, and delivery.',
];

const futureHighlights = [
  'Automated sourcing alerts will soon flag undervalued OLX and Vinted deals tailored to your filters.',
  'AI negotiation templates will help secure better buy prices without writing every message from scratch.',
  'Smart relist reminders will keep profitable inventory circulating across each marketplace automatically.',
];

const AutomatedResellingPlatformGuide = () => {
  return (
    <div className="relative overflow-hidden bg-neutral-950 text-white">
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        canonicalUrl="https://myflipit.live/automated-reselling-platform-guide"
        type="article"
        keywords={keywords}
        structuredData={articleStructuredData}
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
                Automated Reselling Platform Guide
              </span>
              <h1 className="my-custom-font text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
                Automated Reselling Platform <span className="text-cyan-400">Playbook:</span> Crosslist Faster with <span className="bg-gradient-to-r from-fuchsia-400 to-cyan-400 inline-block text-transparent bg-clip-text">myflipit.live</span>
              </h1>
              <p className="max-w-2xl text-lg/relaxed text-neutral-300 mx-auto">
                It's 1 a.m., you're juggling OLX, Vinted, and Facebook tabs trying to keep listings in sync. FlipIt's AI crosslisting platform turns one photo into polished listings across every marketplace—so you can reclaim your time without sacrificing reach.
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
          <span className="text-xs uppercase tracking-[0.4em] text-cyan-300">One photo. Every marketplace.</span>
          <h2 className="mt-4 text-2xl font-semibold text-white sm:text-3xl">Why automated crosslisting beats manual copy-paste</h2>
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
          <h2 className="text-2xl font-bold text-white mb-6">The Hidden Grind of Manual Crosslisting</h2>
          <p className="text-neutral-300 mb-4">
            Manual crossposting means retyping titles, resizing photos, and updating prices in multiple dashboards every time demand shifts. It's easy to double-sell stock or leave buyers waiting while you copy answers between OLX and Vinted threads.
          </p>
          <p className="text-neutral-300">
            Even seasoned resellers lose hours keeping marketplaces aligned. Without automation you're stuck maintaining spreadsheets instead of scaling your shop, onboarding new inventory, or delighting repeat buyers.
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
          <h2 className="text-2xl font-bold text-white mb-6">What is an Automated Reselling Platform?</h2>
          <p className="text-neutral-300 mb-4">
            An automated reselling platform centralizes your listings, buyers, and pricing rules in one dashboard. Drop in product photos and details once—AI turns them into optimized listings, routes buyer messages, and keeps stock levels synced across marketplaces.
          </p>
          <p className="text-neutral-300">
            With FlipIt you stay in control of approvals while the system handles repetitive crosslisting tasks. And because automation scales up with your catalog, you can grow to new marketplaces without growing your workload.
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
          <h2 className="text-2xl font-bold text-white mb-6">Introducing myflipit.live: Your Crosslisting Co-pilot</h2>
          <p className="text-neutral-300 mb-4">
            myflipit.live learns your item categories, preferred price thresholds, and buyer tone to keep every listing consistent. AI-generated descriptions, titles, and hashtags give you a professional voice on OLX, Vinted, and Facebook—no manual editing required.
          </p>
          <p className="text-neutral-300">
            The platform also routes buyer messages into a shared inbox, suggests quick replies, and mirrors availability the moment an item sells. Curious how it fits into your workflow? Explore the product tour at <Link to="/how-it-works" className="text-cyan-300 underline hover:text-cyan-200">how it works</Link>.
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
          <h2 className="text-2xl font-bold text-white mb-8 text-center">How to Maximize Your Profits with myflipit.live in 4 Simple Steps</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group relative overflow-hidden rounded-2xl bg-neutral-900/50 backdrop-blur-sm p-6 shadow-lg ring-1 ring-cyan-400/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:ring-cyan-400/40">
              <div className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="h-full w-full bg-gradient-to-br from-cyan-600/20 to-fuchsia-400/10 blur-2xl"></div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-400/10 mb-4 ring-1 ring-cyan-400/20">
                <span className="font-bold text-xl text-cyan-400">1</span>
              </div>
              <p className="font-semibold text-white text-lg mb-2">Connect Your Marketplaces</p>
              <p className="text-neutral-300">
                Securely link OLX, Vinted, Facebook, and other channels so FlipIt can sync your inboxes, listings, and pricing rules. New users can finish setup via the <Link to="/login" className="text-cyan-300 underline hover:text-cyan-200">secure login portal</Link> in minutes.
              </p>
            </div>
            
            <div className="group relative overflow-hidden rounded-2xl bg-neutral-900/50 backdrop-blur-sm p-6 shadow-lg ring-1 ring-cyan-400/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:ring-cyan-400/40">
              <div className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="h-full w-full bg-gradient-to-br from-cyan-600/20 to-fuchsia-400/10 blur-2xl"></div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-400/10 mb-4 ring-1 ring-cyan-400/20">
                <span className="font-bold text-xl text-cyan-400">2</span>
              </div>
              <p className="font-semibold text-white text-lg mb-2">Upload One Photo</p>
              <p className="text-neutral-300">
                Drag in product images and let AI draft titles, descriptions, and localized keywords while recommending competitive pricing for each marketplace.
              </p>
            </div>
            
            <div className="group relative overflow-hidden rounded-2xl bg-neutral-900/50 backdrop-blur-sm p-6 shadow-lg ring-1 ring-cyan-400/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:ring-cyan-400/40">
              <div className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="h-full w-full bg-gradient-to-br from-cyan-600/20 to-fuchsia-400/10 blur-2xl"></div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-400/10 mb-4 ring-1 ring-cyan-400/20">
                <span className="font-bold text-xl text-cyan-400">3</span>
              </div>
              <p className="font-semibold text-white text-lg mb-2">Approve & Crosslist</p>
              <p className="text-neutral-300">
                Review the suggested copy, adjust anything you like, and publish everywhere at once. FlipIt keeps stock counts, pricing, and messaging aligned automatically.
              </p>
            </div>
            
            <div className="group relative overflow-hidden rounded-2xl bg-neutral-900/50 backdrop-blur-sm p-6 shadow-lg ring-1 ring-cyan-400/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:ring-cyan-400/40">
              <div className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="h-full w-full bg-gradient-to-br from-cyan-600/20 to-fuchsia-400/10 blur-2xl"></div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-400/10 mb-4 ring-1 ring-cyan-400/20">
                <span className="font-bold text-xl text-cyan-400">4</span>
              </div>
              <p className="font-semibold text-white text-lg mb-2">Respond & Relist with AI</p>
              <p className="text-neutral-300">
                Built-in smart replies handle common buyer questions while relist nudges ensure popular items never go dark between marketplaces.
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
          <h2 className="text-2xl font-bold text-white mb-6">Who Can Benefit from Automated Crosslisting?</h2>
          <p className="text-neutral-300 mb-4">
            Students flipping sneakers, parents selling kids' gear, and professional resellers alike get their evenings back. myflipit.live keeps OLX, Vinted, and Facebook in sync so you can focus on photography, packaging, and delivering standout service.
          </p>
          <p className="text-neutral-300">
            If you rely on consistent cash flow from reselling, automation makes sure every listing stays accurate—and buyers always hear back fast.
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
          <h2 className="text-2xl font-bold text-white mb-8 text-center">What's Next for myflipit.live?</h2>
          <div className="w-full max-w-3xl mx-auto rounded-3xl border border-white/10 bg-gradient-to-br from-neutral-900/80 via-fuchsia-900/5 to-neutral-900/60 p-8 text-center shadow-xl shadow-fuchsia-500/10 backdrop-blur">
            <span className="text-xs uppercase tracking-[0.4em] text-cyan-300">Roadmap Highlights</span>
            <p className="mt-4 text-neutral-300">
              Crosslisting is just the start. We're actively building the next wave of automation so you can source smarter and sell faster.
            </p>
            <ul className="mt-6 space-y-4 text-left text-neutral-200 max-w-2xl mx-auto">
              {futureHighlights.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span className="mt-[6px] h-3 w-3 flex-shrink-0 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-400" aria-hidden="true" />
                  <span>{point}</span>
                </li>
              ))}
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
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Frequently Asked Questions (FAQ)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group rounded-2xl border border-white/5 bg-neutral-900/60 p-6 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 hover:border-cyan-400/20">
              <p className="font-semibold text-white text-lg mb-3">Is online reselling still profitable?</p>
              <p className="text-neutral-300">
                Yes. Demand for quality second-hand goods keeps rising, and an automated crosslisting platform like myflipit.live helps you reach more buyers without burning out.
              </p>
            </div>
            <div className="group rounded-2xl border border-white/5 bg-neutral-900/60 p-6 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 hover:border-cyan-400/20">
              <p className="font-semibold text-white text-lg mb-3">How can I keep listings consistent across marketplaces?</p>
              <p className="text-neutral-300">
                Upload once inside myflipit.live. AI handles copy, pricing, and sync so every change flows to OLX, Vinted, and Facebook instantly.
              </p>
            </div>
            <div className="group rounded-2xl border border-white/5 bg-neutral-900/60 p-6 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 hover:border-cyan-400/20">
              <p className="font-semibold text-white text-lg mb-3">Will FlipIt help me find inventory in the future?</p>
              <p className="text-neutral-300">
                Absolutely. Automated sourcing alerts and negotiation helpers are on the roadmap so the platform can spot undervalued items for you.
              </p>
            </div>
            <div className="group rounded-2xl border border-white/5 bg-neutral-900/60 p-6 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 hover:border-cyan-400/20">
              <p className="font-semibold text-white text-lg mb-3">Is myflipit.live easy to learn?</p>
              <p className="text-neutral-300">
                Designed for simplicity. The intuitive dashboard makes crosslisting as easy as uploading a single photo, and our guides walk you through each step of the process.
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
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Frequently Asked Questions (FAQ)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group rounded-2xl border border-white/5 bg-neutral-900/60 p-6 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 hover:border-cyan-400/20">
              <p className="font-semibold text-white text-lg mb-3">Is online reselling still profitable?</p>
              <p className="text-neutral-300">
                Yes. Demand for quality second-hand goods keeps rising, and an automated crosslisting platform like myflipit.live helps you reach more buyers without burning out.
              </p>
            </div>
            <div className="group rounded-2xl border border-white/5 bg-neutral-900/60 p-6 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 hover:border-cyan-400/20">
              <p className="font-semibold text-white text-lg mb-3">How can I keep listings consistent across marketplaces?</p>
              <p className="text-neutral-300">
                Upload once inside myflipit.live. AI handles copy, pricing, and sync so every change flows to OLX, Vinted, and Facebook instantly.
              </p>
            </div>
            <div className="group rounded-2xl border border-white/5 bg-neutral-900/60 p-6 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 hover:border-cyan-400/20">
              <p className="font-semibold text-white text-lg mb-3">Will FlipIt help me find inventory in the future?</p>
              <p className="text-neutral-300">
                Absolutely. Automated sourcing alerts and negotiation helpers are on the roadmap so the platform can spot undervalued items for you.
              </p>
            </div>
            <div className="group rounded-2xl border border-white/5 bg-neutral-900/60 p-6 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 hover:border-cyan-400/20">
              <p className="font-semibold text-white text-lg mb-3">Is myflipit.live easy to learn?</p>
              <p className="text-neutral-300">
                Designed for simplicity. The intuitive dashboard makes crosslisting as easy as uploading a single photo, and our guides walk you through each step of the process.
              </p>
            </div>
          </div>
        </motion.section>        <section className="mt-12 space-y-6">
          <h2 className="text-2xl font-bold text-white">What’s Next for myflipit.live?</h2>
          <div className="rounded-3xl border border-white/10 bg-neutral-900/60 p-8 shadow-xl shadow-fuchsia-500/10 backdrop-blur">
            <p className="text-neutral-300">
              Crosslisting is just the start. We’re actively building the next wave of automation so you can source smarter and sell faster.
            </p>
            <ul className="mt-6 space-y-3 text-neutral-200">
              {futureHighlights.map((point) => (
                <li key={point} className="flex items-start gap-2">
                  <span className="mt-[6px] h-2 w-2 flex-shrink-0 rounded-full bg-cyan-400" aria-hidden="true" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="text-2xl font-bold text-white">Frequently Asked Questions (FAQ)</h2>
          <div className="space-y-6 text-neutral-300">
            <div className="rounded-2xl border border-white/5 bg-neutral-900/60 p-5">
              <p className="font-semibold text-white">Is online reselling still profitable?</p>
              <p>
                Yes. Demand for quality second-hand goods keeps rising, and an automated crosslisting platform like myflipit.live helps you reach more buyers without burning out.
              </p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-neutral-900/60 p-5">
              <p className="font-semibold text-white">How can I keep listings consistent across marketplaces?</p>
              <p>
                Upload once inside myflipit.live. AI handles copy, pricing, and sync so every change flows to OLX, Vinted, and Facebook instantly.
              </p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-neutral-900/60 p-5">
              <p className="font-semibold text-white">Will FlipIt help me find inventory in the future?</p>
              <p>
                Absolutely. Automated sourcing alerts and negotiation helpers are on the roadmap so the platform can spot undervalued items for you.
              </p>
            </div>
          </div>
        </section>

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
              Ready to Start Flipping?
            </h2>
            <p className="md:text-lg text-neutral-300 mb-8">
              Trade endless copy-paste for an automated reselling platform that keeps your listings, buyers, and pricing aligned. Create your free account, link your marketplaces, and let myflipit.live guide your next flip.
            </p>
            <Link
              to="/get-started"
              className="inline-flex items-center rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-8 py-4 font-semibold text-white text-lg shadow-lg shadow-fuchsia-500/30 transition hover:to-fuchsia-600"
            >
              Start with myflipit.live
            </Link>
            <p className="mt-6 text-sm text-neutral-400">
              Already using the platform? Jump back into the dashboard via{' '}
              <Link to="/login" className="text-cyan-300 underline hover:text-cyan-200">
                your login
              </Link>
              , or explore more automation tips in the{' '}
              <Link to="/how-it-works" className="text-cyan-300 underline hover:text-cyan-200">
                how it works guide
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
