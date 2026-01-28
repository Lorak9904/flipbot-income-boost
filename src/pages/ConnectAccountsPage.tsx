import { useEffect } from 'react';
import { HeroCTA } from '@/components/ui/button-presets';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import ConnectAccountCard from '@/components/ConnectAccountCardCompact';
import { CheckCircle, ArrowRight, Lock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { ConnectOlxButton } from '@/pages/ConnectOlxButton';
import { ConnectEbayButton } from '@/pages/ConnectEbayButton';
import { useToast } from '@/hooks/use-toast';
import { SEOHead } from '@/components/SEOHead';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getTranslations } from '@/components/language-utils';
import { connectAccountsTranslations } from './connect-accounts-translations';
import { AnimatedGradientBackground } from '@/components/AnimatedGradientBackground';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 * i, duration: 0.6, ease: 'easeOut' },
  }),
};


const ConnectAccountsPage = () => {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const t = getTranslations(connectAccountsTranslations);

  const fetchConnectedPlatforms = async (): Promise<Record<string, any>> => {
    const token = localStorage.getItem('flipit_token');
    const response = await fetch("/api/platforms/health-check/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('unauthorized');
      }
      throw new Error("Failed to fetch platform health");
    }

    const data = await response.json();
    const platforms = data?.platforms || {};
    const vintedInfo = platforms.vinted || {};
    const olxInfo = platforms.olx || {};
    const ebayInfo = platforms.ebay || {};
    const facebookInfo = platforms.facebook || {};

    return {
      facebook: !!facebookInfo.stored,
      olx: !!olxInfo.stored,
      vinted: !!vintedInfo.stored,
      ebay: !!ebayInfo.stored,
      vinted_has_session: !!vintedInfo.stored,
      vinted_status_code: typeof vintedInfo.status_code === 'number' ? vintedInfo.status_code : null,
      vinted_session_status: vintedInfo.status || null,
      vinted_invalid_reason: vintedInfo.invalid_reason || null,
      olx_session_status: olxInfo.status || null,
      olx_invalid_reason: olxInfo.reason || null,
      ebay_session_status: ebayInfo.status || null,
      ebay_invalid_reason: ebayInfo.reason || null,
      facebook_session_status: facebookInfo.status || null,
    };
  };

  const {
    data: connectedPlatforms,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['connected-platforms'],
    queryFn: fetchConnectedPlatforms,
    enabled: !!localStorage.getItem('flipit_token') && !!isAuthenticated,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  useEffect(() => {
    const token = localStorage.getItem('flipit_token');
    if (!token) {
      toast({
        title: t.toastAuthRequiredTitle,
        description: t.toastAuthRequiredDescription,
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    if (!!user && isAuthenticated === false) {
      toast({
        title: t.toastAuthRequiredTitle,
        description: t.toastAuthRequiredDescription,
        variant: "destructive",
      });
      navigate('/login');
    }
  }, [isAuthenticated, navigate, toast, user]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const platform = params.get("platform");
    const status = params.get("status");
    const reconnect = params.get("reconnect");
    const message = params.get("message");
    
    if (platform === "olx" && status === "connected") {
      toast({
        title: t.toastOlxConnectedTitle,
        description: t.toastOlxConnectedDescription,
        variant: "default",
      });
      // Immediately refetch to reflect status without manual refresh
      refetch();
      window.history.replaceState({}, document.title, location.pathname);
    }
    
    // Handle reconnect requests (expired token)
    if (reconnect === "olx") {
      toast({
        title: t.toastOlxReconnectTitle,
        description: message || t.toastOlxReconnectDescription,
        variant: "destructive",
      });
      // Clear URL params but keep user on page to reconnect
      window.history.replaceState({}, document.title, location.pathname);
    }

    if (reconnect === "ebay") {
      toast({
        title: t.toastEbayReconnectTitle,
        description: message || t.toastEbayReconnectDescription,
        variant: "destructive",
      });
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location, toast, refetch]);

  const handleAccountConnected = () => {
    // Ensure page status syncs with backend
    queryClient.invalidateQueries({ queryKey: ['connected-platforms'] });
  };

  if (isLoading || !connectedPlatforms) {
    return (
      <div className="relative min-h-screen text-white overflow-hidden">
        <SEOHead
          title={t.pageTitle}
          description={t.pageDescription}
          canonicalUrl="https://myflipit.live/connect-accounts"
          robots="noindex, nofollow"
        />
        <AnimatedGradientBackground />

        <div className="container mx-auto min-h-[70vh] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-cyan-400" />
            <p className="text-xl text-neutral-300">{t.loadingTitle}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      <SEOHead
        title={t.pageTitle}
        description={t.pageDescription}
        canonicalUrl="https://myflipit.live/connect-accounts"
        robots="noindex, nofollow"
      />
      <AnimatedGradientBackground />

      {/* Content */}
      <div className="container mx-auto py-12 relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="max-w-4xl mx-auto"
        >
          <div className="mb-8 text-center">
            <motion.h1 
              variants={fadeUp}
              className="text-3xl md:text-4xl font-bold mb-3"
            >
              {t.heroTitle}
            </motion.h1>
            <motion.p 
              variants={fadeUp}
              custom={1}
              className="text-neutral-300 text-lg max-w-2xl mx-auto"
            >
              {t.heroDescription}
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
            <ConnectAccountCard
              key="facebook-card"
              platform="facebook"
              platformName={t.platformFacebook}
              logoSrc="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/2021_Facebook_icon.svg/2048px-2021_Facebook_icon.svg.png"
              isConnected={!!connectedPlatforms?.facebook}
              sessionStatus={connectedPlatforms?.facebook_session_status}
              onConnected={handleAccountConnected}
            />
            <ConnectAccountCard
              key="olx-card"
              platform="olx"
              platformName={t.platformOLX}
              logoSrc="https://images.seeklogo.com/logo-png/39/1/olx-logo-png_seeklogo-390322.png"
              isConnected={!!connectedPlatforms?.olx}
              sessionStatus={connectedPlatforms?.olx_session_status}
              invalidReason={connectedPlatforms?.olx_invalid_reason}
              onConnected={handleAccountConnected}
            />
            <ConnectAccountCard
              key="vinted-card"
              platform="vinted"
              platformName={t.platformVinted}
              logoSrc="https://upload.wikimedia.org/wikipedia/commons/2/29/Vinted_logo.png"
              isConnected={!!connectedPlatforms?.vinted}
              onConnected={handleAccountConnected}
              sessionStatus={connectedPlatforms?.vinted_session_status}
              invalidReason={connectedPlatforms?.vinted_invalid_reason}
            />
            <ConnectAccountCard
              key="ebay-card"
              platform="ebay"
              platformName={t.platformEbay}
              logoSrc="https://upload.wikimedia.org/wikipedia/commons/1/1b/EBay_logo.svg"
              isConnected={!!connectedPlatforms?.ebay}
              sessionStatus={connectedPlatforms?.ebay_session_status}
              invalidReason={connectedPlatforms?.ebay_invalid_reason}
              onConnected={handleAccountConnected}
            />
          </div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mt-12 text-center"
          >
            <p className="text-neutral-400 mb-6">
              {connectedPlatforms &&
              (!!connectedPlatforms.facebook ||
                !!connectedPlatforms.olx ||
                !!connectedPlatforms.vinted ||
                !!connectedPlatforms.ebay)
                ? t.ctaConnectedMessage
                : t.ctaNotConnectedMessage}
            </p>
            <HeroCTA asChild>
              <Link to="/">
                {t.ctaDashboardButton} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </HeroCTA>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ConnectAccountsPage;
