import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import LoginWithGmail from '@/components/LoginWithGmail';
import { SEOHead } from '@/components/SEOHead';

// Fade‑up motion reused across inputs / header
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 * i, duration: 0.6, ease: 'easeOut' },
  }),
};

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithEmail, registerWithEmail } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  // Registration password validation (matches backend)
  const validatePassword = (password: string, name: string, email: string) => {
    const errors: string[] = [];
    if (password.length < 8) errors.push('Password must be at least 8 characters long');
    if (name && password.toLowerCase().includes(name.toLowerCase())) errors.push('Password is too similar to your name');
    const emailPart = email.split('@')[0];
    if (emailPart && password.toLowerCase().includes(emailPart.toLowerCase())) errors.push('Password is too similar to your email address');
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
    if (COMMON_PASSWORDS.includes(password.toLowerCase())) errors.push('Password is too common');
    if (/^\d+$/.test(password)) errors.push('Password cannot be entirely numeric');
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to log in');
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
      setError('All fields are required.');
      return;
    }
    if (errors.length > 0) {
      setPasswordErrors(errors);
      return;
    }
    setLoading(true);
    try {
      await registerWithEmail(email, password, name);
      setRegisterSuccess('Registration successful! You can now log in.');
      setIsSignUp(false);
      setEmail('');
      setPassword('');
      setName('');
      // window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('register') === '1') {
      setIsSignUp(true);
    }
  }, [location.search]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-neutral-950 text-white">
      <SEOHead
        title="Login | FlipIt"
        description="Log in or create your FlipIt account to manage crosslisting."
        canonicalUrl="https://myflipit.live/login"
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
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          style={{ background: 'radial-gradient(circle at 90% 90%, rgba(236,72,153,.15) 0%, transparent 50%)' }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(6,182,212,.1) 0%, rgba(236,72,153,.1) 100%)',
          }}
        />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-16 lg:flex-row lg:items-center lg:justify-center lg:gap-16">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex flex-col items-center text-center lg:items-start lg:text-left max-w-xl"
        >
          <span className="text-xs uppercase tracking-[0.4em] text-cyan-300">FlipIt Access</span>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl">
            Sign in to your automated crosslisting hub
          </h1>
          <p className="mt-4 text-neutral-300 max-w-lg">
            Manage listings, respond to buyers, and keep OLX, Vinted, and Facebook in sync without the copy-paste grind.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="w-full max-w-md rounded-3xl border border-white/10 bg-neutral-900/60 p-8 md:p-10 shadow-2xl shadow-fuchsia-500/10 backdrop-blur"
        >
          <motion.h2 variants={fadeUp} className="mb-8 text-center text-2xl md:text-3xl font-extrabold tracking-tight">
            {isSignUp ? (
              <>Create&nbsp;<span className="text-cyan-400">Account</span></>
            ) : (
              <>Welcome&nbsp;<span className="text-cyan-400">Back</span></>
            )}
          </motion.h2>

          {error && (
            <p className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400 ring-1 ring-red-400/50">
              {error}
            </p>
          )}
          {registerSuccess && (
            <p className="mb-4 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-400 ring-1 ring-emerald-400/50">
              {registerSuccess}
            </p>
          )}

          {isSignUp ? (
            <form onSubmit={handleRegister} className="space-y-6">
              <motion.div variants={fadeUp} custom={2}>
                <label htmlFor="register-name" className="mb-1 block text-sm font-medium">
                  Name
                </label>
                <input
                  id="register-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  placeholder="Your name"
                  className="w-full rounded-lg bg-neutral-800/60 px-6 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </motion.div>
              <motion.div variants={fadeUp} custom={3}>
                <label htmlFor="register-email" className="mb-1 block text-sm font-medium">
                  Email
                </label>
                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full rounded-lg bg-neutral-800/60 px-6 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </motion.div>
              <motion.div variants={fadeUp} custom={4}>
                <label htmlFor="register-password" className="mb-1 block text-sm font-medium">
                  Password
                </label>
                <input
                  id="register-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="w-full rounded-lg bg-neutral-800/60 px-6 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </motion.div>
              {passwordErrors.length > 0 && (
                <ul className="mb-2 text-xs text-red-400">
                  {passwordErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              )}
              <motion.div variants={fadeUp} custom={5} className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  className="text-neutral-400 transition-colors hover:text-cyan-400"
                  onClick={() => setIsSignUp(false)}
                >
                  Already have an account? Sign in
                </button>
              </motion.div>
              <motion.div variants={fadeUp} custom={6}>
                <Button
                  type="submit"
                  disabled={loading}
                  size="lg"
                  className="w-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white shadow-md shadow-fuchsia-500/20 hover:to-fuchsia-600 disabled:opacity-50"
                >
                  {loading ? 'Creating account…' : 'Create Account'}
                </Button>
              </motion.div>

              <div className="my-8 flex items-center">
                <hr className="flex-1 border-t border-neutral-700" />
                <span className="px-6 text-xs text-neutral-400">or</span>
                <hr className="flex-1 border-t border-neutral-700" />
              </div>
              <LoginWithGmail />
            </form>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div variants={fadeUp} custom={2}>
                  <label htmlFor="email" className="mb-1 block text-sm font-medium">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="w-full rounded-lg bg-neutral-800/60 px-6 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </motion.div>

                <motion.div variants={fadeUp} custom={3}>
                  <label htmlFor="password" className="mb-1 block text-sm font-medium">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full rounded-lg bg-neutral-800/60 px-6 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </motion.div>

                <motion.div variants={fadeUp} custom={4} className="flex items-center justify-between text-xs">
                  <Link to="/forgot-password" className="text-neutral-400 transition-colors hover:text-cyan-400">
                    Forgot password?
                  </Link>
                  <button
                    type="button"
                    className="text-neutral-400 transition-colors hover:text-cyan-400"
                    onClick={() => setIsSignUp(true)}
                  >
                    Create account
                  </button>
                </motion.div>

                <motion.div variants={fadeUp} custom={5}>
                  <Button
                    type="submit"
                    disabled={loading}
                    size="lg"
                    className="w-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white shadow-md shadow-fuchsia-500/20 hover:to-fuchsia-600 disabled:opacity-50"
                  >
                    {loading ? 'Signing in…' : 'Sign In'}
                  </Button>
                </motion.div>
              </form>
              <div className="my-8 flex items-center">
                <hr className="flex-1 border-t border-neutral-700" />
                <span className="px-6 text-xs text-neutral-400">or</span>
                <hr className="flex-1 border-t border-neutral-700" />
              </div>
              <LoginWithGmail />
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
