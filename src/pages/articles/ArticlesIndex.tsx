import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SEOHead } from '@/components/SEOHead';
import { getCurrentLanguage, getTranslations } from '@/components/language-utils';
import { AnimatedGradientBackground } from '@/components/AnimatedGradientBackground';
import { articlesIndexTranslations } from './translations/articles-index.translations';
import { HeroCTA } from '@/components/ui/button-presets';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 * i, duration: 0.6, ease: 'easeOut' },
  }),
};

const keywords = [
  'marketplace automation tutorials',
  'vinted automation guide',
  'reselling tutorials',
  'crosslisting guide',
  'facebook marketplace automation',
  'olx automation',
  'reseller tools',
];

const ArticlesIndex = () => {
  const t = getTranslations(articlesIndexTranslations);
  const language = getCurrentLanguage();
  const canonicalUrl = 'https://myflipit.live/articles';

  const breadcrumbStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://myflipit.live',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Articles',
        item: canonicalUrl,
      },
    ],
  };

  const articles = [
    {
      title: t.article1Title,
      description: t.article1Description,
      href: '/articles/vinted-relisting-tool',
      badge: 'Popular',
    },
    {
      title: t.article2Title,
      description: t.article2Description,
      href: '/articles/cross-list-vinted-to-facebook-marketplace',
      badge: 'Crosslisting',
    },
    {
      title: t.article3Title,
      description: t.article3Description,
      href: '/articles/product-relister-for-vinted',
      badge: 'Lifecycle',
    },
  ];

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      <SEOHead
        title={t.pageTitle}
        description={t.pageDescription}
        canonicalUrl={canonicalUrl}
        type="website"
        keywords={keywords}
        structuredData={breadcrumbStructuredData}
        language={language}
      />

      <AnimatedGradientBackground />

      {/* Hero Section */}
      <section className="relative isolate overflow-hidden min-h-[40vh] flex items-center justify-center py-20">
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
                {t.heroLabel}
              </span>
              <h1 className="my-custom-font fluid-text-lg font-extrabold tracking-tight leading-tight text-balance">
                {t.heroTitle}
              </h1>
              <p className="max-w-2xl text-lg/relaxed text-neutral-300 mx-auto">
                {t.heroSubtitle}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="relative mx-auto max-w-4xl px-8 pb-24 md:px-8 lg:px-0">
        {/* Articles Grid */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-white mb-8 text-center">{t.articlesTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, idx) => (
              <Link
                key={idx}
                to={article.href}
                className="group relative overflow-hidden rounded-2xl bg-neutral-900/50 backdrop-blur-sm p-6 shadow-lg ring-1 ring-cyan-400/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:ring-cyan-400/40"
              >
                <div className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="h-full w-full bg-gradient-to-br from-cyan-600/20 to-fuchsia-400/10 blur-2xl"></div>
                </div>
                {article.badge && (
                  <span className="inline-block rounded-full border border-cyan-400/40 bg-neutral-900/80 px-3 py-1 text-xs text-cyan-300 mb-4">
                    {article.badge}
                  </span>
                )}
                <h3 className="font-semibold text-white text-lg mb-2 group-hover:text-cyan-300 transition-colors">
                  {article.title}
                </h3>
                <p className="text-neutral-300 text-sm">
                  {article.description}
                </p>
                <div className="mt-4 text-cyan-400 text-sm font-medium group-hover:text-cyan-300 transition-colors">
                  Read more →
                </div>
              </Link>
            ))}
          </div>
        </motion.section>

        {/* Pillar Guide Link */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mb-16 p-8 rounded-2xl bg-gradient-to-br from-neutral-900/80 to-neutral-900/40 backdrop-blur-sm ring-1 ring-cyan-500/10 shadow-lg shadow-cyan-500/5"
        >
          <h2 className="text-xl font-bold text-white mb-3">{t.pillarGuideTitle}</h2>
          <p className="text-neutral-300 mb-4">{t.pillarGuideDescription}</p>
          <Link 
            to="/automated-reselling-platform-guide" 
            className="text-cyan-300 hover:text-cyan-200 font-medium transition-colors"
          >
            {t.pillarGuideLinkText}
          </Link>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="py-8"
        >
          <div className="w-full max-w-2xl mx-auto rounded-3xl bg-gradient-to-r from-cyan-500/30 via-fuchsia-500/20 to-cyan-400/30 p-8 shadow-2xl text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-6 text-white drop-shadow-lg">
              {t.ctaTitle}
            </h2>
            <p className="md:text-lg text-neutral-300 mb-8">
              {t.ctaDescription}
            </p>
            <HeroCTA asChild>
              <Link to="/get-started">
                {t.ctaButtonText}
              </Link>
            </HeroCTA>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default ArticlesIndex;
