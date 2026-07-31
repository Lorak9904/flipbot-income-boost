import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthPageShell } from '@/components/auth/AuthPageShell';
import { authFadeUp } from '@/components/auth/auth-motion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AuthButton } from '@/components/ui/button-presets';
import { Input } from '@/components/ui/input';
import { SEOHead } from '@/components/SEOHead';
import { getCurrentLanguage, getLocalizedPathForLanguage, getTranslations } from '../components/language-utils';
import { resetPasswordTranslations } from './reset-password-translations';

const ResetPasswordPage = () => {
  const t = getTranslations(resetPasswordTranslations);
  const language = getCurrentLanguage();
  const localized = (path: string) => getLocalizedPathForLanguage(path, language);
  const location = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const token = (searchParams.get('token') || '').trim();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!token) { setError(t.tokenMissing); return; }
    if (password !== confirm) { setError(t.passwordMismatch); return; }
    setLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const detail = payload?.detail;
        const message = Array.isArray(detail) ? detail.join(' ') : detail;
        setError(message || t.errorGeneric);
      } else { setSuccess(true); }
    } catch (err: unknown) { setError(err instanceof Error ? err.message : t.errorGeneric); }
    finally { setLoading(false); }
  };

  return (
    <>
      <SEOHead title={language === 'pl' ? 'Ustaw nowe hasło FlipIt' : 'Set a new FlipIt password'} description={language === 'pl' ? 'Ustaw nowe hasło do swojego konta FlipIt.' : 'Set a new password for your FlipIt account.'} language={language} robots="noindex, nofollow" />
      <AuthPageShell eyebrow={t.pageAccess} heroTitle={t.heroTitle} heroDescription={t.heroDescription} formTitle={t.formTitle}>
        {error && <Alert variant="destructive" className="mb-4 bg-red-500/10"><AlertDescription>{error}</AlertDescription></Alert>}
        {success && <Alert variant="success" className="mb-4"><AlertTitle>{t.successTitle}</AlertTitle><AlertDescription>{t.successMessage}</AlertDescription></Alert>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div variants={authFadeUp} custom={2}>
            <label htmlFor="reset-password" className="mb-1 block text-sm font-medium">{t.passwordLabel}</label>
            <Input id="reset-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" placeholder={t.passwordPlaceholder} className="h-12 border-neutral-700 bg-neutral-800/60 px-6 text-white placeholder:text-neutral-500 focus-visible:ring-cyan-500 focus-visible:ring-offset-neutral-950" />
          </motion.div>
          <motion.div variants={authFadeUp} custom={3}>
            <label htmlFor="reset-confirm" className="mb-1 block text-sm font-medium">{t.confirmLabel}</label>
            <Input id="reset-confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required autoComplete="new-password" placeholder={t.confirmPlaceholder} className="h-12 border-neutral-700 bg-neutral-800/60 px-6 text-white placeholder:text-neutral-500 focus-visible:ring-cyan-500 focus-visible:ring-offset-neutral-950" />
          </motion.div>
          <motion.div variants={authFadeUp} custom={4}><AuthButton type="submit" disabled={loading}>{loading ? t.submittingButton : t.submitButton}</AuthButton></motion.div>
        </form>
        <div className="mt-6 text-center text-xs text-neutral-400"><Link to={localized('/login')} className="inline-flex min-h-11 items-center transition-colors hover:text-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400">{t.backToLogin}</Link></div>
      </AuthPageShell>
    </>
  );
};

export default ResetPasswordPage;
