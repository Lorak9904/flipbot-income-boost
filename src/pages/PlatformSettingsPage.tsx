import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AddItemButton, SaveButton, BackButtonGhost, SyncButton } from '@/components/ui/button-presets';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, MapPin, Plus } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { getTranslations } from '@/components/language-utils';
import { platformSettingsTranslations } from './platform-settings-translations';
import { AnimatedGradientBackground } from '@/components/AnimatedGradientBackground';
import {
  getEbayMarketplacePolicies,
  updateEbayMarketplacePolicy,
  type EbayMarketplacePolicy,
} from '@/lib/api/ebay-policies';
import { EBAY_MARKETPLACE_OPTIONS } from '@/lib/ebay-marketplaces';

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
  ebay_marketplace_id: string;
  ebay_payment_policy_id: string;
  ebay_return_policy_id: string;
  ebay_fulfillment_policy_id: string;
}

interface EbayMarketplacePolicyDraft {
  rowId: string;
  marketplace_id: string;
  payment_policy_id: string;
  return_policy_id: string;
  fulfillment_policy_id: string;
  saving?: boolean;
}

const PLATFORM_NAMES: Record<string, string> = {
  facebook: 'Facebook Marketplace',
  olx: 'OLX',
  vinted: 'Vinted',
  ebay: 'eBay',
  allegro: 'Allegro',
};

const PlatformSettingsPage = () => {
  const { platform } = useParams<{ platform: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const t = getTranslations(platformSettingsTranslations);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [policiesLoading, setPoliciesLoading] = useState(false);
  
  const [settings, setSettings] = useState<PlatformSettings>({
    platform: platform || '',
    margin: '1.0',
    surcharge: '0.00',
    address_city: '',
    address_postal_code: '',
    address_country: '',
    address_street: '',
    ebay_marketplace_id: '',
    ebay_payment_policy_id: '',
    ebay_return_policy_id: '',
    ebay_fulfillment_policy_id: '',
  });
  const [ebayPolicies, setEbayPolicies] = useState<EbayMarketplacePolicyDraft[]>([]);

  // Validate platform param
  const validPlatforms = ['facebook', 'olx', 'vinted', 'ebay', 'allegro'];
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
            ebay_marketplace_id: data.ebay_marketplace_id || '',
            ebay_payment_policy_id: data.ebay_payment_policy_id || '',
            ebay_return_policy_id: data.ebay_return_policy_id || '',
            ebay_fulfillment_policy_id: data.ebay_fulfillment_policy_id || '',
          });
        }

        if (platform === 'ebay') {
          setPoliciesLoading(true);
          const policies = await getEbayMarketplacePolicies();
          setEbayPolicies(
            policies.map((policy) => ({
              rowId: policy.marketplace_id,
              marketplace_id: policy.marketplace_id,
              payment_policy_id: policy.payment_policy_id || '',
              return_policy_id: policy.return_policy_id || '',
              fulfillment_policy_id: policy.fulfillment_policy_id || '',
            }))
          );
        }
      } catch (e) {
        console.error('Failed to load platform settings:', e);
        toast({
          title: t.toastErrorTitle,
          description: t.toastLoadError,
          variant: 'destructive',
        });
      } finally {
        setPoliciesLoading(false);
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

      const payload: Record<string, unknown> = {
        margin: parseFloat(settings.margin) || 1.0,
        surcharge: parseFloat(settings.surcharge) || 0,
        address_city: settings.address_city || null,
        address_postal_code: settings.address_postal_code || null,
        address_country: settings.address_country || null,
        address_street: settings.address_street || null,
      };

      if (platform === 'ebay') {
        payload.ebay_marketplace_id = settings.ebay_marketplace_id || null;
        payload.ebay_payment_policy_id = settings.ebay_payment_policy_id || null;
        payload.ebay_return_policy_id = settings.ebay_return_policy_id || null;
        payload.ebay_fulfillment_policy_id = settings.ebay_fulfillment_policy_id || null;
      }

      const response = await fetch(`/api/platforms/${platform}/settings/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
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

  const normalizeMarketplaceId = (value: string) => value.trim().toUpperCase();

  const handleAddMarketplacePolicy = () => {
    const newRow: EbayMarketplacePolicyDraft = {
      rowId: `new-${Date.now()}`,
      marketplace_id: '',
      payment_policy_id: '',
      return_policy_id: '',
      fulfillment_policy_id: '',
    };
    setEbayPolicies((prev) => [newRow, ...prev]);
  };

  const updatePolicyField = (rowId: string, field: keyof EbayMarketplacePolicyDraft, value: string) => {
    setEbayPolicies((prev) =>
      prev.map((policy) =>
        policy.rowId === rowId ? { ...policy, [field]: value } : policy
      )
    );
  };

  const handleSavePolicy = async (rowId: string) => {
    const policy = ebayPolicies.find((item) => item.rowId === rowId);
    if (!policy) return;

    const marketplaceId = normalizeMarketplaceId(policy.marketplace_id);
    if (!marketplaceId) {
      toast({
        title: t.toastErrorTitle,
        description: t.ebayMarketplaceRequired,
        variant: 'destructive',
      });
      return;
    }

    setEbayPolicies((prev) =>
      prev.map((item) => (item.rowId === rowId ? { ...item, saving: true } : item))
    );

    try {
      const payload: Partial<EbayMarketplacePolicy> = {
        payment_policy_id: policy.payment_policy_id.trim() || null,
        return_policy_id: policy.return_policy_id.trim() || null,
        fulfillment_policy_id: policy.fulfillment_policy_id.trim() || null,
      };
      const saved = await updateEbayMarketplacePolicy(marketplaceId, payload);
      setEbayPolicies((prev) =>
        prev.map((item) =>
          item.rowId === rowId
            ? {
                rowId: saved.marketplace_id,
                marketplace_id: saved.marketplace_id,
                payment_policy_id: saved.payment_policy_id || '',
                return_policy_id: saved.return_policy_id || '',
                fulfillment_policy_id: saved.fulfillment_policy_id || '',
                saving: false,
              }
            : item
        )
      );
      toast({
        title: t.toastSettingsSavedTitle,
        description: t.ebayPolicySaved.replace('{marketplace}', saved.marketplace_id),
      });
    } catch (e: any) {
      toast({
        title: t.toastErrorTitle,
        description: e.message || t.ebayPolicySaveError,
        variant: 'destructive',
      });
    } finally {
      setEbayPolicies((prev) =>
        prev.map((item) => (item.rowId === rowId ? { ...item, saving: false } : item))
      );
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

          {platform === 'ebay' && (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="mb-12 rounded-2xl bg-neutral-900/50 p-8 backdrop-blur-sm ring-1 ring-cyan-400/20"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold">{t.ebayPoliciesTitle}</h2>
                  <p className="text-neutral-300 text-sm mt-1">{t.ebayPoliciesDescription}</p>
                </div>
                <AddItemButton
                  type="button"
                  sizeVariant="md"
                  className="w-auto"
                  onClick={handleAddMarketplacePolicy}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t.ebayAddPolicy}
                </AddItemButton>
              </div>

              {policiesLoading ? (
                <div className="text-sm text-neutral-400">{t.ebayPoliciesLoading}</div>
              ) : ebayPolicies.length === 0 ? (
                <div className="rounded-xl border border-dashed border-neutral-700 p-6 text-sm text-neutral-400">
                  {t.ebayPoliciesEmpty}
                </div>
              ) : (
                <div className="space-y-6">
                  {ebayPolicies.map((policy) => (
                    <div
                      key={policy.rowId}
                      className="rounded-xl border border-neutral-700 bg-neutral-900/60 p-5"
                    >
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor={`ebay-marketplace-${policy.rowId}`}>{t.ebayMarketplaceLabel}</Label>
                          <Input
                            id={`ebay-marketplace-${policy.rowId}`}
                            value={policy.marketplace_id}
                            onChange={(e) => updatePolicyField(policy.rowId, 'marketplace_id', e.target.value)}
                            placeholder={t.ebayMarketplacePlaceholder}
                            list="ebay-marketplaces"
                            className="bg-neutral-800"
                          />
                          <p className="text-xs text-neutral-400">{t.ebayMarketplaceHelper}</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`ebay-payment-${policy.rowId}`}>{t.ebayPaymentPolicyLabel}</Label>
                          <Input
                            id={`ebay-payment-${policy.rowId}`}
                            value={policy.payment_policy_id}
                            onChange={(e) => updatePolicyField(policy.rowId, 'payment_policy_id', e.target.value)}
                            placeholder={t.ebayPaymentPolicyLabel}
                            className="bg-neutral-800"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`ebay-return-${policy.rowId}`}>{t.ebayReturnPolicyLabel}</Label>
                          <Input
                            id={`ebay-return-${policy.rowId}`}
                            value={policy.return_policy_id}
                            onChange={(e) => updatePolicyField(policy.rowId, 'return_policy_id', e.target.value)}
                            placeholder={t.ebayReturnPolicyLabel}
                            className="bg-neutral-800"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`ebay-fulfillment-${policy.rowId}`}>{t.ebayFulfillmentPolicyLabel}</Label>
                          <Input
                            id={`ebay-fulfillment-${policy.rowId}`}
                            value={policy.fulfillment_policy_id}
                            onChange={(e) => updatePolicyField(policy.rowId, 'fulfillment_policy_id', e.target.value)}
                            placeholder={t.ebayFulfillmentPolicyLabel}
                            className="bg-neutral-800"
                          />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-end">
                        <SaveButton
                          type="button"
                          onClick={() => handleSavePolicy(policy.rowId)}
                          disabled={policy.saving}
                          className="h-10 min-h-0 px-4 py-0"
                        >
                          {policy.saving ? t.savingButton : t.ebaySavePolicy}
                        </SaveButton>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <datalist id="ebay-marketplaces">
                {EBAY_MARKETPLACE_OPTIONS.map((market) => (
                  <option key={market.id} value={market.id}>
                    {market.label}
                  </option>
                ))}
              </datalist>
            </motion.div>
          )}

          {platform === 'ebay' && (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="mb-12 rounded-2xl bg-neutral-900/50 p-8 backdrop-blur-sm ring-1 ring-cyan-400/20"
            >
              <h2 className="mb-2 text-xl font-semibold">{t.ebayLegacyPoliciesTitle}</h2>
              <p className="text-neutral-400 text-sm mb-6">{t.ebayLegacyPoliciesDescription}</p>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="ebayMarketplaceId">{t.ebayMarketplaceLabel}</Label>
                  <Input
                    id="ebayMarketplaceId"
                    value={settings.ebay_marketplace_id}
                    onChange={(e) => setSettings(prev => ({ ...prev, ebay_marketplace_id: e.target.value }))}
                    placeholder={t.ebayMarketplacePlaceholder}
                    list="ebay-marketplaces"
                    className="bg-neutral-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ebayPaymentPolicyId">{t.ebayPaymentPolicyLabel}</Label>
                  <Input
                    id="ebayPaymentPolicyId"
                    value={settings.ebay_payment_policy_id}
                    onChange={(e) => setSettings(prev => ({ ...prev, ebay_payment_policy_id: e.target.value }))}
                    placeholder={t.ebayPaymentPolicyLabel}
                    className="bg-neutral-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ebayReturnPolicyId">{t.ebayReturnPolicyLabel}</Label>
                  <Input
                    id="ebayReturnPolicyId"
                    value={settings.ebay_return_policy_id}
                    onChange={(e) => setSettings(prev => ({ ...prev, ebay_return_policy_id: e.target.value }))}
                    placeholder={t.ebayReturnPolicyLabel}
                    className="bg-neutral-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ebayFulfillmentPolicyId">{t.ebayFulfillmentPolicyLabel}</Label>
                  <Input
                    id="ebayFulfillmentPolicyId"
                    value={settings.ebay_fulfillment_policy_id}
                    onChange={(e) => setSettings(prev => ({ ...prev, ebay_fulfillment_policy_id: e.target.value }))}
                    placeholder={t.ebayFulfillmentPolicyLabel}
                    className="bg-neutral-800"
                  />
                </div>
              </div>
            </motion.div>
          )}

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
