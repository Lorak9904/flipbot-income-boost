import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { GhostIconButton, SecondaryAction } from '@/components/ui/button-presets';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Check,
  AlertCircle,
  Circle,
  Clock,
  XCircle,
  Settings,
  MoreVertical,
  LogOut,
  Link as LinkIcon,
  Loader2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { getTranslations } from '@/components/language-utils';
import { connectCardTranslations } from './connect-card-translations';
import { useNavigate } from 'react-router-dom';
import ConnectPlatformModal from './ConnectPlatformModal';
import { getEbayConnectUrl } from '@/lib/api/ebay';

interface ConnectAccountCardProps {
  platform: 'facebook' | 'olx' | 'vinted' | 'ebay';
  platformName: string;
  logoSrc: string;
  onConnected?: () => void;
  isConnected: boolean;
  sessionStatus?: 'valid' | 'expired' | 'invalid' | null;
  invalidReason?: string | null;
}

type ConnectionStatus = 'connected' | 'not-connected' | 'expired' | 'invalid';

const getConnectionStatus = (
  isConnected: boolean,
  sessionStatus?: 'valid' | 'expired' | 'invalid' | null
): ConnectionStatus => {
  if (!isConnected) return 'not-connected';
  if (sessionStatus === 'expired') return 'expired';
  if (sessionStatus === 'invalid') return 'invalid';
  return 'connected';
};

const statusConfig: Record<
  ConnectionStatus,
  {
    icon: React.ElementType;
    colorClass: string;
    bgClass: string;
    borderClass: string;
  }
> = {
  connected: {
    icon: Check,
    colorClass: 'text-emerald-400',
    bgClass: 'bg-emerald-500/20',
    borderClass: 'border-emerald-500/30',
  },
  'not-connected': {
    icon: Circle,
    colorClass: 'text-slate-400',
    bgClass: 'bg-slate-500/20',
    borderClass: 'border-slate-500/30',
  },
  expired: {
    icon: Clock,
    colorClass: 'text-amber-400',
    bgClass: 'bg-amber-500/20',
    borderClass: 'border-amber-500/30',
  },
  invalid: {
    icon: XCircle,
    colorClass: 'text-red-400',
    bgClass: 'bg-red-500/20',
    borderClass: 'border-red-500/30',
  },
};

const ConnectAccountCard = ({
  platform,
  platformName,
  logoSrc,
  isConnected: initialConnected,
  onConnected,
  sessionStatus,
  invalidReason,
}: ConnectAccountCardProps) => {
  const [isConnected, setIsConnected] = useState(initialConnected);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [isConnectingEbay, setIsConnectingEbay] = useState(false);
  const t = getTranslations(connectCardTranslations);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Keep internal state in sync with prop updates
  useEffect(() => {
    setIsConnected(initialConnected);
  }, [initialConnected]);

  const tr = (key: string, replacements?: Record<string, string>) => {
    let text = t[key] || key;
    if (replacements) {
      Object.entries(replacements).forEach(([placeholder, value]) => {
        text = text.replace(`{${placeholder}}`, value);
      });
    }
    return text;
  };

  const connectionStatus = getConnectionStatus(isConnected, sessionStatus);
  const config = statusConfig[connectionStatus];
  const StatusIcon = config.icon;

  // Handle eBay OAuth connection
  const handleEbayConnect = async () => {
    const token = localStorage.getItem('flipit_token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    
    setIsConnectingEbay(true);
    try {
      const data = await getEbayConnectUrl('EBAY_PL');
      window.location.href = data.auth_url;
    } catch (error) {
      console.error('Failed to get eBay connect URL:', error);
      toast.error('Failed to connect to eBay. Please try again.');
      setIsConnectingEbay(false);
    }
  };

  // Handle OLX OAuth connection
  const handleOlxConnect = async () => {
    const token = localStorage.getItem('flipit_token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    
    setIsConnectingEbay(true); // Reuse loading state
    try {
      const { getOlxConnectUrl } = await import('@/lib/api/olx');
      const data = await getOlxConnectUrl();
      window.location.href = data.auth_url;
    } catch (error) {
      console.error('Failed to get OLX connect URL:', error);
      toast.error('Failed to connect to OLX. Please try again.');
      setIsConnectingEbay(false);
    }
  };

  // Handle platform-specific connection
  const handleConnect = () => {
    if (platform === 'ebay') {
      handleEbayConnect();
    } else if (platform === 'olx') {
      handleOlxConnect();
    } else {
      setShowConnectModal(true);
    }
  };

  const handleDisconnect = async () => {
    try {
      const token = localStorage.getItem('flipit_token');
      const response = await fetch(`/api/delete-session/${platform}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to disconnect');
      setIsConnected(false);
      toast.success(tr('toastDisconnectedSuccess', { platform: platformName }));
      if (onConnected) onConnected();
    } catch (error) {
      toast.error(t.toastDisconnectedError);
    }
  };

  const handleConnectionSuccess = () => {
    setIsConnected(true);
    if (onConnected) onConnected();
  };

  // Get tooltip text based on status
  const getTooltipText = () => {
    switch (connectionStatus) {
      case 'connected':
        return tr('statusTooltipConnected', { platform: platformName });
      case 'not-connected':
        return t.statusTooltipNotConnected;
      case 'expired':
        return t.statusTooltipExpired;
      case 'invalid':
        return invalidReason || t.statusTooltipInvalid;
      default:
        return '';
    }
  };

  // Require authentication
  if (!user) {
    return (
      <Card className="h-[140px] border border-slate-700/80 bg-slate-800/60">
        <CardContent className="p-4 h-full flex items-center justify-center">
          <p className="text-sm text-red-400 text-center">
            {tr('authRequiredMessage', { platform: platformName })}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <motion.div
        whileHover={{ y: -3, scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="w-full"
      >
        <Card className="h-[140px] overflow-hidden border border-slate-700/80 bg-slate-800/60 hover:border-slate-600/80 transition-colors">
          <CardContent className="p-4 h-full flex flex-col">
            {/* Top Row: Logo, Name, Status */}
            <div className="flex items-center justify-between gap-3">
              {/* Platform Logo & Name */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img
                    src={logoSrc}
                    alt={`${platformName} logo`}
                    className="h-6 w-auto"
                  />
                </div>
                <h3 className="font-semibold text-base text-white truncate">
                  {platformName}
                </h3>
              </div>

              {/* Status Icon with Tooltip */}
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full ${config.bgClass} ${config.borderClass} border cursor-help flex-shrink-0`}
                    >
                      <StatusIcon className={`w-4 h-4 ${config.colorClass}`} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    className="bg-slate-800 border-slate-700 text-slate-200 max-w-xs"
                  >
                    <p className="text-sm">{getTooltipText()}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Bottom Row: Actions */}
            <div className="flex items-center justify-between gap-2">
              {/* Primary Action */}
              {isConnected ? (
                <SecondaryAction
                  size="sm"
                  className="px-3 py-2 text-xs"
                  onClick={() => navigate(`/platform-settings/${platform}`)}
                >
                  <Settings className="w-3.5 h-3.5 mr-1.5" />
                  {t.settingsButton}
                </SecondaryAction>
              ) : (
                <SecondaryAction
                  size="sm"
                  className="px-3 py-2 text-xs text-teal-200"
                  onClick={handleConnect}
                  disabled={isConnectingEbay && platform === 'ebay'}
                >
                  {isConnectingEbay && platform === 'ebay' ? (
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <LinkIcon className="w-3.5 h-3.5 mr-1.5" />
                  )}
                  {isConnectingEbay && platform === 'ebay' ? 'Connecting...' : (t.connectButton || 'Connect')}
                </SecondaryAction>
              )}

              {/* Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <GhostIconButton sizeVariant="lg" className="p-0">
                    <MoreVertical className="w-4 h-4" />
                  </GhostIconButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-slate-800 border-slate-700"
                >
                  {isConnected ? (
                    <>
                      <DropdownMenuItem
                        className="text-slate-200 hover:text-white hover:bg-slate-700 cursor-pointer"
                        onClick={() => navigate(`/platform-settings/${platform}`)}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        {t.settingsButton}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-slate-200 hover:text-white hover:bg-slate-700 cursor-pointer"
                        onClick={handleConnect}
                        disabled={isConnectingEbay && platform === 'ebay'}
                      >
                        <LinkIcon className="w-4 h-4 mr-2" />
                        {t.reconnectButton || 'Reconnect'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
                        onClick={handleDisconnect}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        {t.disconnectButton}
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem
                      className="text-teal-400 hover:text-teal-300 hover:bg-teal-500/10 cursor-pointer"
                      onClick={handleConnect}
                      disabled={isConnectingEbay && platform === 'ebay'}
                    >
                      <LinkIcon className="w-4 h-4 mr-2" />
                      {t.connectButton || 'Connect'}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Connect Modal - Only for cookie-based platforms (Facebook, Vinted) */}
      {(platform === 'facebook' || platform === 'vinted') && (
        <ConnectPlatformModal
          platform={platform}
          platformName={platformName}
          isOpen={showConnectModal}
          onClose={() => setShowConnectModal(false)}
          onSuccess={handleConnectionSuccess}
        />
      )}
    </>
  );
};

export default ConnectAccountCard;
