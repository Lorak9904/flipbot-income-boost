import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AnimatedGradientBackground } from '@/components/AnimatedGradientBackground';
import { SEOHead } from '@/components/SEOHead';
import { getCurrentLanguage, type Language } from '@/components/language-utils';

const SITE_URL = 'https://myflipit.live';

export interface LegalDocumentCopy {
  title: string;
  eyebrow: string;
  description: string;
  lastUpdatedLabel: string;
  canonicalPath: string;
  alternatePath: string;
  alternateLabel: string;
  keywords: string[];
  content: string;
}

interface LegalDocumentPageProps {
  documents: Record<Language, LegalDocumentCopy>;
}

const markdownComponents = {
  h2: ({ node: _node, ...props }: any) => (
    <h2
      className="mt-10 scroll-m-24 text-2xl font-semibold tracking-tight text-white"
      {...props}
    />
  ),
  h3: ({ node: _node, ...props }: any) => (
    <h3 className="mt-8 text-xl font-semibold tracking-tight text-neutral-100" {...props} />
  ),
  p: ({ node: _node, ...props }: any) => <p className="mt-4 leading-8 text-neutral-300" {...props} />,
  ul: ({ node: _node, ...props }: any) => (
    <ul className="mt-4 list-disc space-y-3 pl-6 text-neutral-300" {...props} />
  ),
  ol: ({ node: _node, ...props }: any) => (
    <ol className="mt-4 list-decimal space-y-3 pl-6 text-neutral-300" {...props} />
  ),
  li: ({ node: _node, ...props }: any) => <li className="leading-7 marker:text-cyan-300" {...props} />,
  a: ({ node: _node, ...props }: any) => (
    <a
      className="font-medium text-cyan-300 underline decoration-cyan-300/40 underline-offset-4 transition hover:text-cyan-200"
      {...props}
    />
  ),
  code: ({ node: _node, ...props }: any) => (
    <code
      className="rounded-md border border-white/10 bg-neutral-950/80 px-1.5 py-0.5 text-sm text-cyan-100"
      {...props}
    />
  ),
  strong: ({ node: _node, ...props }: any) => <strong className="font-semibold text-white" {...props} />,
};

export function LegalDocumentPage({ documents }: LegalDocumentPageProps) {
  const language = getCurrentLanguage();
  const copy = documents[language] ?? documents.en;
  const canonicalUrl = `${SITE_URL}${copy.canonicalPath}`;
  const alternateUrls = [
    { hrefLang: 'en', href: `${SITE_URL}${documents.en.canonicalPath}` },
    { hrefLang: 'pl', href: `${SITE_URL}${documents.pl.canonicalPath}` },
    { hrefLang: 'x-default', href: `${SITE_URL}${documents.en.canonicalPath}` },
  ];

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: copy.title,
    description: copy.description,
    url: canonicalUrl,
    inLanguage: language,
    dateModified: '2026-06-28',
    isPartOf: {
      '@type': 'WebSite',
      name: 'FlipIt',
      url: SITE_URL,
    },
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-neutral-950 text-white">
      <SEOHead
        title={copy.title}
        description={copy.description}
        canonicalUrl={canonicalUrl}
        keywords={copy.keywords}
        language={language}
        structuredData={structuredData}
        alternateUrls={alternateUrls}
      />
      <AnimatedGradientBackground />

      <section className="relative z-10 mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-10 max-w-3xl">
          <span className="inline-flex rounded-full border border-cyan-300/25 bg-neutral-950/55 px-4 py-2 text-sm font-semibold text-cyan-100 shadow-[0_0_30px_rgba(6,182,212,0.12)] backdrop-blur-md">
            {copy.eyebrow}
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            {copy.title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-300">
            {copy.description}
          </p>
          <div className="mt-6 flex flex-col gap-3 text-sm text-neutral-400 sm:flex-row sm:items-center">
            <span>{copy.lastUpdatedLabel}</span>
            <span className="hidden text-neutral-600 sm:inline" aria-hidden="true">
              /
            </span>
            <Link
              to={copy.alternatePath}
              className="font-medium text-cyan-300 underline decoration-cyan-300/40 underline-offset-4 transition hover:text-cyan-200"
            >
              {copy.alternateLabel}
            </Link>
          </div>
        </div>

        <article className="rounded-2xl border border-white/10 bg-neutral-950/85 p-6 shadow-2xl shadow-cyan-500/10 backdrop-blur md:p-10">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {copy.content}
          </ReactMarkdown>
        </article>
      </section>
    </div>
  );
}
