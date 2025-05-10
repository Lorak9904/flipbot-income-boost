
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

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
    return location.pathname === path ? 'text-flipit-teal font-medium' : 'text-gray-600 hover:text-flipit-teal';
  };

  return (
    <nav className="py-4 border-b border-gray-100 bg-gradient-immersive text-white sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-flipit-teal to-flipit-teal-light flex items-center justify-center text-white font-bold">
            FI
          </div>
          <span className="font-heading font-semibold text-xl">FlipIt</span>
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

        <div className="hidden md:block">
          <Button asChild variant="accent" rounded="xl" size="default" className="animate-hover">
            <Link to="/get-started">Get Started</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={toggleMenu}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-flipit-dark/90 backdrop-blur-md shadow-lg z-50 animate-scale-in">
          <div className="container mx-auto py-4 flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`${isActive(item.path)} py-2 transition-colors text-white`}
                onClick={toggleMenu}
              >
                {item.name}
              </Link>
            ))}
            <Button asChild variant="accent" rounded="xl" className="mt-2">
              <Link to="/get-started" onClick={toggleMenu}>Get Started</Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
