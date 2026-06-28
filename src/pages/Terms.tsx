import { LegalDocumentPage } from '@/components/legal/LegalDocumentPage';
import termsEn from '@/legal/terms_en.md?raw';
import termsPl from '@/legal/terms_pl.md?raw';

export default function TermsPage() {
  return (
    <LegalDocumentPage
      documents={{
        en: {
          title: 'Terms of Service',
          eyebrow: 'Legal',
          description:
            'The rules for using FlipIt, including accounts, marketplace connections, AI-assisted drafts, publishing responsibility, billing, and support.',
          lastUpdatedLabel: 'Last updated: 28 June 2026',
          canonicalPath: '/terms',
          alternatePath: '/pl/regulamin',
          alternateLabel: 'Czytaj po polsku',
          keywords: [
            'FlipIt terms of service',
            'marketplace automation terms',
            'AI listing tool terms',
            'crosslisting terms',
          ],
          content: termsEn,
        },
        pl: {
          title: 'Regulamin',
          eyebrow: 'Dokumenty prawne',
          description:
            'Zasady korzystania z FlipIt: konto, połączenia z marketplace, szkice AI, odpowiedzialność za publikację, rozliczenia i wsparcie.',
          lastUpdatedLabel: 'Ostatnia aktualizacja: 28 czerwca 2026',
          canonicalPath: '/pl/regulamin',
          alternatePath: '/terms',
          alternateLabel: 'Read in English',
          keywords: [
            'regulamin FlipIt',
            'regulamin automatyzacji marketplace',
            'regulamin narzędzia AI do ogłoszeń',
            'regulamin crosslistingu',
          ],
          content: termsPl,
        },
      }}
    />
  );
}
