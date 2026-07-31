import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthPageShell } from '@/components/auth/AuthPageShell';
import { authFadeUp } from '@/components/auth/auth-motion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AuthButton } from '@/components/ui/button-presets';
import { Input } from '@/components/ui/input';
import { SEOHead } from '@/components/SEOHead';
import { getCurrentLanguage, getLocalizedPathForLanguage, getTranslations } from '../components/language-utils';
import { forgotPasswordTranslations } from './forgot-password-translations';

const ForgotPasswordPage = () => {
  const t = getTranslations(forgotPasswordTranslations);
  const language = getCurrentLanguage();
  const localized = (path: string) => getLocalizedPathForLanguage(path, language);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const detail = payload?.detail;
        const message = Array.isArray(detail) ? detail.join(' ') : detail;
        setError(message || t.errorGeneric);
      } else {
        setSuccess(true);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.errorGeneric);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead
        title={language === 'pl' ? 'Odzyskaj hasło do FlipIt' : 'Recover your FlipIt password'}
        description={language === 'pl' ? 'Poproś o bezpieczny link do ustawienia nowego hasła FlipIt.' : 'Request a secure link to set a new FlipIt password.'}
        language={language}
        robots="noindex, nofollow"
      />
      <AuthPageShell
        eyebrow={t.pageAccess}
        heroTitle={t.heroTitle}
        heroDescription={t.heroDescription}
        formTitle={t.formTitle}
      >
        {error && <Alert variant="destructive" className="mb-4 bg-red-500/10"><AlertDescription>{error}</AlertDescription></Alert>}
        {success && (
          <Alert variant="success" className="mb-4">
            <AlertTitle>{t.successTitle}</AlertTitle>
            <AlertDescription>{t.successMessage}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div variants={authFadeUp} custom={2}>
            <label htmlFor="forgot-email" className="mb-1 block text-sm font-medium">{t.emailLabel}</label>
            <Input id="forgot-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" placeholder={t.emailPlaceholder} className="h-12 border-neutral-700 bg-neutral-800/60 px-6 text-white placeholder:text-neutral-500 focus-visible:ring-cyan-500 focus-visible:ring-offset-neutral-950" />
          </motion.div>
          <motion.div variants={authFadeUp} custom={3}>
            <AuthButton type="submit" disabled={loading}>{loading ? t.submittingButton : t.submitButton}</AuthButton>
          </motion.div>
        </form>
        <div className="mt-6 text-center text-xs text-neutral-400">
          <Link to={localized('/login')} className="inline-flex min-h-11 items-center transition-colors hover:text-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400">{t.backToLogin}</Link>
        </div>
      </AuthPageShell>
    </>
  );
};

export default ForgotPasswordPage;
