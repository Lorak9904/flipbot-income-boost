
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { NavbarLogin } from '@/components/ui/button-presets';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, User, Settings, LogOut, Home, Package, BarChart3, MessageCircle, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCredits } from '@/hooks/useCredits';
import { getCreditsHealthStatus } from '@/lib/api/credits';
import {
  getCurrentLanguage,
  getLocalizedPathForLanguage,
  getTranslations,
} from './language-utils';
import { userMenuTranslations } from './user-menu-translations';

const UserMenu = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: credits } = useCredits();
  const t = getTranslations(userMenuTranslations);
  const language = getCurrentLanguage();
  const localized = (path: string) => getLocalizedPathForLanguage(path, language);

  const handleLogout = () => {
    logout();
    setOpen(false);
    toast({
      title: t.loggedOutTitle,
      description: t.loggedOutDescription,
    });
    navigate(localized('/'));
  };

  if (!isAuthenticated) {
    return (
      <NavbarLogin asChild>
        <Link to={localized('/login')}>
          <LogIn className="mr-2 h-4 w-4" />
          {t.login}
        </Link>
      </NavbarLogin>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="h-10 rounded-full px-3 flex items-center gap-2 text-black border-white/20 hover:bg-white/10"
        >
          {user?.avatar ? (
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-6 h-6 rounded-full object-cover"
            />
          ) : (
            <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-white text-xs">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="hidden sm:inline">{user?.name?.split(' ')[0]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex items-center justify-start gap-2 p-2">
          {user?.avatar ? (
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        
        {/* Credits quick glance */}
        {credits && (
          <>
            <div className="px-2 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm font-medium">{t.publishing}</span>
                </div>
                <span className={`text-sm font-bold ${
                  credits.publish_limit === null 
                    ? 'text-purple-400' 
                    : getCreditsHealthStatus(credits.publish_remaining, credits.publish_limit) === 'healthy'
                      ? 'text-cyan-400'
                      : getCreditsHealthStatus(credits.publish_remaining, credits.publish_limit) === 'warning'
                        ? 'text-yellow-400'
                        : 'text-red-400'
                }`}>
                  {credits.publish_limit === null 
                    ? '∞' 
                    : `${credits.publish_remaining}/${credits.publish_limit}`
                  }
                </span>
              </div>
              {credits.image_limit !== null && (
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">{t.images}</span>
                  <span className="text-xs font-medium text-fuchsia-400">
                    {credits.image_total_remaining === null || credits.image_remaining === null
                      ? '∞'
                      : (credits.image_addon_remaining || 0) > 0
                        ? `${credits.image_total_remaining ?? credits.image_remaining} ${t.total}`
                        : `${credits.image_total_remaining ?? credits.image_remaining}/${credits.image_included_limit ?? credits.image_limit}`
                    }
                  </span>
                </div>
              )}
            </div>
            <DropdownMenuSeparator />
          </>
        )}
        
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link to={localized('/')}>
              <Home className="mr-2 h-4 w-4" />
              <span>{t.dashboard}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to={localized('/connect-accounts')}>
              <Package className="mr-2 h-4 w-4" />
              <span>{t.connectedAccounts}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to={localized('/user/statistics')}>
              <BarChart3 className="mr-2 h-4 w-4" />
              <span>{t.statistics}</span>
            </Link>
          </DropdownMenuItem>
          {/* <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem> */}
          <DropdownMenuItem asChild>
            <Link to={localized('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>{t.settings}</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleLogout}
          className="text-red-500 focus:text-red-500"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t.logout}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
