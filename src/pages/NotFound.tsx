import { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { HeroCTA } from '@/components/ui/button-presets';
import { getCurrentLanguage, getLocalizedPathForLanguage } from '@/components/language-utils';
import { SEOHead } from '@/components/SEOHead';

const NotFound = () => {
  const location = useLocation();
  const language = getCurrentLanguage();
  const copy = language === 'pl'
    ? { title: 'Nie znaleziono strony', description: 'Ta strona nie istnieje albo została przeniesiona.', home: 'Wróć na stronę główną' }
    : { title: 'Page not found', description: 'This page does not exist or has been moved.', home: 'Return home' };

  useEffect(() => {
    console.error('404 Error: attempted route →', location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-neutral-950 text-white">
      <SEOHead title={`${copy.title} | FlipIt`} description={copy.description} language={language} robots="noindex, follow" />
      {/* -------------------------------------------------- */}
      {/* GLOBAL RADIAL BLOBS (same palette as HomePage)    */}
      {/* -------------------------------------------------- */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[10%] -top-24 h-[45rem] w-[45rem] rounded-full bg-fuchsia-600 opacity-30 blur-3xl" />
        <div className="absolute right-[5%] top-[25%] h-[35rem] w-[35rem] rounded-full bg-cyan-500 opacity-20 blur-3xl" />
      </div>

      <h1 className="mb-4 text-6xl font-extrabold tracking-tight text-cyan-400">404</h1>
      <p className="mb-4 text-2xl font-semibold">{copy.title}</p>
      <p className="mb-8 max-w-md text-center text-neutral-300">
        {copy.description}
      </p>
      <HeroCTA asChild>
        <Link to={getLocalizedPathForLanguage('/', language)}>{copy.home}</Link>
      </HeroCTA>
    </div>
  );
};

export default NotFound;
