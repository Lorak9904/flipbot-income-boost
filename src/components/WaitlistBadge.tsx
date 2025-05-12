
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

const WaitlistBadge = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return null; // Don't show the badge for authenticated users
  }

  return (
    <div className="fixed bottom-8 right-8 z-40">
      <Link 
        to="/login"
        className="group flex items-center gap-2 bg-gradient-to-r from-teal-500 to-green-400 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all"
      >
        <LogIn className="w-5 h-5" />
        <span className="font-medium">Log In / Sign Up</span>
        <span className="relative flex h-3 w-3 ml-1">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
      </Link>
    </div>
  );
};

export default WaitlistBadge;
