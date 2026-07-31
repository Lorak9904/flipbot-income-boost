import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthPageShell } from '@/components/auth/AuthPageShell';
import { authFadeUp } from '@/components/auth/auth-motion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AuthButton } from '@/components/ui/button-presets';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import LoginWithGmail from '@/components/LoginWithGmail';
import { SEOHead } from '@/components/SEOHead';
import { getTranslations, getCurrentLanguage, getLocalizedPathForLanguage } from '../components/language-utils';
import { loginTranslations } from './login-translations';
import { isSafeReturnPath } from '@/lib/listing-editor/navigation';
import { matchLocalizedRoute } from '@/lib/localized-routes';
import { AuthApiError } from '@/lib/legal-acceptance';

const LoginPage = () => {
  const t = getTranslations(loginTranslations);
  const language = getCurrentLanguage();
  const localized = useCallback(
    (path: string) => getLocalizedPathForLanguage(path, language),
    [language],
  );
  const navigate = useNavigate();
  const location = useLocation();
  const {
    loginWithEmail,
    registerWithEmail,
    isAuthenticated,
    isLoading: isAuthLoading,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [legalAccepted, setLegalAccepted] = useState(false);
  const returnTo = new URLSearchParams(location.search).get('returnTo');

  const getPostAuthRedirect = useCallback(() => {
    const checkoutPlan = sessionStorage.getItem('flipit_checkout_plan');
    const checkoutBilling = sessionStorage.getItem('flipit_checkout_billing') || 'monthly';
    if (checkoutPlan) {
      return localized(`/pricing?checkout=1&plan=${checkoutPlan}&billing=${checkoutBilling}`);
    }
    if (
      isSafeReturnPath(returnTo) &&
      matchLocalizedRoute(returnTo.split(/[?#]/, 1)[0])?.key !== 'login' &&
      !returnTo.startsWith('/logout')
    ) {
      return returnTo;
    }
    return localized('/');
  }, [localized, returnTo]);

  // Registration password validation (matches backend)
  const validatePassword = (password: string, name: string, email: string) => {
    const errors: string[] = [];
    if (password.length < 8) errors.push(t.passwordMinLength);
    if (name && password.toLowerCase().includes(name.toLowerCase())) errors.push(t.passwordSimilarName);
    const emailPart = email.split('@')[0];
    if (emailPart && password.toLowerCase().includes(emailPart.toLowerCase())) errors.push(t.passwordSimilarEmail);
    const COMMON_PASSWORDS = [
      'password',
      '123456',
      '12345678',
      'qwerty',
      'abc123',
      '111111',
      '123456789',
      '12345',
      '123123',
      '000000',
    ];
    if (COMMON_PASSWORDS.includes(password.toLowerCase())) errors.push(t.passwordTooCommon);
    if (/^\d+$/.test(password)) errors.push(t.passwordNumericOnly);
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      navigate(getPostAuthRedirect(), { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.loginFailed);
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setRegisterSuccess(null);
    setPasswordErrors([]);
    const errors = validatePassword(password, name, email);
    if (!email || !name || !password) {
      setError(t.allFieldsRequired);
      return;
    }
    if (!legalAccepted) {
      setError(t.legalAcceptanceRequired);
      return;
    }
    if (errors.length > 0) {
      setPasswordErrors(errors);
      return;
    }
    setLoading(true);
    try {
      await registerWithEmail(email, password, name);
      setRegisterSuccess(t.registrationSuccess);
      setIsSignUp(false);
      setEmail('');
      setPassword('');
      setName('');
      // window.location.reload();
    } catch (err: unknown) {
      setError(getRegistrationErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const getRegistrationErrorMessage = (err: unknown) => {
    if (err instanceof AuthApiError) {
      if (err.code === 'legal_acceptance_required') return t.legalAcceptanceRequired;
      if (err.code === 'legal_version_outdated') return t.legalVersionOutdated;
      if (err.code === 'google_login_failed') return t.googleLoginFailed;
    }
    return t.registrationFailed;
  };

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      navigate(getPostAuthRedirect(), { replace: true });
    }
  }, [isAuthLoading, isAuthenticated, navigate, getPostAuthRedirect]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const plan = params.get('plan');
    const billing = params.get('billing');
    if (plan) {
      sessionStorage.setItem('flipit_checkout_plan', plan);
      if (billing) {
        sessionStorage.setItem('flipit_checkout_billing', billing);
      }
    }
    if (params.get('register') === '1') {
      setIsSignUp(true);
    } else {
      setIsSignUp(false);
      setLegalAccepted(false);
    }
  }, [location.search]);

  const formTitle = isSignUp ? t.createAccount : t.welcomeBack;
  const [formTitleLead, ...formTitleRest] = formTitle.split(' ');

  return (
    <>
      <SEOHead
        title={language === 'pl' ? 'Logowanie do FlipIt' : 'Log in to FlipIt'}
        description={language === 'pl' ? 'Zaloguj się do FlipIt, aby przygotowywać, sprawdzać i publikować ogłoszenia na połączonych platformach.' : 'Log in to FlipIt to prepare, review, and publish listings for your connected marketplaces.'}
        language={language}
        robots="noindex, nofollow"
      />
      <AuthPageShell
        eyebrow={t.pageAccess}
        heroTitle={t.heroTitle}
        heroDescription={t.heroDescription}
        formTitle={<>{formTitleLead}{formTitleRest.length > 0 && <>&nbsp;<span className="text-cyan-400">{formTitleRest.join(' ')}</span></>}</>}
      >

          {error && (
            <Alert variant="destructive" className="mb-4 bg-red-500/10"><AlertDescription>{error}</AlertDescription></Alert>
          )}
          {registerSuccess && (
            <Alert variant="success" className="mb-4"><AlertDescription>{registerSuccess}</AlertDescription></Alert>
          )}

          {isSignUp ? (
            <form onSubmit={handleRegister} className="space-y-6">
              <motion.div variants={authFadeUp} custom={2}>
                <label htmlFor="register-name" className="mb-1 block text-sm font-medium">
                  {t.nameLabel}
                </label>
                <Input
                  id="register-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  placeholder={t.namePlaceholder}
                  className="h-12 border-neutral-700 bg-neutral-800/60 px-6 text-white placeholder:text-neutral-500 focus-visible:ring-cyan-500 focus-visible:ring-offset-neutral-950"
                />
              </motion.div>
              <motion.div variants={authFadeUp} custom={3}>
                <label htmlFor="register-email" className="mb-1 block text-sm font-medium">
                  {t.emailLabel}
                </label>
                <Input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder={t.emailPlaceholder}
                  className="h-12 border-neutral-700 bg-neutral-800/60 px-6 text-white placeholder:text-neutral-500 focus-visible:ring-cyan-500 focus-visible:ring-offset-neutral-950"
                />
              </motion.div>
              <motion.div variants={authFadeUp} custom={4}>
                <label htmlFor="register-password" className="mb-1 block text-sm font-medium">
                  {t.passwordLabel}
                </label>
                <Input
                  id="register-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder={t.passwordPlaceholder}
                  className="h-12 border-neutral-700 bg-neutral-800/60 px-6 text-white placeholder:text-neutral-500 focus-visible:ring-cyan-500 focus-visible:ring-offset-neutral-950"
                />
              </motion.div>
              {passwordErrors.length > 0 && (
                <ul role="alert" className="mb-2 text-xs text-red-400">
                  {passwordErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              )}
              <motion.label variants={authFadeUp} custom={5} className="flex min-h-11 items-start gap-3 text-sm leading-5 text-neutral-300">
                <input
                  type="checkbox"
                  checked={legalAccepted}
                  onChange={(event) => setLegalAccepted(event.target.checked)}
                  className="mt-0.5 h-5 w-5 shrink-0 rounded border-neutral-600 bg-neutral-800 accent-cyan-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                  aria-describedby="registration-legal-copy"
                />
                <span id="registration-legal-copy">
                  {language === 'pl' ? 'Akceptuję ' : 'I accept the '}
                  <Link to={localized('/terms')} target="_blank" className="text-cyan-300 underline underline-offset-2">
                    {t.termsLink}
                  </Link>
                  {language === 'pl' ? ' i potwierdzam zapoznanie się z ' : ' and acknowledge the '}
                  <Link to={localized('/privacy')} target="_blank" className="text-cyan-300 underline underline-offset-2">
                    {t.privacyLink}
                  </Link>
                  .
                </span>
              </motion.label>
              <motion.div variants={authFadeUp} custom={5} className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center text-neutral-400 transition-colors hover:text-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                  onClick={() => setIsSignUp(false)}
                >
                  {t.backToSignIn}
                </button>
              </motion.div>
              <motion.div variants={authFadeUp} custom={6}>
                <AuthButton
                  type="submit"
                  disabled={loading || !legalAccepted}
                >
                  {loading ? t.creatingAccountButton : t.createAccountButton}
                </AuthButton>
              </motion.div>

              <div className="my-8 flex items-center">
                <hr className="flex-1 border-t border-neutral-700" />
                <span className="px-6 text-xs text-neutral-400">{t.orDivider}</span>
                <hr className="flex-1 border-t border-neutral-700" />
              </div>
              <LoginWithGmail
                signupMode
                legalAccepted={legalAccepted}
                onAuthError={(authError) => setError(getRegistrationErrorMessage(authError))}
              />
            </form>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div variants={authFadeUp} custom={2}>
                  <label htmlFor="email" className="mb-1 block text-sm font-medium">
                    {t.emailLabel}
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder={t.emailPlaceholder}
                    className="h-12 border-neutral-700 bg-neutral-800/60 px-6 text-white placeholder:text-neutral-500 focus-visible:ring-cyan-500 focus-visible:ring-offset-neutral-950"
                  />
                </motion.div>

                <motion.div variants={authFadeUp} custom={3}>
                  <label htmlFor="password" className="mb-1 block text-sm font-medium">
                    {t.passwordLabel}
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder={t.passwordPlaceholder}
                    className="h-12 border-neutral-700 bg-neutral-800/60 px-6 text-white placeholder:text-neutral-500 focus-visible:ring-cyan-500 focus-visible:ring-offset-neutral-950"
                  />
                </motion.div>

                <motion.div variants={authFadeUp} custom={4} className="flex items-center justify-between gap-4 text-xs">
                  <Link to={localized('/forgot-password')} className="inline-flex min-h-11 items-center text-neutral-400 transition-colors hover:text-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400">
                    {t.forgotPassword}
                  </Link>
                  <button
                    type="button"
                    className="inline-flex min-h-11 items-center text-neutral-400 transition-colors hover:text-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                    onClick={() => setIsSignUp(true)}
                  >
                    {t.createAccountLink}
                  </button>
                </motion.div>

                <motion.div variants={authFadeUp} custom={5}>
                  <AuthButton
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? t.signingInButton : t.signInButton}
                  </AuthButton>
                </motion.div>
              </form>
              <div className="my-8 flex items-center">
                <hr className="flex-1 border-t border-neutral-700" />
                <span className="px-6 text-xs text-neutral-400">{t.orDivider}</span>
                <hr className="flex-1 border-t border-neutral-700" />
              </div>
              <LoginWithGmail />
            </>
          )}
      </AuthPageShell>
    </>
  );
};

export default LoginPage;

