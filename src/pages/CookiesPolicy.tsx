import termsMd from '@/legal/cookies_policy.md?raw';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SEOHead } from '@/components/SEOHead';
import { getCurrentLanguage } from '@/components/language-utils';

const pageTitle = 'Cookies Policy | FlipIt - AI Crosslisting Platform';
const pageDescription = 'Learn about how FlipIt uses cookies to enhance your experience with our AI-powered crosslisting automation platform.';
const keywords = [
  'FlipIt cookies policy',
  'crosslisting platform cookies',
  'AI automation cookies',
  'website cookies policy',
  'privacy cookies',
  'cookie consent',
];

export default function CookiesPolicyPage() {
  return (
    <>
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        canonicalUrl="https://myflipit.live/cookies"
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
