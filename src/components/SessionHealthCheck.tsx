import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getTranslations } from '@/components/language-utils';
import { connectAccountsTranslations } from '@/pages/connect-accounts-translations';

const HEALTH_CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours
const NOTIFY_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours
const LAST_CHECK_KEY = 'flipit_platform_health_check_at';

const buildNotifyKey = (platform: string) => `flipit_platform_health_notify_${platform}`;

type HealthStatus = 'valid' | 'expired' | 'invalid' | null | undefined;

type HealthPlatformInfo = {
  connected?: boolean;
  stored?: boolean;
  status?: HealthStatus;
  reason?: string | null;
  invalid_reason?: string | null;
};

type HealthCheckResponse = {
  checked_at?: string;
  platforms?: Record<string, HealthPlatformInfo>;
};

const shouldRunHealthCheck = (now: number, lastCheck: number) => {
  if (!lastCheck) return true;
  return now - lastCheck >= HEALTH_CHECK_INTERVAL_MS;
};

const shouldNotify = (now: number, lastNotified: number) => {
  if (!lastNotified) return true;
  return now - lastNotified >= NOTIFY_INTERVAL_MS;
};

export default function SessionHealthCheck() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const inFlightRef = useRef(false);
  const t = getTranslations(connectAccountsTranslations);

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;

    const token = localStorage.getItem('flipit_token');
    if (!token) return;

    const now = Date.now();
    const lastCheck = Number(localStorage.getItem(LAST_CHECK_KEY) || 0);
    if (!shouldRunHealthCheck(now, lastCheck)) return;
    if (inFlightRef.current) return;

    inFlightRef.current = true;

    const notifyPlatform = (platform: 'olx' | 'ebay' | 'allegro' | 'vinted', info?: HealthPlatformInfo) => {
      if (!info?.stored) return;

      const status = info.status;
      if (!status || status === 'valid') return;

      if (platform !== 'vinted' && status === 'expired') return;

      const lastNotified = Number(localStorage.getItem(buildNotifyKey(platform)) || 0);
      if (!shouldNotify(now, lastNotified)) return;

      if (platform === 'olx') {
        toast({
          title: t.toastOlxReconnectTitle,
          description: t.toastOlxReconnectDescription,
          variant: 'destructive',
        });
      }

      if (platform === 'ebay') {
        toast({
          title: t.toastEbayReconnectTitle,
          description: t.toastEbayReconnectDescription,
          variant: 'destructive',
        });
      }

      if (platform === 'allegro') {
        toast({
          title: t.toastAllegroReconnectTitle,
          description: t.toastAllegroReconnectDescription,
          variant: 'destructive',
        });
      }

      if (platform === 'vinted') {
        toast({
          title: t.toastVintedReconnectTitle,
          description: t.toastVintedReconnectDescription,
          variant: 'destructive',
        });
      }

      localStorage.setItem(buildNotifyKey(platform), String(now));
    };

    const runHealthCheck = async () => {
      try {
        const response = await fetch('/api/platforms/health-check/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as HealthCheckResponse;
        const platforms = data.platforms || {};

        notifyPlatform('olx', platforms.olx);
        notifyPlatform('ebay', platforms.ebay);
        notifyPlatform('allegro', platforms.allegro);
        notifyPlatform('vinted', platforms.vinted);

        localStorage.setItem(LAST_CHECK_KEY, String(now));
      } catch (error) {
        console.error('Platform health check failed:', error);
      } finally {
        inFlightRef.current = false;
      }
    };

    runHealthCheck();
  }, [isAuthenticated, isLoading, location.pathname, toast, t]);

  return null;
}
