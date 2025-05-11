
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import UserMenu from './UserMenu';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Success Stories', path: '/success-stories' },
    { name: 'Features', path: '/features' },
    { name: 'FAQ', path: '/faq' },
    { name: 'Connect Accounts', path: '/connect-accounts' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path ? 'text-teal-400 font-medium' : 'text-gray-300 hover:text-teal-400';
  };

  return (
    <nav className="py-4 border-b border-slate-800 bg-slate-900 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-500 to-green-400 flex items-center justify-center text-white font-bold">
            FI
          </div>
          <span className="font-heading font-semibold text-xl text-white">FlipIt</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`${isActive(item.path)} transition-colors`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <UserMenu />
          <Button asChild variant="accent" rounded="xl" size="default" className="animate-hover">
            <Link to="/get-started">Get Started</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-white" onClick={toggleMenu}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-slate-800 shadow-lg z-50 animate-scale-in">
          <div className="container mx-auto py-4 flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`${isActive(item.path)} py-2 transition-colors`}
                onClick={toggleMenu}
              >
                {item.name}
              </Link>
            ))}
            <div className="flex flex-col gap-3 pt-2">
              <UserMenu />
              <Button asChild variant="accent" rounded="xl">
                <Link to="/get-started" onClick={toggleMenu}>Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
