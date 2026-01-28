import { Translations } from '../components/language-utils';

export const resetPasswordTranslations: Translations = {
  en: {
    pageAccess: 'Account Recovery',
    heroTitle: 'Create a new password',
    heroDescription: 'Your new password should be strong and unique to FlipIt.',
    formTitle: 'Reset Password',
    passwordLabel: 'New Password',
    passwordPlaceholder: '••••••••',
    confirmLabel: 'Confirm Password',
    confirmPlaceholder: 'Repeat new password',
    submitButton: 'Update password',
    submittingButton: 'Updating…',
    backToLogin: 'Back to login',
    successTitle: 'Password updated',
    successMessage: 'You can now sign in with your new password.',
    tokenMissing: 'Reset link is missing or invalid.',
    passwordMismatch: 'Passwords do not match.',
    errorGeneric: 'Unable to reset password. Try again.'
  },
  pl: {
    pageAccess: 'Odzyskiwanie dostępu',
    heroTitle: 'Ustaw nowe hasło',
    heroDescription: 'Nowe hasło powinno być silne i unikalne dla FlipIt.',
    formTitle: 'Resetuj hasło',
    passwordLabel: 'Nowe hasło',
    passwordPlaceholder: '••••••••',
    confirmLabel: 'Potwierdź hasło',
    confirmPlaceholder: 'Powtórz nowe hasło',
    submitButton: 'Zapisz hasło',
    submittingButton: 'Zapisywanie…',
    backToLogin: 'Wróć do logowania',
    successTitle: 'Hasło zaktualizowane',
    successMessage: 'Możesz zalogować się nowym hasłem.',
    tokenMissing: 'Link resetujący jest nieprawidłowy lub wygasł.',
    passwordMismatch: 'Hasła nie są zgodne.',
    errorGeneric: 'Nie udało się zresetować hasła. Spróbuj ponownie.'
  }
};
