import { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { HeroCTA } from '@/components/ui/button-presets';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error('404 Error: attempted route →', location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-neutral-950 text-white">
      {/* -------------------------------------------------- */}
      {/* GLOBAL RADIAL BLOBS (same palette as HomePage)    */}
      {/* -------------------------------------------------- */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[10%] -top-24 h-[45rem] w-[45rem] rounded-full bg-fuchsia-600 opacity-30 blur-3xl" />
        <div className="absolute right-[5%] top-[25%] h-[35rem] w-[35rem] rounded-full bg-cyan-500 opacity-20 blur-3xl" />
      </div>

      <h1 className="mb-4 text-6xl font-extrabold tracking-tight text-cyan-400">404</h1>
      <p className="mb-4 text-2xl font-semibold">Oops! Page not found.</p>
      <p className="mb-8 max-w-md text-center text-neutral-300">
        The page you’re looking for doesn’t exist or has been moved.
      </p>
      <HeroCTA asChild>
        <Link to="/">Return to Home</Link>
      </HeroCTA>
    </div>
  );
};

export default NotFound;
