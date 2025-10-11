
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { SEOHead } from '@/components/SEOHead';
import { getTranslations, getCurrentLanguage } from '../components/language-utils';
import { successStoriesTranslations } from './successstories-translations';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 * i, duration: 0.6, ease: 'easeOut' },
  }),
};

const pageTitle = 'Success Stories | FlipIt - Real AI Crosslisting Results';
const pageDescription = 'See how FlipIt users profit with marketplace automation — AI crosslisting that removes manual descriptions, pricing, and category selection across OLX, Vinted, and Facebook.';
const keywords = [
  'FlipIt success stories',
  'AI crosslisting profits',
  'automated reselling results',
  'marketplace automation success',
  'automation for marketplaces',
  'ecommerce automation',
  'OLX automation',
  'Vinted automation',
  'Vinted app',
  'real user testimonials',
  'crosslisting income proof',
];

const heroBadges = ['Real profits', 'Verified users', 'AI automation'];

const testimonials = [
  {
    id: 1,
    name: 'Sarah M.',
    location: 'London, UK',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
    quote: 'I made over €180 in my first weekend using FlipIt! It found a vintage cabinet on local marketplace for €95 that I resold for €275. The AI even handled most of the messaging with buyers automatically.',
    highlight: '+€180 profit in one weekend',
    rating: 5
  },
  {
    id: 2,
    name: 'Marcus K.',
    location: 'Berlin, Germany',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
    quote: 'As a student, I needed extra income but had limited time. FlipIt changed everything! It found a gaming setup for €320 that I flipped for €550 in just 3 days. The automated messaging handled all negotiations.',
    highlight: '+€230 profit with minimal effort',
    rating: 5
  },
  {
    id: 3,
    name: 'Elena R.',
    location: 'Madrid, Spain',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
    quote: "I was skeptical at first, but FlipIt actually works! In my first month, I made over €650 flipping furniture while working my regular job. The AI's ability to spot good deals and cross-list automatically saves me hours daily.",
    highlight: '+€650 extra income per month',
    rating: 4
  },
  {
    id: 4,
    name: 'James W.',
    location: 'Amsterdam, Netherlands',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
    quote: 'FlipIt found a designer desk listed for €45 when similar models were selling for €180 elsewhere. I wouldn\'t have caught this opportunity manually! The profit margins FlipIt finds are incredible.',
    highlight: 'Found 300% profit deals automatically',
    rating: 5
  },
];

const SuccessStoriesPage = () => {
  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        canonicalUrl="https://myflipit.live/success-stories"
        keywords={keywords}
      />

      {/* Animated Background - matches Guide/FAQ/HowItWorks */}
      <div className="fixed inset-0 -z-20">
        <div className="absolute inset-0 bg-neutral-950" />
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

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 text-center px-4">
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mx-auto mb-6 max-w-4xl text-3xl md:text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
        >
          Real Success <span className="bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">Stories</span>
        </motion.h1>
        <motion.p
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mx-auto max-w-2xl text-base md:text-lg text-neutral-300 px-2"
        >
          See how FlipIt users are generating real profits with AI-powered crosslisting automation across multiple marketplaces.
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

      {/* Success Stories */}
      <section className="relative py-16 md:py-24">
        <div className="container mx-auto px-6 md:px-8">
          <div className="grid gap-8 md:gap-12">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={index}
                variants={fadeUp}
                className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-neutral-900/60 p-6 md:p-8 shadow-xl shadow-fuchsia-500/10 backdrop-blur"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-6 mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500/20 to-fuchsia-500/20 p-1 flex-shrink-0">
                    <div className="w-full h-full rounded-full overflow-hidden">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl md:text-2xl font-semibold text-white">{testimonial.name}</h3>
                    <p className="text-neutral-400 mb-3">{testimonial.location}</p>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, starIndex) => (
                        <svg 
                          key={starIndex} 
                          className={`w-5 h-5 ${starIndex < testimonial.rating ? 'text-yellow-400' : 'text-neutral-600'}`} 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                      ))}
                    </div>
                  </div>
                  <div className="md:text-right">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-fuchsia-500/20 border border-cyan-400/30">
                      <span className="text-sm font-medium text-cyan-300">
                        {testimonial.highlight}
                      </span>
                    </div>
                  </div>
                </div>
                <blockquote className="text-lg md:text-xl text-neutral-300 leading-relaxed px-2">
                  "{testimonial.quote}"
                </blockquote>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="relative py-16 md:py-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="container mx-auto px-6 md:px-8"
        >
          <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-neutral-900/60 p-8 md:p-12 text-center shadow-xl shadow-fuchsia-500/10 backdrop-blur"
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-6">
              "FlipIt has helped users generate over <span className="bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">€4,500</span> in collective profits during our beta testing phase."
            </h2>
            <p className="text-xl text-neutral-300 font-medium">— FlipIt Founder</p>
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 md:py-24 text-center px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="container mx-auto"
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-6 px-2">
            Ready to Write Your Success Story?
          </h2>
          <p className="text-lg text-neutral-300 max-w-2xl mx-auto mb-8 px-2">
            Join our waitlist to be among the first to access FlipIt's AI-powered crosslisting automation.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/20 hover:to-fuchsia-600 text-lg px-8 py-6"
          >
            <Link to="/get-started">Join the Waitlist</Link>
          </Button>
        </motion.div>
      </section>
    </div>
  );
};

export default SuccessStoriesPage;
