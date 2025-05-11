
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const WaitlistBadge = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return null; // Don't show the badge for authenticated users
  }

  return (
    <div className="fixed bottom-8 right-8 z-40">
      <Link 
        to="/login"
        className="group flex items-center gap-2 bg-gradient-to-r from-teal-500 to-green-400 text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <span>Log In / Sign Up</span>
      </Link>
    </div>
  );
};

export default WaitlistBadge;
