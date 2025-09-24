import termsMd from '@/legal/flipit_regulamin.md?raw';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SEOHead } from '@/components/SEOHead';
import { getCurrentLanguage } from '@/components/language-utils';

const pageTitle = 'Terms of Service | FlipIt - AI Crosslisting Platform';
const pageDescription = 'Read FlipIt\'s terms of service for our AI-powered crosslisting platform that automates OLX, Vinted, and Facebook marketplace listings.';
const keywords = [
  'FlipIt terms of service',
  'crosslisting platform terms',
  'AI automation terms',
  'marketplace terms',
  'reselling platform legal',
  'terms and conditions',
];

export default function TermsPage() {
  return (
    <>
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        canonicalUrl="https://myflipit.live/terms"
        keywords={keywords}
        language={getCurrentLanguage()}
      />
      <section className="mx-auto max-w-screen-md px-4 py-8">
      <div className="prose prose-sm text-xs" style={{ lineHeight: 2 }}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({node, ...props}) => <h1 style={{fontSize: '1rem', lineHeight: 2.2}} {...props} />,
            h2: ({node, ...props}) => <h2 style={{fontSize: '0.95rem', lineHeight: 2.1}} {...props} />,
            h3: ({node, ...props}) => <h3 style={{fontSize: '0.9rem', lineHeight: 2}} {...props} />,
            h4: ({node, ...props}) => <h4 style={{fontSize: '0.85rem', lineHeight: 1.9}} {...props} />,
            h5: ({node, ...props}) => <h5 style={{fontSize: '0.8rem', lineHeight: 1.8}} {...props} />,
            h6: ({node, ...props}) => <h6 style={{fontSize: '0.75rem', lineHeight: 1.7}} {...props} />,
            p: ({node, ...props}) => <p style={{lineHeight: 1.5}} {...props} />,
            li: ({node, ...props}) => <li style={{lineHeight: 1.5}} {...props} />,
          }}
        >
          {termsMd}
        </ReactMarkdown>
      </div>
    </section>
    </>
  );
}
