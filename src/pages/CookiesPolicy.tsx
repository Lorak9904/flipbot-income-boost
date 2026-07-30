import { LegalDocumentPage } from '@/components/legal/LegalDocumentPage';
import cookiesEn from '@/legal/cookies_en.md?raw';
import cookiesPl from '@/legal/cookies_pl.md?raw';

export default function CookiesPolicyPage() {
  return (
    <LegalDocumentPage
      dateModified="2026-07-21"
      documents={{
        en: {
          title: 'Cookie Policy',
          eyebrow: 'Cookies',
          description:
            'How FlipIt uses cookies, local storage, analytics, live chat tools, login providers, payment providers, and marketplace services.',
          canonicalPath: '/cookies',
          alternatePath: '/pl/polityka-cookies',
          alternateLabel: 'Czytaj po polsku',
          keywords: [
            'FlipIt cookie policy',
            'marketplace automation cookies',
            'PostHog cookies',
            'cookie consent',
          ],
          content: cookiesEn,
        },
        pl: {
          title: 'Polityka cookies',
          eyebrow: 'Cookies',
          description:
            'Jak FlipIt używa cookies, local storage, analityki, czatu, logowania, płatności i usług marketplace.',
          canonicalPath: '/pl/polityka-cookies',
          alternatePath: '/cookies',
          alternateLabel: 'Read in English',
          keywords: [
            'polityka cookies FlipIt',
            'cookies automatyzacja marketplace',
            'PostHog cookies',
            'zgoda cookies',
          ],
          content: cookiesPl,
        },
      }}
    />
  );
}
