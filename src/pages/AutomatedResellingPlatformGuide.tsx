import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';
import { motion } from 'framer-motion';
import { ArrowRight, Search, Gauge, List, Plug } from 'lucide-react';
import { Button } from '@/components/ui/button';

const pageTitle = 'Automated Reselling Platform Playbook: Turn OLX & Vinted Deals into Profit with myflipit.live';
const pageDescription = 'Learn how the automated reselling platform myflipit.live spots undervalued OLX and Vinted items, automates online arbitrage, and scales your flipping profits.';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 * i, duration: 0.6, ease: 'easeOut' },
  }),
};

const AutomatedResellingPlatformGuide = () => {
  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        canonicalUrl="https://myflipit.live/automated-reselling-platform-guide"
        type="article"
      />

      {/* Background animation matching HowItWorksPage */}
      <div className="fixed inset-0 -z-20">
        <div className="absolute inset-0 bg-neutral-950" />
        {/* animated radial layers */}
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

      {/* Hero Section - matched to HowItWorksPage style */}
      <section className="relative py-24 text-center">
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mb-4 text-sm uppercase tracking-[0.3em] text-cyan-300"
        >
          Automated Reselling Platform Guide
        </motion.p>
        <motion.h1
          initial="hidden"
          animate="visible"
          custom={1}
          variants={fadeUp}
          className="mx-auto mb-6 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl"
        >
          Automated Reselling Platform Playbook
        </motion.h1>
        <motion.p
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mx-auto max-w-2xl text-lg text-neutral-300 mb-8"
        >
          It is 1 a.m., you are deep in another OLX and Vinted rabbit hole, and the clock keeps ticking while you chase that one undervalued treasure.
          Manual online arbitrage used to demand every spare minute. Now, an automated reselling platform like myflipit.live can shoulder the grind so you keep the thrill and the profits.
        </motion.p>
      </section>
      
      {/* Main content sections using card layout similar to How It Works */}
      <section className="relative isolate overflow-hidden py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mb-12 text-center"
          >
            <h2 className="text-3xl font-bold md:text-4xl">Understanding Automated Reselling</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-300">
              Discover how automation transforms the traditional reselling workflow into a scalable business model
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={1}
              variants={fadeUp}
              className="flex flex-col rounded-2xl bg-neutral-900/50 p-8 backdrop-blur-sm ring-1 ring-cyan-400/20"
            >
              <h3 className="mb-4 text-xl font-semibold text-white">The Hidden Grind of Manual Reselling</h3>
              <p className="text-neutral-300">
                Anyone who has tried OLX reselling or Vinted reselling knows the hustle: endless tabs, stale alerts, and spreadsheets that never quite keep up.
                Deals disappear mid-conversation, and guessing margins eats the time you meant to spend listing or delivering items.
              </p>
              <p className="mt-4 text-neutral-300">
                The more marketplaces you monitor, the more chaotic it gets. Without automation, you are always reacting, not leading, and that means missed flips and stalled side hustle ideas.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={2}
              variants={fadeUp}
              className="flex flex-col rounded-2xl bg-neutral-900/50 p-8 backdrop-blur-sm ring-1 ring-cyan-400/20"
            >
              <h3 className="mb-4 text-xl font-semibold text-white">What is an Automated Reselling Platform?</h3>
              <p className="text-neutral-300">
                An automated reselling platform is your always-on command center.
                It runs customized searches, tracks pricing trends, and flags the listings where you can find undervalued items before the crowd.
                Instead of juggling browser extensions and manual notes, you get one workspace built for online arbitrage decisions.
              </p>
              <p className="mt-4 text-neutral-300">
                Modern tools like myflipit.live score opportunities, alert you to fast movers, and keep your sourcing list full while you are sleeping, studying, or on a delivery run.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={3}
              variants={fadeUp}
              className="flex flex-col rounded-2xl bg-neutral-900/50 p-8 backdrop-blur-sm ring-1 ring-cyan-400/20"
            >
              <h3 className="mb-4 text-xl font-semibold text-white">Introducing myflipit.live</h3>
              <p className="text-neutral-300">
                myflipit.live brings OLX and Vinted reselling into one streamlined dashboard that keeps sourcing, negotiating, and listing aligned.
                The platform learns your target categories, preferred price ranges, and acceptable margins, then feeds you curated leads instead of generic alerts.
              </p>
              <p className="mt-4 text-neutral-300">
                Deep profit analysis highlights the flips worth chasing, while marketplace-ready templates speed up relisting so you can make money online without the late-night grind.
                Curious about the full workflow? Explore the product tour on{' '}
                <Link to="/how-it-works" className="text-cyan-300 underline hover:text-cyan-200">
                  how it works
                </Link>.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="relative isolate overflow-hidden py-16 bg-neutral-950/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mb-12 text-center"
          >
            <h2 className="text-3xl font-bold md:text-4xl">How to Maximize Your Profits with myflipit.live</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-300">
              Four simple steps to transform your reselling workflow
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={1}
              variants={fadeUp}
              className="flex flex-col rounded-2xl bg-neutral-900/50 p-6 backdrop-blur-sm ring-1 ring-cyan-400/20"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-400/10 mb-4 ring-1 ring-cyan-400/20">
                <Plug className="h-6 w-6 text-cyan-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Connect Your Accounts</h3>
              <p className="text-neutral-300">
                Securely link OLX, Vinted, and other marketplaces so myflipit.live can sync your saved searches and buyer messages.
                If you are new, the quick setup inside the{' '}
                <Link to="/login" className="text-cyan-300 underline hover:text-cyan-200">
                  secure login portal
                </Link>
                {' '}takes minutes.
              </p>
            </motion.div>
            
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={2}
              variants={fadeUp}
              className="flex flex-col rounded-2xl bg-neutral-900/50 p-6 backdrop-blur-sm ring-1 ring-cyan-400/20"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-400/10 mb-4 ring-1 ring-cyan-400/20">
                <Search className="h-6 w-6 text-cyan-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Automated Scanning</h3>
              <p className="text-neutral-300">
                Let the AI comb thousands of listings to surface the online arbitrage leads that match your filters.
                You will see alerts organized by profit potential, time on market, and demand signals.
              </p>
            </motion.div>
            
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={3}
              variants={fadeUp}
              className="flex flex-col rounded-2xl bg-neutral-900/50 p-6 backdrop-blur-sm ring-1 ring-cyan-400/20"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-400/10 mb-4 ring-1 ring-cyan-400/20">
                <Gauge className="h-6 w-6 text-cyan-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Profit Analysis</h3>
              <p className="text-neutral-300">
                Every opportunity includes fee estimates, delivery costs, and realistic resale pricing so you stay focused on reselling for profit.
                The dashboard makes it easy to approve or skip a deal with data, not hunches.
              </p>
            </motion.div>
            
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={4}
              variants={fadeUp}
              className="flex flex-col rounded-2xl bg-neutral-900/50 p-6 backdrop-blur-sm ring-1 ring-cyan-400/20"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-400/10 mb-4 ring-1 ring-cyan-400/20">
                <List className="h-6 w-6 text-cyan-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Quick Listing</h3>
              <p className="text-neutral-300">
                Push winning finds back to your storefront with optimized titles, description prompts, and pricing suggestions.
                Keeping your pipeline full becomes a one-click task instead of another manual spreadsheet routine.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Who Can Benefit Section */}
      <section className="relative isolate overflow-hidden py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mx-auto max-w-3xl text-center"
          >
            <h2 className="text-3xl font-bold md:text-4xl mb-6">Who Can Benefit from Automated Reselling?</h2>
            <p className="text-neutral-300 mb-4">
              Students chasing flexible side hustle ideas, stay-at-home parents optimizing free hours, and experienced sellers scaling across Poland all gain leverage with myflipit.live.
              The platform keeps OLX reselling and Vinted reselling organized so you can focus on pickups, photography, and customer care.
            </p>
            <p className="text-neutral-300">
              If your goal is to make money online without living inside spreadsheets, an automated reselling platform becomes your silent teammate, filtering noise and serving deals you can act on fast.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative isolate overflow-hidden py-16 bg-neutral-950/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mb-12 text-center"
          >
            <h2 className="text-3xl font-bold md:text-4xl">Frequently Asked Questions</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-300">
              Common questions about automated reselling platforms
            </p>
          </motion.div>
          
          <div className="mx-auto max-w-3xl">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={1}
              variants={fadeUp}
              className="mb-6 rounded-2xl bg-neutral-900/50 p-6 backdrop-blur-sm ring-1 ring-cyan-400/20"
            >
              <h3 className="font-semibold text-white mb-2">Is online reselling still profitable?</h3>
              <p className="text-neutral-300">
                Yes. Demand for quality second-hand goods keeps rising, and an automated reselling platform like myflipit.live helps you spot the best flips before they are gone.
              </p>
            </motion.div>
            
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={2}
              variants={fadeUp}
              className="mb-6 rounded-2xl bg-neutral-900/50 p-6 backdrop-blur-sm ring-1 ring-cyan-400/20"
            >
              <h3 className="font-semibold text-white mb-2">How can I find items to resell for profit?</h3>
              <p className="text-neutral-300">
                Use personalized alerts inside myflipit.live to track OLX and Vinted categories, then approve the leads that match your pricing strategy and pickup radius.
              </p>
            </motion.div>
            
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={3}
              variants={fadeUp}
              className="mb-6 rounded-2xl bg-neutral-900/50 p-6 backdrop-blur-sm ring-1 ring-cyan-400/20"
            >
              <h3 className="font-semibold text-white mb-2">Is it safe to use an automated reselling platform?</h3>
              <p className="text-neutral-300">
                myflipit.live uses encrypted, permission-based integrations so your marketplace credentials stay secure while automation handles the heavy lifting.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section - styled like the How It Works page */}
      <section className="relative py-24 text-center">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          variants={fadeUp}
          className="mb-8 text-3xl font-bold md:text-4xl"
        >
          Ready to Start Flipping?
        </motion.h2>
        <p className="mx-auto max-w-2xl text-neutral-300 mb-8">
          Trade midnight scrolling for an automated reselling platform that keeps opportunities flowing and profits growing. 
          Create your free account, link your marketplaces, and let myflipit.live guide your next flip.
        </p>
        <Button
          asChild
          size="lg"
          className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/20 hover:to-fuchsia-600"
        >
          <Link to="/get-started" className="flex items-center gap-2">
            Start with myflipit.live <ArrowRight className="h-5 w-5" />
          </Link>
        </Button>
        
        <p className="mt-6 text-sm text-neutral-400">
          Already using the platform? Jump back into the dashboard via{' '}
          <Link to="/login" className="text-cyan-300 underline hover:text-cyan-200">
            your login
          </Link>
          , or explore onboarding tips in the{' '}
          <Link to="/how-it-works" className="text-cyan-300 underline hover:text-cyan-200">
            how it works guide
          </Link>.
        </p>
      </section>
    </div>
  );
};

export default AutomatedResellingPlatformGuide;
