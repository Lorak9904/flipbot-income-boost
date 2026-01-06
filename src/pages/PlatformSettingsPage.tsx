import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SaveButton, BackButtonGhost, SyncButton } from '@/components/ui/button-presets';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, RefreshCw, DollarSign, MapPin } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { getTranslations } from '@/components/language-utils';
import { platformSettingsTranslations } from './platform-settings-translations';
import { AnimatedGradientBackground } from '@/components/AnimatedGradientBackground';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 * i, duration: 0.6, ease: 'easeOut' },
  }),
};

interface PlatformSettings {
  id?: number;
  platform: string;
  margin: string;
  surcharge: string;
  address_city: string;
  address_postal_code: string;
  address_country: string;
  address_street: string;
}

const PLATFORM_NAMES: Record<string, string> = {
  facebook: 'Facebook Marketplace',
  olx: 'OLX',
  vinted: 'Vinted',
};

const PlatformSettingsPage = () => {
  const { platform } = useParams<{ platform: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const t = getTranslations(platformSettingsTranslations);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  
  const [settings, setSettings] = useState<PlatformSettings>({
    platform: platform || '',
    margin: '1.0',
    surcharge: '0.00',
    address_city: '',
    address_postal_code: '',
    address_country: '',
    address_street: '',
  });

  // Validate platform param
  const validPlatforms = ['facebook', 'olx', 'vinted'];
  const isValidPlatform = platform && validPlatforms.includes(platform);
  const platformName = platform ? PLATFORM_NAMES[platform] || platform : '';

  // Load settings on mount
  useEffect(() => {
    if (!isValidPlatform) return;

    const loadSettings = async () => {
      try {
        const token = localStorage.getItem('flipit_token');
        if (!token) return;

        const response = await fetch(`/api/platforms/${platform}/settings/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSettings({
            platform: data.platform || platform || '',
            margin: String(data.margin || 1.0),
            surcharge: String(data.surcharge || 0),
            address_city: data.address_city || '',
            address_postal_code: data.address_postal_code || '',
            address_country: data.address_country || '',
            address_street: data.address_street || '',
          });
        }
      } catch (e) {
        console.error('Failed to load platform settings:', e);
        toast({
          title: t.toastErrorTitle,
          description: t.toastLoadError,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [platform, isValidPlatform]);

  // Redirect if invalid platform
  if (!isValidPlatform) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Platform</h1>
          <BackButtonGhost onClick={() => navigate('/connect-accounts')}>
            Back to Connected Accounts
          </BackButtonGhost>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('flipit_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/platforms/${platform}/settings/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          margin: parseFloat(settings.margin) || 1.0,
          surcharge: parseFloat(settings.surcharge) || 0,
          address_city: settings.address_city || null,
          address_postal_code: settings.address_postal_code || null,
          address_country: settings.address_country || null,
          address_street: settings.address_street || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to save settings');
      }

      toast({
        title: t.toastSettingsSavedTitle,
        description: t.toastSettingsSavedDescription.replace('{platform}', platformName),
      });
    } catch (e: any) {
      toast({
        title: t.toastErrorTitle,
        description: e.message || 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSyncAddress = async () => {
    setSyncing(true);
    try {
      const token = localStorage.getItem('flipit_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/platforms/${platform}/settings/sync-address/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to sync address');
      }

      const data = await response.json();
      setSettings(prev => ({
        ...prev,
        address_city: data.address_city || '',
        address_postal_code: data.address_postal_code || '',
        address_country: data.address_country || '',
        address_street: data.address_street || '',
      }));

      toast({
        title: t.toastSettingsSavedTitle,
        description: t.syncAddressSuccess,
      });
    } catch (e: any) {
      toast({
        title: t.toastErrorTitle,
        description: e.message || t.syncAddressError,
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <SEOHead
        title={`${platformName} Settings | FlipIt`}
        description={`Configure ${platformName} settings for FlipIt.`}
        canonicalUrl={`https://myflipit.live/platform-settings/${platform}`}
        robots="noindex, nofollow"
      />
      
      <AnimatedGradientBackground />

      <section className="relative py-28 text-center">
        <div className="container mx-auto px-4">
          <BackButtonGhost
            onClick={() => navigate('/connect-accounts')}
          >
            {t.backToConnectedAccounts}
          </BackButtonGhost>
          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            {platformName} <span className="text-cyan-400">{t.pageTitle}</span>
          </motion.h1>
          <motion.p custom={2} initial="hidden" animate="visible" variants={fadeUp} className="mx-auto mt-4 max-w-xl text-neutral-300">
            {t.pageDescription.replace('{platform}', platformName)}
          </motion.p>
        </div>
      </section>

      <section className="relative pb-32">
        <div className="container mx-auto max-w-3xl px-4">
          {/* Pricing Adjustments */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-12 rounded-2xl bg-neutral-900/50 p-8 backdrop-blur-sm ring-1 ring-cyan-400/20">
            <h2 className="mb-4 text-xl font-semibold flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-cyan-400" />
              {t.pricingTitle}
            </h2>
            <p className="text-neutral-300 text-sm mb-6">{t.pricingDescription}</p>
            <div className="space-y-6 md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
              <div className="space-y-2">
                <Label htmlFor="margin">{t.marginLabel}</Label>
                <Input
                  id="margin"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={settings.margin}
                  onChange={(e) => setSettings(prev => ({ ...prev, margin: e.target.value }))}
                  placeholder={t.marginPlaceholder}
                  className="bg-neutral-800"
                />
                <p className="text-xs text-neutral-400">{t.marginHelperText}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="surcharge">{t.surchargeLabel}</Label>
                <Input
                  id="surcharge"
                  type="number"
                  step="0.01"
                  value={settings.surcharge}
                  onChange={(e) => setSettings(prev => ({ ...prev, surcharge: e.target.value }))}
                  placeholder={t.surchargePlaceholder}
                  className="bg-neutral-800"
                />
                <p className="text-xs text-neutral-400">{t.surchargeHelperText}</p>
              </div>
            </div>
          </motion.div>

          {/* Address Override */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-12 rounded-2xl bg-neutral-900/50 p-8 backdrop-blur-sm ring-1 ring-cyan-400/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-cyan-400" />
                {t.addressTitle}
              </h2>
              <SyncButton
                onClick={handleSyncAddress}
                isLoading={syncing}
              >
                {t.syncAddressButton}
              </SyncButton>
            </div>
            <p className="text-neutral-300 text-sm mb-6">{t.addressDescription}</p>
            <div className="space-y-6 md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
              <div className="space-y-2">
                <Label htmlFor="addressCity">{t.addressCityLabel}</Label>
                <Input
                  id="addressCity"
                  value={settings.address_city}
                  onChange={(e) => setSettings(prev => ({ ...prev, address_city: e.target.value }))}
                  placeholder={t.addressCityPlaceholder}
                  className="bg-neutral-800"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addressPostalCode">{t.addressPostalCodeLabel}</Label>
                <Input
                  id="addressPostalCode"
                  value={settings.address_postal_code}
                  onChange={(e) => setSettings(prev => ({ ...prev, address_postal_code: e.target.value }))}
                  placeholder={t.addressPostalCodePlaceholder}
                  className="bg-neutral-800"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addressCountry">{t.addressCountryLabel}</Label>
                <Input
                  id="addressCountry"
                  value={settings.address_country}
                  onChange={(e) => setSettings(prev => ({ ...prev, address_country: e.target.value }))}
                  placeholder={t.addressCountryPlaceholder}
                  className="bg-neutral-800"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addressStreet">{t.addressStreetLabel}</Label>
                <Input
                  id="addressStreet"
                  value={settings.address_street}
                  onChange={(e) => setSettings(prev => ({ ...prev, address_street: e.target.value }))}
                  placeholder={t.addressStreetPlaceholder}
                  className="bg-neutral-800"
                />
              </div>
            </div>
          </motion.div>

          {/* Save Button */}
          <div className="text-center">
            <SaveButton
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? t.savingButton : t.saveButton}
            </SaveButton>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PlatformSettingsPage;
