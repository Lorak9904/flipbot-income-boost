import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getCurrentLanguage, getLocalizedPathForLanguage } from './language-utils';

const RequireAuth = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    const returnTo = `${location.pathname}${location.search}`;
    const loginPath = getLocalizedPathForLanguage('/login', getCurrentLanguage());
    return <Navigate to={`${loginPath}?returnTo=${encodeURIComponent(returnTo)}`} replace />;
  }

  return <Outlet />;
};

export default RequireAuth;
