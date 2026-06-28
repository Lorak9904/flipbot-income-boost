import { LegalDocumentPage } from '@/components/legal/LegalDocumentPage';
import privacyEn from '@/legal/privacy_en.md?raw';
import privacyPl from '@/legal/privacy_pl.md?raw';

export default function PrivacyPolicyPage() {
  return (
    <LegalDocumentPage
      documents={{
        en: {
          title: 'Privacy Policy',
          eyebrow: 'Privacy',
          description:
            'How FlipIt handles account data, marketplace connections, listing content, AI-assisted processing, payments, analytics, cookies, and user rights.',
          lastUpdatedLabel: 'Last updated: 28 June 2026',
          canonicalPath: '/privacy',
          alternatePath: '/pl/polityka-prywatnosci',
          alternateLabel: 'Czytaj po polsku',
          keywords: [
            'FlipIt privacy policy',
            'marketplace automation privacy',
            'AI listing privacy',
            'crosslisting data protection',
          ],
          content: privacyEn,
        },
        pl: {
          title: 'Polityka prywatności',
          eyebrow: 'Prywatność',
          description:
            'Jak FlipIt przetwarza dane konta, połączenia z marketplace, treści ogłoszeń, AI, płatności, analitykę, cookies i prawa użytkownika.',
          lastUpdatedLabel: 'Ostatnia aktualizacja: 28 czerwca 2026',
          canonicalPath: '/pl/polityka-prywatnosci',
          alternatePath: '/privacy',
          alternateLabel: 'Read in English',
          keywords: [
            'polityka prywatności FlipIt',
            'prywatność automatyzacji marketplace',
            'ochrona danych narzędzie AI do ogłoszeń',
            'crosslisting dane osobowe',
          ],
          content: privacyPl,
        },
      }}
    />
  );
}
