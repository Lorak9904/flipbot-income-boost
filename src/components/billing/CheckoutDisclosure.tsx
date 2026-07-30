import { Link } from 'react-router-dom';
import { getCurrentLanguage, getLocalizedPathForLanguage } from '@/components/language-utils';

type CheckoutDisclosureProps =
  | {
      variant: 'subscription';
      price: string;
      period: string;
    }
  | {
      variant: 'one-time';
    };

export function CheckoutDisclosure(props: CheckoutDisclosureProps) {
  const language = getCurrentLanguage();
  const termsPath = getLocalizedPathForLanguage('/terms', language);
  const privacyPath = getLocalizedPathForLanguage('/privacy', language);
  const termsLabel = language === 'pl' ? 'Regulamin' : 'Terms';
  const privacyLabel = language === 'pl' ? 'Politykę prywatności' : 'Privacy Policy';

  return (
    <p
      data-testid={`checkout-disclosure-${props.variant}`}
      className="mt-3 text-xs leading-5 text-neutral-400"
    >
      {props.variant === 'subscription'
        ? language === 'pl'
          ? `${props.price} ${props.period}. Ostateczna kwota i termin są pokazane w Stripe Checkout i mogą się różnić. Opcje zarządzania planem i anulowania są dostępne w Stripe Billing Portal. Kontynuując, potwierdzasz zapoznanie się z `
          : `${props.price} ${props.period}. The final amount and timing are shown in Stripe Checkout and may vary. Plan management and cancellation options are available through Stripe Billing Portal. By continuing, you acknowledge the `
        : language === 'pl'
          ? 'Cena pokazana w Stripe Checkout jest płatnością jednorazową, bez opłat cyklicznych. Kontynuując, potwierdzasz zapoznanie się z '
          : 'The price shown in Stripe Checkout is a one-time payment with no recurring charge. By continuing, you acknowledge the '}
      <Link to={termsPath} target="_blank" className="text-cyan-300 underline underline-offset-2">
        {termsLabel}
      </Link>
      {language === 'pl' ? ' i ' : ' and '}
      <Link to={privacyPath} target="_blank" className="text-cyan-300 underline underline-offset-2">
        {privacyLabel}
      </Link>
      .
    </p>
  );
}
