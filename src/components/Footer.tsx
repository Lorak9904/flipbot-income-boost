import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

/**
 * Footer — neon‑on‑dark theme to match the new FlipIt aesthetic.
 * Gradient blobs sit behind a glass‑dark panel; text adapts to mobile.
 */
const Footer = () => {
  return (
    <footer className="relative overflow-hidden bg-neutral-950 text-white">
      {/* Neon gradient blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/3 -top-24 h-80 w-80 -translate-x-1/2 rotate-45 rounded-full bg-fuchsia-600 opacity-20 blur-3xl" />
        <div className="absolute right-1/4 bottom-0 h-72 w-72 translate-x-1/2 rounded-full bg-cyan-500 opacity-20 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Logo & tagline */}
          <div>
            <Link to="/" className="mb-4 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 font-bold">
                FI
              </div>
              <span className="font-heading text-xl font-semibold">FlipIt</span>
            </Link>
            <p className="max-w-xs text-sm text-neutral-300">
              The intelligent agent that helps you earn extra income through resale arbitrage.
            </p>
            <span className="mt-4 inline-block rounded-full bg-white/10 px-3 py-1 text-xs text-white backdrop-blur">
              🚀 Coming&nbsp;Soon
            </span>
          </div>

          {/* Product links */}
          <nav>
            <h4 className="mb-4 text-sm font-semibold text-neutral-100">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/automated-reselling-platform-guide" className="text-neutral-300 transition-colors hover:text-cyan-400">
                  Automated Reselling Guide
                </Link>
              </li>
              <li>
                <Link to="/features" className="text-neutral-300 transition-colors hover:text-cyan-400">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-neutral-300 transition-colors hover:text-cyan-400">
                  How&nbsp;It&nbsp;Works
                </Link>
              </li>
              <li>
                <Link to="/success-stories" className="text-neutral-300 transition-colors hover:text-cyan-400">
                  Success&nbsp;Stories
                </Link>
              </li>
            </ul>
          </nav>

          {/* Support links */}
          <nav>
            <h4 className="mb-4 text-sm font-semibold text-neutral-100">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/faq" className="text-neutral-300 transition-colors hover:text-cyan-400">
                  FAQ
                </Link>
              </li>
              <li>
                <a href="mailto:info@arrpo.com" className="text-neutral-300 transition-colors hover:text-cyan-400">
                  Contact&nbsp;Us
                </a>
              </li>
              <li>
                <Link to="/privacy" className="text-neutral-300 transition-colors hover:text-cyan-400">
                  Privacy&nbsp;Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-neutral-300 transition-colors hover:text-cyan-400">
                  Terms
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-neutral-300 transition-colors hover:text-cyan-400">
                  Cookies&nbsp;Policy
                </Link>
              </li>
            </ul>
          </nav>

          {/* Waitlist */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-neutral-100">Join Waitlist</h4>
            <p className="mb-4 text-sm text-neutral-300">Be the first to know when FlipIt launches.</p>
            <form className="flex flex-col gap-3 sm:flex-row" onSubmit={(e) => e.preventDefault()}>
              {/* <input
                type="email"
                placeholder="Your email"
                className="w-full rounded-lg bg-neutral-800 px-4 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required
              /> */}
              <Button
                asChild
                type="submit"
                className="rounded-lg bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-4 py-2 text-sm font-medium text-white shadow-md shadow-fuchsia-500/20 hover:to-fuchsia-600"
              >
                <Link to="/get-started" className="flex items-center gap-2">
                  Join&nbsp;Now
                </Link>
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-16 border-t border-white/10 pt-8 text-center text-xs text-neutral-500">
          <p>&copy; {new Date().getFullYear()} FlipIt. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
