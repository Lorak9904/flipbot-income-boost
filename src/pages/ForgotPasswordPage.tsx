import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthButton } from '@/components/ui/button-presets';
import { SEOHead } from '@/components/SEOHead';
import { getTranslations } from '../components/language-utils';
import { forgotPasswordTranslations } from './forgot-password-translations';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 * i, duration: 0.6, ease: 'easeOut' },
  }),
};

const ForgotPasswordPage = () => {
  const t = getTranslations(forgotPasswordTranslations);
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
    } catch (err: any) {
      setError(err?.message || t.errorGeneric);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-neutral-950 text-white">
      <SEOHead
        title="Forgot Password | FlipIt"
        description="Reset your FlipIt password"
        canonicalUrl="https://myflipit.live/forgot-password"
        robots="noindex, nofollow"
      />
      <div className="pointer-events-none fixed inset-0 -z-20">
        <div className="absolute inset-0 bg-neutral-950" />
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 1 }}
          animate={{ opacity: [1, 0.7, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          style={{ background: 'radial-gradient(circle at 20% 20%, rgba(236,72,153,.3) 0%, transparent 50%)' }}
        />
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0.7 }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          style={{ background: 'radial-gradient(circle at 80% 40%, rgba(6,182,212,.25) 0%, transparent 50%)' }}
        />
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          style={{ background: 'radial-gradient(circle at 40% 80%, rgba(168,85,247,.2) 0%, transparent 50%)' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, rgba(6,182,212,.1) 0%, rgba(236,72,153,.1) 100%)' }}
        />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-10 px-6 py-16 lg:flex-row lg:items-center lg:justify-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex max-w-xl flex-col items-center text-center lg:items-start lg:text-left"
        >
          <span className="text-xs uppercase tracking-[0.4em] text-cyan-300">{t.pageAccess}</span>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl">
            {t.heroTitle}
          </h1>
          <p className="mt-4 max-w-lg text-neutral-300">{t.heroDescription}</p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="w-full max-w-md rounded-3xl border border-white/10 bg-neutral-900/60 p-8 shadow-2xl shadow-fuchsia-500/10 backdrop-blur"
        >
          <motion.h2 variants={fadeUp} className="mb-6 text-center text-2xl font-extrabold tracking-tight">
            {t.formTitle}
          </motion.h2>

          {error && (
            <p className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400 ring-1 ring-red-400/50">
              {error}
            </p>
          )}
          {success && (
            <div className="mb-4 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-400 ring-1 ring-emerald-400/50">
              <p className="font-semibold">{t.successTitle}</p>
              <p className="mt-1 text-emerald-200/80">{t.successMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div variants={fadeUp} custom={2}>
              <label htmlFor="forgot-email" className="mb-1 block text-sm font-medium">
                {t.emailLabel}
              </label>
              <input
                id="forgot-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder={t.emailPlaceholder}
                className="w-full rounded-lg bg-neutral-800/60 px-6 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </motion.div>

            <motion.div variants={fadeUp} custom={3}>
              <AuthButton type="submit" disabled={loading}>
                {loading ? t.submittingButton : t.submitButton}
              </AuthButton>
            </motion.div>
          </form>

          <div className="mt-6 text-center text-xs text-neutral-400">
            <Link to="/login" className="transition-colors hover:text-cyan-400">
              {t.backToLogin}
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
