
import { Link } from 'react-router-dom';

const WaitlistBadge = () => {
  return (
    <div className="fixed bottom-8 right-8 z-40">
      <Link 
        to="/get-started"
        className="group flex items-center gap-2 bg-flipbot-orange text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <span>Join Waitlist</span>
      </Link>
    </div>
  );
};

export default WaitlistBadge;
