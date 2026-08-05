import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  ListChecks,
  MoveHorizontal,
  Send,
  ShieldCheck,
  Sparkles,
  Store,
  UploadCloud,
} from 'lucide-react';
import { HeroCTA, SecondaryAction } from '@/components/ui/button-presets';
import { SEOHead } from '@/components/SEOHead';
import {
  getCurrentLanguage,
  getLocalizedPathForLanguage,
  getTranslations,
} from '../components/language-utils';
import { getSeoMetadata } from '@/lib/seo-metadata';
import { homePageTranslations } from './homepage-translations';

const HERO_IMAGE_SIZES = '(min-width: 1024px) 32rem, (min-width: 640px) 70vw, calc(100vw - 3rem)';
const MARKETPLACE_LOGOS = {
  OLX: {
    src: '/platform-logos/olx-logo.svg',
    className: 'h-8 w-auto',
  },
  Vinted: {
    src: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Vinted_logo.png',
    className: 'h-8 w-auto',
  },
  eBay: {
    src: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/EBay_logo.svg',
    className: 'h-8 w-auto',
  },
  Allegro: {
    src: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Allegro.pl_sklep.svg',
    className: 'h-8 w-auto',
  },
  Etsy: {
    src: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Etsy_logo.svg',
    className: 'h-9 w-auto',
  },
};
const READINESS_LOGOS = {
  OLX: { src: '/platform-logos/olx-logo.svg', className: 'h-3.5 w-5' },
  Vinted: { src: '/platform-logos/vinted-icon.jpg', className: 'h-5 w-5 rounded-[0.3rem]' },
  eBay: { src: '/platform-logos/ebay-bag.svg', className: 'h-5 w-5' },
  Allegro: { src: '/platform-logos/allegro-icon.svg', className: 'h-5 w-5' },
  Etsy: { src: '/platform-logos/etsy-icon.svg', className: 'h-5 w-5' },
};
function ListingWorkspace({ t, reviewPath }) {
  const [comparisonPosition, setComparisonPosition] = useState(58);
  const updateComparisonFromPointer = (event) => {
    if (event.pointerType !== 'mouse') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const nextPosition = ((event.clientX - bounds.left) / bounds.width) * 100;
    setComparisonPosition(Math.min(100, Math.max(0, nextPosition)));
  };

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#101619] shadow-2xl shadow-cyan-950/50">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-xs text-neutral-400 sm:px-5">
        <span className="inline-flex items-center gap-1.5"><Store className="h-3.5 w-3.5" aria-hidden="true" />{t.workspace.back}</span>
        <span className="font-medium text-neutral-200">{t.workspace.itemName}</span>
        <span className="hidden items-center gap-1 text-emerald-300 sm:inline-flex"><CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />{t.workspace.saved}</span>
      </div>

      <div className="grid gap-3 p-3 lg:grid-cols-[0.88fr_1fr_0.84fr] lg:p-4">
        <section className="rounded-xl border border-white/10 bg-black/20 p-3">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-cyan-300/60 text-xs font-semibold text-cyan-200">1</span>
            <div>
              <h2 className="text-sm font-semibold text-white">{t.workspace.photos}</h2>
              <p className="text-xs text-neutral-500">{t.workspace.photosHint}</p>
            </div>
          </div>
          <div
            onPointerMove={updateComparisonFromPointer}
            className="relative aspect-[4/3] cursor-ew-resize touch-none overflow-hidden rounded-lg bg-neutral-950 outline-none ring-cyan-300 transition-shadow focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-[#101619]"
          >
            <img
              src={t.workspace.originalImageSrc}
              sizes={HERO_IMAGE_SIZES}
              alt={t.workspace.imageAlt}
              width="1200"
              height="900"
              loading="eager"
              decoding="async"
              fetchpriority="high"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <img
              src={t.workspace.imageSrc}
              srcSet={t.workspace.imageSrcSet}
              sizes={HERO_IMAGE_SIZES}
              alt=""
              aria-hidden="true"
              width="1200"
              height="900"
              loading="eager"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
              style={{ clipPath: `inset(0 0 0 ${comparisonPosition}%)` }}
            />
            <div
              aria-hidden="true"
              className="absolute inset-y-0 z-10 w-px bg-white shadow-[0_0_0_1px_rgba(8,11,12,0.5)]"
              style={{ left: `${comparisonPosition}%` }}
            >
              <span className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-neutral-950/90 text-white shadow-lg">
                <MoveHorizontal className="h-4 w-4" />
              </span>
            </div>
            <span className="absolute bottom-8 left-2 z-20 rounded-full bg-neutral-950/85 px-2 py-1 text-[10px] font-medium text-white ring-1 ring-white/10">
              {t.workspace.originalLabel}
            </span>
            <span className="absolute bottom-8 right-2 z-20 rounded-full bg-cyan-400 px-2 py-1 text-[10px] font-semibold text-neutral-950">
              {t.workspace.enhancedLabel}
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={comparisonPosition}
              onChange={(event) => setComparisonPosition(Number(event.target.value))}
              aria-label={t.workspace.comparisonControl}
              className="absolute inset-0 z-30 h-full w-full cursor-ew-resize opacity-0"
            />
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-cyan-300/15 bg-cyan-400/[0.06] px-3 py-2 text-xs font-medium text-neutral-100"><Sparkles className="h-3.5 w-3.5 shrink-0 text-cyan-300" aria-hidden="true" />{t.workspace.enhanceImage}</div>
          <p className="mt-2 text-xs leading-5 text-neutral-500">{t.workspace.enhanceHint}</p>
        </section>

        <section className="rounded-xl border border-white/10 bg-black/20 p-3">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-cyan-300/60 text-xs font-semibold text-cyan-200">2</span>
            <div>
              <h2 className="text-sm font-semibold text-white">{t.workspace.preview}</h2>
              <p className="text-xs text-neutral-500">{t.workspace.previewHint}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="rounded-lg border border-white/10 bg-black/20 p-2.5">
              <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">{t.workspace.titleLabel}</p>
              <p className="mt-1 text-sm font-medium text-white">{t.workspace.draftTitle}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/20 p-2.5">
              <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">{t.workspace.descriptionLabel}</p>
              <p className="mt-1 text-xs leading-5 text-neutral-300">{t.workspace.description}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/20 p-2.5">
              <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">{t.workspace.categoryLabel}</p>
              <p className="mt-1 text-xs text-neutral-200">{t.workspace.category}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {t.workspace.attributes.map((attribute) => (
                <div key={attribute.label} className="rounded-lg border border-white/10 bg-black/20 p-2">
                  <p className="text-[10px] text-neutral-500">{attribute.label}</p>
                  <p className="mt-0.5 text-xs font-medium text-neutral-200">{attribute.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-white/10 bg-black/20 p-3">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-cyan-300/60 text-xs font-semibold text-cyan-200">3</span>
            <div>
              <h2 className="text-sm font-semibold text-white">{t.workspace.readiness}</h2>
              <p className="text-xs text-neutral-500">{t.workspace.readinessHint} <span className="text-neutral-400">{t.workspace.readinessExample}</span></p>
            </div>
          </div>
          <div className="space-y-1.5">
            {t.marketplaces.map((marketplace) => {
              const logo = READINESS_LOGOS[marketplace];

              return (
                <div key={marketplace} className="flex min-h-9 items-center justify-between gap-2 rounded-lg border border-white/10 bg-black/20 px-2.5 py-1.5">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="flex h-6 w-7 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.04]">
                      {marketplace === 'Facebook Marketplace' ? (
                        <Store className="h-4 w-4 text-blue-400" aria-hidden="true" />
                      ) : logo ? (
                        <img src={logo.src} alt="" className={`${logo.className} object-contain`} />
                      ) : null}
                    </span>
                    <span className="text-[11px] font-medium leading-tight text-neutral-200">{marketplace}</span>
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1.5 text-[10px] font-medium text-cyan-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                    {t.workspace.reviewOptions}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 rounded-lg border border-cyan-300/20 bg-cyan-400/10 p-3">
            <div className="flex gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" aria-hidden="true" />
              <div>
                <p className="text-xs font-semibold text-white">{t.workspace.reviewTitle}</p>
                <p className="mt-1 text-[11px] leading-4 text-neutral-300">{t.workspace.reviewDescription}</p>
              </div>
            </div>
          </div>
          <Link to={reviewPath} className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-cyan-400 px-3 py-2.5 text-xs font-bold text-neutral-950 transition hover:bg-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#101619]">
            {t.workspace.reviewAction}<Send className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </section>
      </div>
    </div>
  );
}

const HomePage = () => {
  const t = getTranslations(homePageTranslations);
  const language = getCurrentLanguage();
  const localized = (path) => getLocalizedPathForLanguage(path, language);
  const seo = getSeoMetadata('home', language);
  const pageTitle = seo?.title ?? t.pageTitle;
  const pageDescription = seo?.description ?? t.pageDescription;
  const workflowSteps = [
    { Icon: UploadCloud, ...t.workflowSteps[0] },
    { Icon: Sparkles, ...t.workflowSteps[1] },
    { Icon: ListChecks, ...t.workflowSteps[2] },
  ];
  const seoKeywords = [
    'automated reselling platform',
    'AI crosslisting',
    'automation for marketplaces',
    'marketplace listing tool',
    'AI listing generator',
    'OLX listing tool',
    'Vinted listing tool',
    'Facebook Marketplace listing tool',
    'eBay listing tool',
    'Allegro listing tool',
    'Etsy listing tool',
  ];
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'FlipIt',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'PLN' },
    featureList: [
      'AI-generated listing drafts from photos',
      'Marketplace-specific listing drafts with manual approval',
      'Category mapping and required attributes',
      'Optional AI image enhancement',
    ],
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#080b0c] text-white">
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        canonicalUrl="https://myflipit.live/"
        keywords={seoKeywords}
        structuredData={structuredData}
        language={language}
      />
      <Helmet>
        <link rel="preload" as="image" href={t.workspace.imageSrc} type="image/webp" imageSrcSet={t.workspace.imageSrcSet} imageSizes={HERO_IMAGE_SIZES} />
      </Helmet>

      <section className="relative isolate overflow-hidden border-b border-white/10">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_8%_18%,rgba(168,85,247,0.18),transparent_30%),radial-gradient(circle_at_90%_48%,rgba(6,182,212,0.16),transparent_35%)]" />
        <div className="container py-16 sm:py-20 lg:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-[0.8fr_1.25fr] lg:gap-12">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />{t.eyebrow}
              </span>
              <h1 className="mt-6 max-w-xl text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                {t.heroTitleBefore}<span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-fuchsia-400 bg-clip-text text-transparent">{t.heroTitleHighlight}</span>{t.heroTitleAfter}
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-8 text-neutral-300">{t.heroDescription}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <HeroCTA asChild><Link to={localized('/login?register=1')}>{t.primaryCta}<ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" /></Link></HeroCTA>
                <SecondaryAction asChild><Link to={localized('/how-it-works')}>{t.secondaryCta}<ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" /></Link></SecondaryAction>
              </div>
              <p className="mt-5 inline-flex items-center gap-2 text-sm text-neutral-400"><ShieldCheck className="h-4 w-4 text-cyan-300" aria-hidden="true" />{t.heroReassurance}</p>
            </div>
            <ListingWorkspace
              t={t}
              reviewPath={localized('/login?register=1')}
            />
          </div>
        </div>
      </section>

      <section id="marketplaces" className="scroll-mt-20 border-y border-[#839295]/20 bg-[#071014] py-7">
        <div className="container">
          <div className="mb-6 flex items-center justify-center gap-5">
            <span aria-hidden="true" className="h-px flex-1 bg-[#839295]/20" />
            <p className="shrink-0 text-center text-[10px] font-semibold uppercase tracking-[0.25em] text-[#839295] sm:text-xs">{t.marketplaceLabel}</p>
            <span aria-hidden="true" className="h-px flex-1 bg-[#839295]/20" />
          </div>
          <div className="grid grid-cols-2 items-center gap-x-8 gap-y-7 sm:grid-cols-3 lg:grid-cols-6 lg:gap-x-10">
            {t.marketplaces.map((marketplace) => {
              const logo = MARKETPLACE_LOGOS[marketplace];

              if (marketplace === 'Facebook Marketplace') {
                return (
                  <span key={marketplace} className="inline-flex min-h-11 items-center justify-center gap-2.5 text-white opacity-55">
                    <Store className="h-7 w-7 shrink-0 stroke-[1.9]" aria-hidden="true" />
                    <span className="text-left text-[12px] font-semibold leading-[0.95] tracking-tight">Facebook<br />Marketplace</span>
                  </span>
                );
              }

              return (
                <span key={marketplace} className="inline-flex min-h-11 items-center justify-center">
                  {logo ? (
                    <img
                      src={logo.src}
                      alt={marketplace}
                      className={`${logo.className} max-w-[7.5rem] object-contain grayscale brightness-0 invert opacity-55`}
                    />
                  ) : (
                    <span className="text-xl font-semibold tracking-tight text-[#839295] opacity-70">{marketplace}</span>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      </section>

      <section id="workflow" className="container scroll-mt-20 py-16 sm:py-20 lg:py-24">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">{t.workflowEyebrow}</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{t.workflowTitle}</h2>
          <p className="mt-4 text-lg leading-8 text-neutral-300">{t.workflowDescription}</p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {workflowSteps.map(({ Icon, title, description }, index) => (
            <article key={title} className="border-t border-white/15 pt-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-300/20"><Icon className="h-5 w-5" aria-hidden="true" /></span>
              <p className="mt-5 text-sm font-medium text-cyan-200">0{index + 1}</p>
              <h3 className="mt-1 text-xl font-semibold text-white">{title}</h3>
              <p className="mt-3 max-w-sm leading-7 text-neutral-400">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#0d1315]">
        <div className="container grid gap-12 py-16 lg:grid-cols-2 lg:py-20">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">{t.preparesEyebrow}</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{t.preparesTitle}</h2>
            <ul className="mt-7 space-y-4">
              {t.preparesItems.map((item) => <li key={item} className="flex gap-3 text-neutral-300"><CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-cyan-300" aria-hidden="true" />{item}</li>)}
            </ul>
          </div>
          <div className="lg:border-l lg:border-white/10 lg:pl-12">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-fuchsia-300">{t.approvesEyebrow}</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{t.approvesTitle}</h2>
            <ul className="mt-7 space-y-4">
              {t.approvesItems.map((item) => <li key={item} className="flex gap-3 text-neutral-300"><CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-fuchsia-300" aria-hidden="true" />{item}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <section id="faq" className="container scroll-mt-20 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <p className="text-center text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">{t.faqEyebrow}</p>
          <h2 className="mt-3 text-center text-3xl font-bold tracking-tight sm:text-4xl">{t.faqTitle}</h2>
          <div className="mt-9 divide-y divide-white/10 border-y border-white/10">
            {t.faqs.map((faq) => (
              <details key={faq.question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-left font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
                  {faq.question}<span aria-hidden="true" className="text-xl text-cyan-300 transition group-open:rotate-45">+</span>
                </summary>
                <p className="max-w-2xl pt-3 leading-7 text-neutral-400">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-[radial-gradient(circle_at_50%_110%,rgba(6,182,212,0.22),transparent_48%)] py-16 sm:py-20">
        <div className="container text-center">
          <FileText className="mx-auto h-7 w-7 text-cyan-300" aria-hidden="true" />
          <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">{t.finalTitle}</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-neutral-300">{t.finalDescription}</p>
          <div className="mt-8 flex justify-center"><HeroCTA asChild><Link to={localized('/login?register=1')}>{t.finalCta}<ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" /></Link></HeroCTA></div>
          <p className="mt-4 text-sm text-neutral-400">{t.finalReassurance}</p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
