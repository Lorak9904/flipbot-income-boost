import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import LoginWithGmail from '@/components/LoginWithGmail';

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
    if (password.length < 8) errors.push("Password must be at least 8 characters long");
    if (name && password.toLowerCase().includes(name.toLowerCase())) errors.push("Password is too similar to your name");
    const emailPart = email.split('@')[0];
    if (emailPart && password.toLowerCase().includes(emailPart.toLowerCase())) errors.push("Password is too similar to your email address");
    const COMMON_PASSWORDS = [
      'password', '123456', '12345678', 'qwerty', 'abc123', '111111',
      '123456789', '12345', '123123', '000000'
    ];
    if (COMMON_PASSWORDS.includes(password.toLowerCase())) errors.push("Password is too common");
    if (/^\d+$/.test(password)) errors.push("Password cannot be entirely numeric");
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
      setError("All fields are required.");
      return;
    }
    if (errors.length > 0) {
      setPasswordErrors(errors);
      return;
    }
    setLoading(true);
    try {
      await registerWithEmail(email, password, name);
      setRegisterSuccess("Registration successful! You can now log in.");
      setIsSignUp(false);
      setEmail('');
      setPassword('');
      setName('');
      // window.location.reload();
    } catch (err: any) {
      setError(err.message || "Registration failed.");
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-950 text-white">
      {/* Neon blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[65%] top-[-15%] h-[34rem] w-[34rem] -translate-x-1/2 rotate-45 rounded-full bg-fuchsia-600 opacity-30 blur-3xl" />
        <div className="absolute right-[60%] bottom-[-20%] h-[30rem] w-[30rem] translate-x-1/2 rounded-full bg-cyan-500 opacity-20 blur-3xl" />
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="relative z-10 w-full max-w-md rounded-3xl bg-neutral-900/70 p-10 shadow-2xl ring-1 ring-white/10 backdrop-blur-md"
      >
        <motion.h1
          variants={fadeUp}
          className="mb-6 text-center text-3xl font-extrabold tracking-tight"
        >
          {isSignUp ? (
            <>Create&nbsp;<span className="text-cyan-400">Account</span></>
          ) : (
            <>Welcome&nbsp;<span className="text-cyan-400">Back</span></>
          )}
        </motion.h1>

        {error && (
          <p className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400 ring-1 ring-red-400/50">
            {error}
          </p>
        )}
        {registerSuccess && (
          <p className="mb-4 rounded-lg bg-green-500/10 p-3 text-sm text-green-400 ring-1 ring-green-400/50">
            {registerSuccess}
          </p>
        )}
        {isSignUp ? (
          <form onSubmit={handleRegister} className="space-y-6">
            <motion.div variants={fadeUp} custom={1}>
              <label htmlFor="register-email" className="mb-1 block text-sm font-medium">
                Email
              </label>
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full rounded-lg bg-neutral-800/60 px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </motion.div>
            <motion.div variants={fadeUp} custom={2}>
              <label htmlFor="register-name" className="mb-1 block text-sm font-medium">
                Name
              </label>
              <input
                id="register-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoComplete="name"
                placeholder="Your name"
                className="w-full rounded-lg bg-neutral-800/60 px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </motion.div>
            <motion.div variants={fadeUp} custom={3}>
              <label htmlFor="register-password" className="mb-1 block text-sm font-medium">
                Password
              </label>
              <input
                id="register-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full rounded-lg bg-neutral-800/60 px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </motion.div>
            {passwordErrors.length > 0 && (
              <ul className="mb-2 text-xs text-red-400">
                {passwordErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            )}
            <motion.div variants={fadeUp} custom={4} className="flex items-center justify-between text-xs">
              <button
                type="button"
                className="text-neutral-400 transition-colors hover:text-cyan-400"
                onClick={() => setIsSignUp(false)}
              >
                Already have an account? Sign in
              </button>
            </motion.div>
            <motion.div variants={fadeUp} custom={5}>
              <Button
                type="submit"
                disabled={loading}
                size="lg"
                className="w-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white shadow-md shadow-fuchsia-500/20 hover:to-fuchsia-600 disabled:opacity-50"
              >
                {loading ? 'Creating account…' : 'Create Account'}
              </Button>
            </motion.div>
            
              <div className="my-6 flex items-center justify-center">
              <hr className="w-full border-t border-neutral-700" />
              <span className="mx-4 text-xs text-neutral-400">or</span>
              <hr className="w-full border-t border-neutral-700" />
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
                  className="w-full rounded-lg bg-neutral-800/60 px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                  className="w-full rounded-lg bg-neutral-800/60 px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
            {/* new line */}
            <div className="my-6 flex items-center justify-center">
              <hr className="w-full border-t border-neutral-700" />
              <span className="mx-4 text-xs text-neutral-400">or</span>
              <hr className="w-full border-t border-neutral-700" />
              </div>
            <LoginWithGmail />
          </>
        )}
      </motion.div>
    </div>
  );
};

export default LoginPage;
