import { Translations } from '../components/language-utils';

export const forgotPasswordTranslations: Translations = {
  en: {
    pageAccess: 'Account Recovery',
    heroTitle: 'Reset access to your FlipIt account',
    heroDescription: 'Enter the email you used to sign up and we will send a reset link if it exists.',
    formTitle: 'Forgot Password',
    emailLabel: 'Email Address',
    emailPlaceholder: 'you@example.com',
    submitButton: 'Send reset link',
    submittingButton: 'Sending…',
    backToLogin: 'Back to login',
    successTitle: 'Check your inbox',
    successMessage: 'If the email exists, we sent a reset link. It may take a minute to arrive.',
    errorGeneric: 'Unable to send reset email. Try again later.'
  },
  pl: {
    pageAccess: 'Odzyskiwanie dostępu',
    heroTitle: 'Odzyskaj dostęp do konta FlipIt',
    heroDescription: 'Podaj e-mail użyty do rejestracji. Jeśli istnieje, wyślemy link do resetu.',
    formTitle: 'Nie pamiętasz hasła?',
    emailLabel: 'Adres e-mail',
    emailPlaceholder: 'twoj@email.com',
    submitButton: 'Wyślij link resetu',
    submittingButton: 'Wysyłanie…',
    backToLogin: 'Wróć do logowania',
    successTitle: 'Sprawdź skrzynkę',
    successMessage: 'Jeśli e-mail istnieje, wysłaliśmy link resetujący. Dostarczenie może chwilę potrwać.',
    errorGeneric: 'Nie udało się wysłać linku. Spróbuj ponownie później.'
  }
};
