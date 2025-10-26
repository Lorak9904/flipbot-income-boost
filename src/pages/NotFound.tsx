import { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getTranslations } from '@/components/language-utils';
import { notFoundTranslations } from './notfound-translations';

const NotFound = () => {
  const location = useLocation();
  const t = getTranslations(notFoundTranslations);

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

      <h1 className="mb-4 text-6xl font-extrabold tracking-tight text-cyan-400">{t.title}</h1>
      <p className="mb-4 text-2xl font-semibold">{t.heading}</p>
      <p className="mb-8 max-w-md text-center text-neutral-300">
        {t.description}
      </p>
      <Button asChild size="lg" className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/20 hover:to-fuchsia-600">
        <Link to="/">{t.returnButton}</Link>
      </Button>
    </div>
  );
};

export default NotFound;
