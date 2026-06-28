import { LegalDocumentPage } from '@/components/legal/LegalDocumentPage';
import cookiesEn from '@/legal/cookies_en.md?raw';
import cookiesPl from '@/legal/cookies_pl.md?raw';

export default function CookiesPolicyPage() {
  return (
    <LegalDocumentPage
      documents={{
        en: {
          title: 'Cookie Policy',
          eyebrow: 'Cookies',
          description:
            'How FlipIt uses cookies, local storage, analytics, live chat tools, login providers, payment providers, and marketplace services.',
          lastUpdatedLabel: 'Last updated: 28 June 2026',
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
          lastUpdatedLabel: 'Ostatnia aktualizacja: 28 czerwca 2026',
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
