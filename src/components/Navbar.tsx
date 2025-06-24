import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Globe } from 'lucide-react';
import UserMenu from './UserMenu';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { getTranslations, toggleLanguage } from './language-utils';
import { navbarTranslations } from './navbar-translations';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const t = getTranslations(navbarTranslations);

  const baseNavItems = [
    { name: t.howItWorks, path: '/how-it-works' },
  ];
  
  const navItems = isAuthenticated
  ? [...baseNavItems, 
    { name: t.addItem, path: '/add-item' },
    { name: t.connectAccounts, path: '/connect-accounts' },
    ]
    : baseNavItems;

  const isActive = (path: string) => location.pathname === path;

  const linkClass = (path: string) =>
    `relative px-2 py-1 text-sm transition-colors ${
      isActive(path)
        ? 'text-cyan-400 font-semibold'
        : 'text-neutral-300 hover:text-white'
    }`;

  return (
    <nav className="bg-neutral-950/95 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      {/* Subtle top glow for enhanced visual appeal */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent"></div>
      
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        {/* Enhanced logo with better gradient and shadow */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-white">
          <span className="bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent drop-shadow-sm">
            FlipIt
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={linkClass(item.path)}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Right side: Language toggle + Auth/User */}
        <div className="hidden md:flex items-center gap-2">
          {/* Language Toggle Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="text-neutral-300 hover:text-white hover:bg-neutral-800/50 flex items-center gap-1"
            title="Switch language / Zmień język"
          >
            <Globe className="h-4 w-4" />
            {t.languageToggle}
          </Button>
          
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <>
              <Button asChild variant="ghost" className="text-cyan-400 hover:bg-cyan-400/10">
                <Link to="/login">{t.login}</Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white hover:to-fuchsia-600 shadow-md shadow-fuchsia-500/20">
                <Link to="/login?register=1">{t.signup}</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu button - Enhanced styling */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-neutral-800/50 transition-colors backdrop-blur-sm"
          onClick={() => setIsOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-6 w-6 text-white" /> : <Menu className="h-6 w-6 text-white" />}
        </button>
      </div>

      {/* Mobile menu - Enhanced background */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-neutral-950/98 backdrop-blur-md border-t border-white/5"
          >
            <div className="flex flex-col gap-2 px-4 py-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={linkClass(item.path)}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile Language Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  toggleLanguage();
                  setIsOpen(false);
                }}
                className="text-neutral-300 hover:text-white hover:bg-neutral-800/50 flex items-center gap-2 justify-start w-full"
              >
                <Globe className="h-4 w-4" />
                {t.languageToggle}
              </Button>
              
              <div className="mt-4 flex flex-col gap-2">
                {isAuthenticated ? (
                  <UserMenu />
                ) : (
                  <>
                    <Button asChild variant="ghost" className="text-cyan-400 hover:bg-cyan-400/10 w-full">
                      <Link to="/login" onClick={() => setIsOpen(false)}>{t.login}</Link>
                    </Button>
                    <Button asChild className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white hover:to-fuchsia-600 shadow-md shadow-fuchsia-500/20 w-full">
                      <Link to="/login?register=1" onClick={() => setIsOpen(false)}>{t.signup}</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

