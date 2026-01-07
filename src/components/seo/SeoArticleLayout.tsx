import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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

interface Section {
  heading: string;
  bodyParagraphs: string[];
}

interface FAQ {
  q: string;
  a: string;
}

interface RelatedLink {
  text: string;
  href: string;
}

interface CTA {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  footerText?: string;
  footerLinkText?: string;
  footerLinkHref?: string;
}

interface SeoArticleLayoutProps {
  // SEO props
  title: string;
  description: string;
  canonicalUrl: string;
  keywords: string[];
  articleStructuredData: Record<string, unknown>;
  
  // Hero props
  heroLabel: string;
  heroTitle: string;
  heroTitleHighlight?: string;
  heroSubtitle: string;
  heroBadges?: string[];
  
  // Content props
  sections: Section[];
  faq?: FAQ[];
  
  // CTA props
  cta: CTA;
  
  // Related links
  relatedLinks: RelatedLink[];
  relatedLinksTitle?: string;
  
  // Optional highlights box
  highlightsTitle?: string;
  highlights?: string[];
}

export const SeoArticleLayout = ({
  title,
  description,
  canonicalUrl,
  keywords,
  articleStructuredData,
  heroLabel,
  heroTitle,
  heroTitleHighlight,
  heroSubtitle,
  heroBadges,
  sections,
  faq,
  cta,
  relatedLinks,
  relatedLinksTitle = 'Related Tutorials',
  highlightsTitle,
  highlights,
}: SeoArticleLayoutProps) => {
  const language = getCurrentLanguage();
  
  // Build FAQ structured data if FAQ exists
  const faqStructuredData = faq && faq.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  } : null;

  // Combine structured data
  const allStructuredData = faqStructuredData 
    ? [articleStructuredData, faqStructuredData]
    : articleStructuredData;

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      <SEOHead
        title={title}
        description={description}
        canonicalUrl={canonicalUrl}
        type="article"
        keywords={keywords}
        structuredData={allStructuredData}
        language={language}
      />

      <AnimatedGradientBackground />

      {/* Hero Section */}
      <section className="relative isolate overflow-hidden min-h-[50vh] flex items-center justify-center py-20">
        <div className="container mx-auto px-8">
          <div className="flex flex-col items-center text-center w-full max-w-3xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="space-y-6"
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-6 py-1 text-sm font-medium text-white backdrop-blur-md">
                {heroLabel}
              </span>
              <h1 className="my-custom-font fluid-text-lg font-extrabold tracking-tight leading-tight text-balance">
                {heroTitle}
                {heroTitleHighlight && (
                  <span className="text-cyan-400 text-balance"> {heroTitleHighlight}</span>
                )}
              </h1>
              <p className="max-w-2xl text-lg/relaxed text-neutral-300 mx-auto">
                {heroSubtitle}
              </p>
              {heroBadges && heroBadges.length > 0 && (
                <motion.div
                  custom={4}
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs uppercase tracking-wide text-neutral-300"
                >
                  {heroBadges.map((badge) => (
                    <span
                      key={badge}
                      className="rounded-full border border-cyan-400/40 bg-neutral-900/80 px-3 py-1 text-neutral-100 shadow-md shadow-cyan-500/10"
                    >
                      {badge}
                    </span>
                  ))}
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <article className="relative mx-auto max-w-4xl px-8 pb-24 md:px-8 lg:px-0">
        {/* Highlights box (optional) */}
        {highlights && highlights.length > 0 && (
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mb-16 w-full max-w-3xl mx-auto rounded-3xl border border-white/10 bg-neutral-900/60 p-8 text-center shadow-xl shadow-fuchsia-500/10 backdrop-blur"
          >
            {highlightsTitle && (
              <>
                <span className="text-xs uppercase tracking-[0.4em] text-cyan-300">Key Points</span>
                <h2 className="mt-4 text-2xl font-semibold text-white sm:text-3xl">{highlightsTitle}</h2>
              </>
            )}
            <ul className="mt-6 space-y-3 text-left text-neutral-200 max-w-xl mx-auto">
              {highlights.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="mt-[6px] h-2 w-2 flex-shrink-0 rounded-full bg-cyan-400" aria-hidden="true" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </motion.section>
        )}

        {/* Related tutorials section (near top for SEO internal linking) */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mb-16 p-6 rounded-2xl bg-neutral-900/40 backdrop-blur-sm ring-1 ring-white/5"
        >
          <h2 className="text-xl font-bold text-white mb-4">{relatedLinksTitle}</h2>
          <ul className="space-y-2">
            {relatedLinks.map((link, idx) => (
              <li key={idx}>
                <Link 
                  to={link.href} 
                  className="text-cyan-300 hover:text-cyan-200 underline transition-colors"
                >
                  {link.text}
                </Link>
              </li>
            ))}
          </ul>
        </motion.section>

        {/* Content sections */}
        {sections.map((section, idx) => (
          <motion.section
            key={idx}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className={`mb-16 p-8 rounded-2xl backdrop-blur-sm ring-1 ${
              idx % 3 === 0 
                ? 'bg-neutral-900/40 ring-white/5' 
                : idx % 3 === 1 
                  ? 'bg-gradient-to-br from-neutral-900/80 to-neutral-900/40 ring-cyan-500/10 shadow-lg shadow-cyan-500/5'
                  : 'bg-gradient-to-br from-neutral-900/60 via-fuchsia-900/10 to-neutral-900/40 ring-fuchsia-500/10 shadow-lg shadow-fuchsia-500/5'
            }`}
          >
            <h2 className="text-2xl font-bold text-white mb-6">{section.heading}</h2>
            {section.bodyParagraphs.map((para, pIdx) => (
              <p key={pIdx} className={`text-neutral-300 ${pIdx < section.bodyParagraphs.length - 1 ? 'mb-4' : ''}`}>
                {para}
              </p>
            ))}
          </motion.section>
        ))}

        {/* FAQ section */}
        {faq && faq.length > 0 && (
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {faq.map((item, idx) => (
                <div 
                  key={idx} 
                  className="group rounded-2xl border border-white/5 bg-neutral-900/60 p-6 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 hover:border-cyan-400/20"
                >
                  <p className="font-semibold text-white text-lg mb-3">{item.q}</p>
                  <p className="text-neutral-300">{item.a}</p>
                </div>
              ))}
            </div>
          </motion.section>
        )}

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
              {cta.title}
            </h2>
            <p className="md:text-lg text-neutral-300 mb-8">
              {cta.description}
            </p>
            <Link
              to={cta.buttonLink}
              className="inline-flex items-center rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-8 py-4 font-semibold text-white text-lg shadow-lg shadow-fuchsia-500/30 transition hover:to-fuchsia-600"
            >
              {cta.buttonText}
            </Link>
            {cta.footerText && (
              <p className="mt-6 text-sm text-neutral-400">
                {cta.footerText}
                {cta.footerLinkText && cta.footerLinkHref && (
                  <>
                    {' '}
                    <Link to={cta.footerLinkHref} className="text-cyan-300 underline hover:text-cyan-200">
                      {cta.footerLinkText}
                    </Link>
                  </>
                )}
              </p>
            )}
          </div>
        </motion.section>
      </article>
    </div>
  );
};

export default SeoArticleLayout;
