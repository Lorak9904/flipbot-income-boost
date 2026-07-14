import { useEffect } from 'react';
import { HeroCTA } from '@/components/ui/button-presets';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import ConnectAccountCard from '@/components/ConnectAccountCardCompact';
import { ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { usePostHog } from '@posthog/react';
import { SEOHead } from '@/components/SEOHead';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCurrentLanguage, getLocalizedPathForCurrentLanguage, getTranslations } from '@/components/language-utils';
import { connectAccountsTranslations } from './connect-accounts-translations';
import { AnimatedGradientBackground } from '@/components/AnimatedGradientBackground';
import { PLATFORM_LOGOS } from '@/lib/platform-logos';
import { fetchPlatformHealth, type PlatformHealthInfo } from '@/lib/api/platform-health';
import { captureActivationEvent } from '@/lib/analytics/activation';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 * i, duration: 0.6, ease: 'easeOut' },
  }),
};

interface ConnectedPlatformsState {
  facebook: boolean;
  olx: boolean;
  vinted: boolean;
  ebay: boolean;
  allegro: boolean;
  etsy: boolean;
  vinted_has_session: boolean;
  vinted_status_code: number | null;
  vinted_session_status: string | null;
  vinted_invalid_reason: string | null;
  olx_session_status: string | null;
  olx_invalid_reason: string | null;
  olx_accounts: PlatformHealthInfo['accounts'];
  olx_countries: PlatformHealthInfo['countries'];
  ebay_session_status: string | null;
  ebay_invalid_reason: string | null;
  allegro_session_status: string | null;
  allegro_invalid_reason: string | null;
  etsy_session_status: string | null;
  etsy_invalid_reason: string | null;
  etsy_app_configured: boolean | null;
  etsy_action_key: string | null;
  etsy_message: string | null;
  facebook_session_status: string | null;
}

interface PlatformHealthCheckPayload {
  platforms?: Record<string, PlatformHealthInfo>;
}

const ConnectAccountsPage = () => {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const posthog = usePostHog();
  const t = getTranslations(connectAccountsTranslations);

  const fetchConnectedPlatforms = async (): Promise<ConnectedPlatformsState> => {
    const data = (await fetchPlatformHealth()) as PlatformHealthCheckPayload;
    const platforms = data?.platforms || {};
    const vintedInfo = platforms.vinted || {};
    const olxInfo = platforms.olx || {};
    const ebayInfo = platforms.ebay || {};
    const allegroInfo = platforms.allegro || {};
    const etsyInfo = platforms.etsy || {};
    const facebookInfo = platforms.facebook || {};

    return {
      facebook: !!facebookInfo.stored,
      olx: !!olxInfo.stored,
      vinted: !!vintedInfo.stored,
      ebay: !!ebayInfo.stored,
      allegro: !!allegroInfo.stored,
      etsy: !!etsyInfo.stored && etsyInfo.action_key !== 'integration_pending',
      vinted_has_session: !!vintedInfo.stored,
      vinted_status_code: typeof vintedInfo.status_code === 'number' ? vintedInfo.status_code : null,
      vinted_session_status: vintedInfo.status || null,
      vinted_invalid_reason: vintedInfo.invalid_reason || null,
      olx_session_status: olxInfo.status || null,
      olx_invalid_reason: olxInfo.reason || null,
      olx_accounts: Array.isArray(olxInfo.accounts) ? olxInfo.accounts : [],
      olx_countries: Array.isArray(olxInfo.countries) ? olxInfo.countries : [],
      ebay_session_status: ebayInfo.status || null,
      ebay_invalid_reason: ebayInfo.reason || null,
      allegro_session_status: allegroInfo.status || null,
      allegro_invalid_reason: allegroInfo.reason || null,
      etsy_session_status: etsyInfo.status || null,
      etsy_invalid_reason: etsyInfo.reason || null,
      etsy_app_configured:
        typeof etsyInfo.app_configured === 'boolean' ? etsyInfo.app_configured : null,
      etsy_action_key: etsyInfo.action_key || null,
      etsy_message: etsyInfo.message || null,
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
      navigate(getLocalizedPathForCurrentLanguage('/login'));
      return;
    }
    if (!!user && isAuthenticated === false) {
      toast({
        title: t.toastAuthRequiredTitle,
        description: t.toastAuthRequiredDescription,
        variant: "destructive",
      });
      navigate(getLocalizedPathForCurrentLanguage('/login'));
    }
  }, [
    isAuthenticated,
    navigate,
    toast,
    user,
    t.toastAuthRequiredDescription,
    t.toastAuthRequiredTitle,
  ]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const platform = params.get("platform");
    const status = params.get("status");
    const reconnect = params.get("reconnect");
    const message = params.get("message");
    const country = params.get("country");
    
    if (status === "connected" && platform) {
      captureActivationEvent(posthog, 'account_connected', {
        platform,
        country: country || null,
      });
      const successToastMap: Record<string, { title: string; description: string }> = {
        olx: {
          title: t.toastOlxConnectedTitle,
          description: t.toastOlxConnectedDescription,
        },
        ebay: {
          title: t.toastEbayConnectedTitle,
          description: t.toastEbayConnectedDescription,
        },
        allegro: {
          title: t.toastAllegroConnectedTitle,
          description: t.toastAllegroConnectedDescription,
        },
        etsy: {
          title: t.toastEtsyConnectedTitle,
          description: t.toastEtsyConnectedDescription,
        },
      };
      const toastConfig = successToastMap[platform];
      if (toastConfig) {
        toast({
          title: toastConfig.title,
          description:
            platform === 'olx' && country
              ? `${toastConfig.description} (${country})`
              : toastConfig.description,
          variant: "default",
        });
      }
      // Immediately refetch to reflect status without manual refresh
      refetch();
      window.history.replaceState({}, document.title, location.pathname);
    }
    
    // Handle reconnect requests (expired token)
    if (reconnect) {
      const reconnectToastMap: Record<string, { title: string; description: string }> = {
        olx: {
          title: t.toastOlxReconnectTitle,
          description: t.toastOlxReconnectDescription,
        },
        ebay: {
          title: t.toastEbayReconnectTitle,
          description: t.toastEbayReconnectDescription,
        },
        allegro: {
          title: t.toastAllegroReconnectTitle,
          description: t.toastAllegroReconnectDescription,
        },
        etsy: {
          title: t.toastEtsyReconnectTitle,
          description: t.toastEtsyReconnectDescription,
        },
      };
      const toastConfig = reconnectToastMap[reconnect];
      if (toastConfig) {
        toast({
          title: toastConfig.title,
          description: message || toastConfig.description,
          variant: "destructive",
        });
      }
      // Clear URL params but keep user on page to reconnect
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [
    location,
    toast,
    refetch,
    t.toastAllegroConnectedDescription,
    t.toastAllegroConnectedTitle,
    t.toastAllegroReconnectDescription,
    t.toastAllegroReconnectTitle,
    t.toastEbayConnectedDescription,
    t.toastEbayConnectedTitle,
    t.toastEbayReconnectDescription,
    t.toastEbayReconnectTitle,
    t.toastEtsyConnectedDescription,
    t.toastEtsyConnectedTitle,
    t.toastEtsyReconnectDescription,
    t.toastEtsyReconnectTitle,
    t.toastOlxConnectedDescription,
    t.toastOlxConnectedTitle,
    t.toastOlxReconnectDescription,
    t.toastOlxReconnectTitle,
    posthog,
  ]);

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
          language={getCurrentLanguage()}
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
        language={getCurrentLanguage()}
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <ConnectAccountCard
              key="facebook-card"
              platform="facebook"
              platformName={t.platformFacebook}
              logoSrc={PLATFORM_LOGOS.facebook}
              isConnected={!!connectedPlatforms?.facebook}
              sessionStatus={connectedPlatforms?.facebook_session_status}
              onConnected={handleAccountConnected}
            />
            <ConnectAccountCard
              key="olx-card"
              platform="olx"
              platformName={t.platformOLX}
              logoSrc={PLATFORM_LOGOS.olx}
              isConnected={!!connectedPlatforms?.olx}
              sessionStatus={connectedPlatforms?.olx_session_status}
              invalidReason={connectedPlatforms?.olx_invalid_reason}
              olxAccounts={connectedPlatforms?.olx_accounts || []}
              olxCountries={connectedPlatforms?.olx_countries || []}
              onConnected={handleAccountConnected}
            />
            <ConnectAccountCard
              key="vinted-card"
              platform="vinted"
              platformName={t.platformVinted}
              logoSrc={PLATFORM_LOGOS.vinted}
              isConnected={!!connectedPlatforms?.vinted}
              onConnected={handleAccountConnected}
              sessionStatus={connectedPlatforms?.vinted_session_status}
              invalidReason={connectedPlatforms?.vinted_invalid_reason}
            />
            <ConnectAccountCard
              key="ebay-card"
              platform="ebay"
              platformName={t.platformEbay}
              logoSrc={PLATFORM_LOGOS.ebay}
              isConnected={!!connectedPlatforms?.ebay}
              sessionStatus={connectedPlatforms?.ebay_session_status}
              invalidReason={connectedPlatforms?.ebay_invalid_reason}
              onConnected={handleAccountConnected}
            />
            <ConnectAccountCard
              key="allegro-card"
              platform="allegro"
              platformName={t.platformAllegro}
              logoSrc={PLATFORM_LOGOS.allegro}
              isConnected={!!connectedPlatforms?.allegro}
              sessionStatus={connectedPlatforms?.allegro_session_status}
              invalidReason={connectedPlatforms?.allegro_invalid_reason}
              onConnected={handleAccountConnected}
            />
            <ConnectAccountCard
              key="etsy-card"
              platform="etsy"
              platformName={t.platformEtsy}
              logoSrc={PLATFORM_LOGOS.etsy}
              isConnected={!!connectedPlatforms?.etsy}
              sessionStatus={connectedPlatforms?.etsy_session_status}
              invalidReason={connectedPlatforms?.etsy_invalid_reason}
              appConfigured={connectedPlatforms?.etsy_app_configured}
              actionKey={connectedPlatforms?.etsy_action_key}
              pendingMessage={connectedPlatforms?.etsy_message}
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
                !!connectedPlatforms.ebay ||
                !!connectedPlatforms.allegro ||
                !!connectedPlatforms.etsy)
                ? t.ctaConnectedMessage
                : t.ctaNotConnectedMessage}
            </p>
            <HeroCTA asChild>
              <Link to={getLocalizedPathForCurrentLanguage('/')}>
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
