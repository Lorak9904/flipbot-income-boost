import { useCallback, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AddItemButton, SaveButton, BackButtonGhost, SyncButton } from '@/components/ui/button-presets';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, MapPin, Plus, RefreshCw, ShieldCheck } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { getCurrentLanguage, getLocalizedPathForCurrentLanguage, getTranslations } from '@/components/language-utils';
import { platformSettingsTranslations } from './platform-settings-translations';
import { AnimatedGradientBackground } from '@/components/AnimatedGradientBackground';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  createOrUpdateEbayDispatchLocation,
  getEbayInventoryLocations,
  getEbayMarketplacePolicies,
  getEbayPolicyResources,
  getEbayReadiness,
  optInEbayPolicyProgram,
  updateEbayInventoryLocation,
  updateEbayMarketplacePolicy,
  type EbayInventoryLocation,
  type EbayMarketplacePolicy,
  type EbayPolicyOption,
  type EbayPolicyResources,
  type EbayReadiness,
  type EbayReadinessSection,
} from '@/lib/api/ebay-policies';
import { getEbayConnectUrl } from '@/lib/api/ebay';
import {
  getAllegroImpliedWarranties,
  getAllegroReturnPolicies,
  getAllegroSellerSettings,
  getAllegroShippingRates,
  getAllegroWarranties,
  updateAllegroSellerSettings,
  type AllegroResourceOption,
  type AllegroSellerSettings,
} from '@/lib/api/allegro';
import {
  getEtsySellerSettings,
  getEtsyShippingProfiles,
  updateEtsySellerSettings,
  type EtsySellerSettings,
  type EtsyShippingProfile,
} from '@/lib/api/etsy';
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

interface EbayResources {
  program: EbayPolicyResources['program'] | null;
  paymentPolicies: EbayPolicyOption[];
  returnPolicies: EbayPolicyOption[];
  fulfillmentPolicies: EbayPolicyOption[];
  locations: EbayInventoryLocation[];
}

interface EbayResourceErrors {
  policyResources: boolean;
  locationResources: boolean;
}

interface EbayLocationForm {
  name: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  postal_code: string;
  country: string;
}

interface AllegroResources {
  shippingRates: AllegroResourceOption[];
  returnPolicies: AllegroResourceOption[];
  impliedWarranties: AllegroResourceOption[];
  warranties: AllegroResourceOption[];
}

interface EtsyResources {
  shippingProfiles: EtsyShippingProfile[];
}

type EtsySellerSettingsField =
  | 'shipping_profile_id'
  | 'return_policy_id'
  | 'readiness_state_id'
  | 'who_made'
  | 'when_made'
  | 'is_supply'
  | 'should_auto_renew';

const PLATFORM_NAMES: Record<string, string> = {
  facebook: 'Facebook Marketplace',
  olx: 'OLX',
  vinted: 'Vinted',
  ebay: 'eBay',
  allegro: 'Allegro',
  etsy: 'Etsy',
};

const ALLEGRO_NONE_VALUE = '__none__';

const ETSY_WHO_MADE_OPTIONS = [
  { value: 'i_did', label: 'I made it' },
  { value: 'someone_else', label: 'Someone else made it' },
  { value: 'collective', label: 'A member of my shop made it' },
];

const ETSY_WHEN_MADE_OPTIONS = [
  { value: 'made_to_order', label: 'Made to order' },
  { value: '2020_2026', label: '2020-2026' },
  { value: '2010_2019', label: '2010-2019' },
  { value: '2000_2009', label: '2000-2009' },
  { value: '1990s', label: '1990s' },
  { value: '1980s', label: '1980s' },
  { value: '1970s', label: '1970s' },
  { value: '1960s', label: '1960s' },
  { value: '1950s', label: '1950s' },
  { value: '1940s', label: '1940s' },
  { value: '1930s', label: '1930s' },
  { value: '1920s', label: '1920s' },
  { value: '1910s', label: '1910s' },
  { value: '1900s', label: '1900s' },
  { value: '1800s', label: '1800s' },
  { value: '1700s', label: '1700s' },
  { value: 'before_1700', label: 'Before 1700' },
];

const emptyAllegroSellerSettings: AllegroSellerSettings = {
  marketplace_id: 'allegro-pl',
  shipping_rates_id: '',
  return_policy_id: '',
  warranty_id: '',
  implied_warranty_id: '',
  invoice_type: '',
  handling_time: '',
  location_override: null,
};

const emptyEtsySellerSettings: EtsySellerSettings = {
  shop_id: '',
  shipping_profile_id: '',
  return_policy_id: '',
  readiness_state_id: '',
  who_made: 'i_did',
  when_made: '2020_2026',
  is_supply: false,
  should_auto_renew: false,
};

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function getEtsyShippingProfileId(profile: EtsyShippingProfile): string {
  const raw = profile.shipping_profile_id ?? profile.id;
  return raw === undefined || raw === null ? '' : String(raw);
}

function getEtsyShippingProfileLabel(profile: EtsyShippingProfile): string {
  const id = getEtsyShippingProfileId(profile);
  const name = profile.title || profile.name;
  return name ? String(name) : id;
}

const PlatformSettingsPage = () => {
  const { platform } = useParams<{ platform: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const t = getTranslations(platformSettingsTranslations);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [policiesLoading, setPoliciesLoading] = useState(false);
  const [ebayResourcesLoading, setEbayResourcesLoading] = useState(false);
  const [ebayLocationSaving, setEbayLocationSaving] = useState(false);
  const [ebayLocationCreating, setEbayLocationCreating] = useState(false);
  const [ebayPolicyOptingIn, setEbayPolicyOptingIn] = useState(false);
  const [ebayReconnecting, setEbayReconnecting] = useState(false);
  const [allegroResourcesLoading, setAllegroResourcesLoading] = useState(false);
  const [etsyResourcesLoading, setEtsyResourcesLoading] = useState(false);
  
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
  const [ebayReadiness, setEbayReadiness] = useState<EbayReadiness | null>(null);
  const [ebayResources, setEbayResources] = useState<EbayResources>({
    program: null,
    paymentPolicies: [],
    returnPolicies: [],
    fulfillmentPolicies: [],
    locations: [],
  });
  const [ebayResourceErrors, setEbayResourceErrors] = useState<EbayResourceErrors>({
    policyResources: false,
    locationResources: false,
  });
  const [ebaySelectedLocation, setEbaySelectedLocation] = useState<EbayInventoryLocation | null>(null);
  const [ebayLocationForm, setEbayLocationForm] = useState<EbayLocationForm>({
    name: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    postal_code: '',
    country: 'PL',
  });
  const [allegroSellerSettings, setAllegroSellerSettings] = useState<AllegroSellerSettings>(
    emptyAllegroSellerSettings
  );
  const [allegroResources, setAllegroResources] = useState<AllegroResources>({
    shippingRates: [],
    returnPolicies: [],
    impliedWarranties: [],
    warranties: [],
  });
  const [etsySellerSettings, setEtsySellerSettings] = useState<EtsySellerSettings>(
    emptyEtsySellerSettings
  );
  const [etsyResources, setEtsyResources] = useState<EtsyResources>({
    shippingProfiles: [],
  });

  const loadAllegroSellerSetup = useCallback(async (includeSettings = true) => {
    setAllegroResourcesLoading(true);
    const safeOptions = async (loader: () => Promise<AllegroResourceOption[]>) => {
      try {
        return await loader();
      } catch (error) {
        console.warn('Failed to load Allegro resource options:', error);
        return [];
      }
    };

    const [
      sellerSettings,
      shippingRates,
      returnPolicies,
      impliedWarranties,
      warranties,
    ] = await Promise.all([
      includeSettings ? getAllegroSellerSettings() : Promise.resolve(null),
      safeOptions(getAllegroShippingRates),
      safeOptions(getAllegroReturnPolicies),
      safeOptions(getAllegroImpliedWarranties),
      safeOptions(getAllegroWarranties),
    ]);

    if (sellerSettings) {
      setAllegroSellerSettings({
        ...emptyAllegroSellerSettings,
        ...sellerSettings,
        marketplace_id: sellerSettings.marketplace_id || 'allegro-pl',
        shipping_rates_id: sellerSettings.shipping_rates_id || '',
        return_policy_id: sellerSettings.return_policy_id || '',
        warranty_id: sellerSettings.warranty_id || '',
        implied_warranty_id: sellerSettings.implied_warranty_id || '',
        invoice_type: sellerSettings.invoice_type || '',
        handling_time: sellerSettings.handling_time || '',
      });
    }

    setAllegroResources({
      shippingRates,
      returnPolicies,
      impliedWarranties,
      warranties,
    });
    setAllegroResourcesLoading(false);
  }, []);

  const loadEtsySellerSetup = useCallback(async (includeSettings = true) => {
    setEtsyResourcesLoading(true);

    const safeShippingProfiles = async () => {
      try {
        return await getEtsyShippingProfiles();
      } catch (error) {
        console.warn('Failed to load Etsy shipping profiles:', error);
        return { shop_id: '', selected_shipping_profile_id: '', profiles: [] };
      }
    };

    const [sellerSettings, shippingProfiles] = await Promise.all([
      includeSettings ? getEtsySellerSettings() : Promise.resolve(null),
      safeShippingProfiles(),
    ]);

    if (sellerSettings) {
      setEtsySellerSettings({
        ...emptyEtsySellerSettings,
        ...sellerSettings,
        shipping_profile_id: sellerSettings.shipping_profile_id || shippingProfiles.selected_shipping_profile_id || '',
        return_policy_id: sellerSettings.return_policy_id || '',
        readiness_state_id: sellerSettings.readiness_state_id || '',
        who_made: sellerSettings.who_made || emptyEtsySellerSettings.who_made,
        when_made: sellerSettings.when_made || emptyEtsySellerSettings.when_made,
        is_supply: Boolean(sellerSettings.is_supply),
        should_auto_renew: Boolean(sellerSettings.should_auto_renew),
      });
    } else if (shippingProfiles.selected_shipping_profile_id) {
      setEtsySellerSettings((prev) => ({
        ...prev,
        shipping_profile_id: shippingProfiles.selected_shipping_profile_id,
      }));
    }

    setEtsyResources({
      shippingProfiles: shippingProfiles.profiles || [],
    });
    setEtsyResourcesLoading(false);
  }, []);

  const loadEbaySetup = useCallback(async (marketplaceId = 'EBAY_PL', includePolicies = true) => {
    const normalizedMarketplaceId = marketplaceId.trim().toUpperCase() || 'EBAY_PL';
    if (includePolicies) {
      setPoliciesLoading(true);
    }
    setEbayResourcesLoading(true);

    const safeLoad = async <T,>(loader: () => Promise<T>, fallback: T): Promise<{ value: T; failed: boolean }> => {
      try {
        return { value: await loader(), failed: false };
      } catch (error) {
        console.warn('Failed to load eBay setup resource:', error);
        return { value: fallback, failed: true };
      }
    };

    const [readinessResult, policiesResult, policyResourcesResult, locationResourcesResult] = await Promise.all([
      safeLoad(() => getEbayReadiness(normalizedMarketplaceId), null),
      includePolicies ? safeLoad(() => getEbayMarketplacePolicies(), []) : Promise.resolve({ value: [], failed: false }),
      safeLoad(() => getEbayPolicyResources(normalizedMarketplaceId), null),
      safeLoad(() => getEbayInventoryLocations(normalizedMarketplaceId), null),
    ]);

    const readiness = readinessResult.value;
    const policies = policiesResult.value;
    const policyResources = policyResourcesResult.value;
    const locationResources = locationResourcesResult.value;

    if (readiness) {
      setEbayReadiness(readiness);
    }

    if (includePolicies && !policiesResult.failed) {
      const policyRows = policies.length > 0
        ? policies.map((policy) => ({
            rowId: policy.marketplace_id,
            marketplace_id: policy.marketplace_id,
            payment_policy_id: policy.payment_policy_id || '',
            return_policy_id: policy.return_policy_id || '',
            fulfillment_policy_id: policy.fulfillment_policy_id || '',
          }))
        : [
            {
              rowId: normalizedMarketplaceId,
              marketplace_id: normalizedMarketplaceId,
              payment_policy_id: '',
              return_policy_id: '',
              fulfillment_policy_id: '',
            },
          ];
      setEbayPolicies(policyRows);
    }

    setEbayResourceErrors({
      policyResources: policyResourcesResult.failed,
      locationResources: locationResourcesResult.failed,
    });
    setEbayResources((prev) => ({
      program: policyResourcesResult.failed ? prev.program : policyResources?.program || null,
      paymentPolicies: policyResourcesResult.failed ? prev.paymentPolicies : policyResources?.payment_policies || [],
      returnPolicies: policyResourcesResult.failed ? prev.returnPolicies : policyResources?.return_policies || [],
      fulfillmentPolicies: policyResourcesResult.failed ? prev.fulfillmentPolicies : policyResources?.fulfillment_policies || [],
      locations: locationResourcesResult.failed ? prev.locations : locationResources?.locations || [],
    }));
    if (!locationResourcesResult.failed) {
      setEbaySelectedLocation(locationResources?.selected_location || null);
    }
    if (includePolicies) {
      setPoliciesLoading(false);
    }
    setEbayResourcesLoading(false);
  }, []);

  // Validate platform param
  const validPlatforms = ['facebook', 'olx', 'vinted', 'ebay', 'allegro', 'etsy'];
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

        let loadedEbayMarketplaceId = 'EBAY_PL';
        if (response.ok) {
          const data = await response.json();
          loadedEbayMarketplaceId = data.ebay_marketplace_id || 'EBAY_PL';
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
          await loadEbaySetup(loadedEbayMarketplaceId, true);
        }

        if (platform === 'allegro') {
          await loadAllegroSellerSetup(true);
        }

        if (platform === 'etsy') {
          await loadEtsySellerSetup(true);
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
        setEbayResourcesLoading(false);
        setAllegroResourcesLoading(false);
        setEtsyResourcesLoading(false);
        setLoading(false);
      }
    };

    loadSettings();
  }, [platform, isValidPlatform, loadAllegroSellerSetup, loadEbaySetup, loadEtsySellerSetup, t.toastErrorTitle, t.toastLoadError, toast]);

  // Redirect if invalid platform
  if (!isValidPlatform) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t.invalidPlatform}</h1>
          <BackButtonGhost onClick={() => navigate(getLocalizedPathForCurrentLanguage('/connect-accounts'))}>
            {t.backToConnectedAccounts}
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

      if (platform === 'allegro') {
        const marketplaceId = allegroSellerSettings.marketplace_id || 'allegro-pl';
        const saved = await updateAllegroSellerSettings(
          {
            marketplace_id: marketplaceId,
            shipping_rates_id: allegroSellerSettings.shipping_rates_id || '',
            return_policy_id: allegroSellerSettings.return_policy_id || '',
            warranty_id: allegroSellerSettings.warranty_id || '',
            implied_warranty_id: allegroSellerSettings.implied_warranty_id || '',
            invoice_type: allegroSellerSettings.invoice_type || '',
            handling_time: allegroSellerSettings.handling_time || '',
            location_override: allegroSellerSettings.location_override || null,
          },
          marketplaceId
        );
        setAllegroSellerSettings({
          ...emptyAllegroSellerSettings,
          ...saved,
          marketplace_id: saved.marketplace_id || marketplaceId,
          shipping_rates_id: saved.shipping_rates_id || '',
          return_policy_id: saved.return_policy_id || '',
          warranty_id: saved.warranty_id || '',
          implied_warranty_id: saved.implied_warranty_id || '',
          invoice_type: saved.invoice_type || '',
          handling_time: saved.handling_time || '',
        });
      }

      if (platform === 'etsy') {
        const saved = await updateEtsySellerSettings({
          shipping_profile_id: etsySellerSettings.shipping_profile_id || '',
          return_policy_id: etsySellerSettings.return_policy_id || '',
          readiness_state_id: etsySellerSettings.readiness_state_id || '',
          who_made: etsySellerSettings.who_made || emptyEtsySellerSettings.who_made,
          when_made: etsySellerSettings.when_made || emptyEtsySellerSettings.when_made,
          is_supply: etsySellerSettings.is_supply,
          should_auto_renew: etsySellerSettings.should_auto_renew,
        });
        setEtsySellerSettings({
          ...emptyEtsySellerSettings,
          ...saved,
          shipping_profile_id: saved.shipping_profile_id || '',
          return_policy_id: saved.return_policy_id || '',
          readiness_state_id: saved.readiness_state_id || '',
          who_made: saved.who_made || emptyEtsySellerSettings.who_made,
          when_made: saved.when_made || emptyEtsySellerSettings.when_made,
          is_supply: Boolean(saved.is_supply),
          should_auto_renew: Boolean(saved.should_auto_renew),
        });
      }

      toast({
        title: t.toastSettingsSavedTitle,
        description: t.toastSettingsSavedDescription.replace('{platform}', platformName),
      });
    } catch (e: unknown) {
      toast({
        title: t.toastErrorTitle,
        description: getErrorMessage(e, 'Failed to save settings'),
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
    } catch (e: unknown) {
      toast({
        title: t.toastErrorTitle,
        description: getErrorMessage(e, t.syncAddressError),
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleRefreshEtsyResources = async () => {
    try {
      await loadEtsySellerSetup(false);
      toast({
        title: t.etsyResourcesRefreshedTitle,
        description: t.etsyResourcesRefreshedDescription,
      });
    } catch (error) {
      setEtsyResourcesLoading(false);
      toast({
        title: t.toastErrorTitle,
        description: getErrorMessage(error, t.toastLoadError),
        variant: 'destructive',
      });
    }
  };

  const handleRefreshAllegroResources = async () => {
    try {
      await loadAllegroSellerSetup(false);
      toast({
        title: t.allegroResourcesRefreshedTitle,
        description: t.allegroResourcesRefreshedDescription,
      });
    } catch (error) {
      setAllegroResourcesLoading(false);
      toast({
        title: t.toastErrorTitle,
        description: getErrorMessage(error, t.toastLoadError),
        variant: 'destructive',
      });
    }
  };

  const normalizeMarketplaceId = (value: string) => value.trim().toUpperCase();

  const getActiveEbayMarketplaceId = () => {
    const firstPolicyMarketplace = ebayPolicies.find((policy) => policy.marketplace_id.trim())?.marketplace_id;
    return normalizeMarketplaceId(
      firstPolicyMarketplace
      || settings.ebay_marketplace_id
      || ebayReadiness?.marketplace_id
      || 'EBAY_PL'
    ) || 'EBAY_PL';
  };

  const handleRefreshEbayResources = async () => {
    try {
      await loadEbaySetup(getActiveEbayMarketplaceId(), false);
      toast({
        title: t.ebayResourcesRefreshedTitle,
        description: t.ebayResourcesRefreshedDescription,
      });
    } catch (error) {
      setEbayResourcesLoading(false);
      toast({
        title: t.toastErrorTitle,
        description: getErrorMessage(error, t.toastLoadError),
        variant: 'destructive',
      });
    }
  };

  const handleReconnectEbay = async () => {
    setEbayReconnecting(true);
    try {
      const data = await getEbayConnectUrl(getActiveEbayMarketplaceId());
      window.location.href = data.auth_url;
    } catch (error) {
      setEbayReconnecting(false);
      toast({
        title: t.toastErrorTitle,
        description: getErrorMessage(error, t.ebayReconnectError),
        variant: 'destructive',
      });
    }
  };

  const handleOptInEbayPolicyProgram = async () => {
    const marketplaceId = getActiveEbayMarketplaceId();
    setEbayPolicyOptingIn(true);
    try {
      await optInEbayPolicyProgram(marketplaceId);
      await loadEbaySetup(marketplaceId, false);
      toast({
        title: t.toastSettingsSavedTitle,
        description: t.ebayPolicyOptInRequested,
      });
    } catch (error) {
      toast({
        title: t.toastErrorTitle,
        description: getErrorMessage(error, t.ebayPolicyOptInError),
        variant: 'destructive',
      });
    } finally {
      setEbayPolicyOptingIn(false);
    }
  };

  const updateEbayLocationForm = (field: keyof EbayLocationForm, value: string) => {
    setEbayLocationForm((prev) => ({ ...prev, [field]: value }));
  };

  const prefillEbayLocationFromAddress = () => {
    setEbayLocationForm((prev) => ({
      ...prev,
      address_line_1: settings.address_street || prev.address_line_1,
      city: settings.address_city || prev.city,
      postal_code: settings.address_postal_code || prev.postal_code,
      country: (settings.address_country || prev.country || 'PL').toUpperCase(),
    }));
  };

  const handleCreateEbayLocation = async () => {
    const requiredFields: Array<keyof EbayLocationForm> = ['address_line_1', 'city', 'postal_code', 'country'];
    const missing = requiredFields.filter((field) => !ebayLocationForm[field].trim());
    if (missing.length > 0) {
      toast({
        title: t.toastErrorTitle,
        description: t.ebayLocationCreateRequired,
        variant: 'destructive',
      });
      return;
    }

    const marketplaceId = getActiveEbayMarketplaceId();
    setEbayLocationCreating(true);
    try {
      const saved = await createOrUpdateEbayDispatchLocation({
        marketplace_id: marketplaceId,
        name: ebayLocationForm.name.trim() || undefined,
        address: {
          address_line_1: ebayLocationForm.address_line_1.trim(),
          address_line_2: ebayLocationForm.address_line_2.trim() || undefined,
          city: ebayLocationForm.city.trim(),
          postal_code: ebayLocationForm.postal_code.trim(),
          country: ebayLocationForm.country.trim().toUpperCase(),
        },
      });
      setEbaySelectedLocation(saved);
      await loadEbaySetup(marketplaceId, false);
      toast({
        title: t.toastSettingsSavedTitle,
        description: t.ebayLocationCreated,
      });
    } catch (error) {
      toast({
        title: t.toastErrorTitle,
        description: getErrorMessage(error, t.ebayLocationCreateError),
        variant: 'destructive',
      });
    } finally {
      setEbayLocationCreating(false);
    }
  };

  const scrollToEbaySection = (elementId: string) => {
    document.getElementById(elementId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleEbayReadinessAction = (section: EbayReadinessSection) => {
    if (section.action_key === 'connect_ebay' || section.action_key === 'reconnect_ebay') {
      void handleReconnectEbay();
      return;
    }
    if (section.action_key === 'configure_ebay_policies') {
      scrollToEbaySection('ebay-policy-settings');
      return;
    }
    if (section.action_key === 'configure_ebay_location') {
      scrollToEbaySection('ebay-dispatch-location-settings');
      return;
    }
    if (section.action_key === 'contact_support') {
      toast({
        title: t.ebayAppConfigBlockedTitle,
        description: t.ebayAppConfigBlockedDescription,
        variant: 'destructive',
      });
    }
  };

  const getEbayReadinessActionLabel = (section: EbayReadinessSection) => {
    if (section.action_key === 'connect_ebay' || section.action_key === 'reconnect_ebay') {
      return ebayReconnecting ? t.ebayReconnectLoading : t.ebayReconnectButton;
    }
    if (section.action_key === 'configure_ebay_policies') return t.ebayConfigurePoliciesButton;
    if (section.action_key === 'configure_ebay_location') return t.ebayConfigureLocationButton;
    if (section.action_key === 'contact_support') return t.ebayContactSupportButton;
    return '';
  };

  const handleSaveEbayLocation = async () => {
    const marketplaceId = getActiveEbayMarketplaceId();
    const selectedKey = ebaySelectedLocation?.merchant_location_key?.trim();

    if (!selectedKey) {
      toast({
        title: t.toastErrorTitle,
        description: t.ebayLocationRequired,
        variant: 'destructive',
      });
      return;
    }

    const locationFromList = ebayResources.locations.find(
      (location) => location.merchant_location_key === selectedKey
    );
    const location = locationFromList || ebaySelectedLocation;

    setEbayLocationSaving(true);
    try {
      const saved = await updateEbayInventoryLocation(marketplaceId, {
        merchant_location_key: selectedKey,
        name: location?.name || selectedKey,
        address_summary: location?.address_summary || '',
        raw: location?.raw || {},
      });
      setEbaySelectedLocation(saved);
      await loadEbaySetup(marketplaceId, false);
      toast({
        title: t.toastSettingsSavedTitle,
        description: t.ebayLocationSaved,
      });
    } catch (error) {
      toast({
        title: t.toastErrorTitle,
        description: getErrorMessage(error, t.ebayLocationSaveError),
        variant: 'destructive',
      });
    } finally {
      setEbayLocationSaving(false);
    }
  };

  const handleAddMarketplacePolicy = () => {
    const marketplaceId = getActiveEbayMarketplaceId();
    const newRow: EbayMarketplacePolicyDraft = {
      rowId: `new-${Date.now()}`,
      marketplace_id: marketplaceId,
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
      await loadEbaySetup(marketplaceId, false);
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
    } catch (e: unknown) {
      toast({
        title: t.toastErrorTitle,
        description: getErrorMessage(e, t.ebayPolicySaveError),
        variant: 'destructive',
      });
    } finally {
      setEbayPolicies((prev) =>
        prev.map((item) => (item.rowId === rowId ? { ...item, saving: false } : item))
      );
    }
  };

  const renderEbayPolicySelect = (
    policy: EbayMarketplacePolicyDraft,
    field: 'payment_policy_id' | 'return_policy_id' | 'fulfillment_policy_id',
    label: string,
    options: EbayPolicyOption[],
    placeholder: string
  ) => {
    const selectedValue = policy[field];
    const hasSavedValueInOptions = options.some((option) => option.id === selectedValue);

    return (
      <div className="space-y-2">
        <Label htmlFor={`ebay-${field}-${policy.rowId}`}>{label}</Label>
        {options.length > 0 ? (
          <Select
            value={selectedValue || undefined}
            onValueChange={(selected) => updatePolicyField(policy.rowId, field, selected)}
          >
            <SelectTrigger
              id={`ebay-${field}-${policy.rowId}`}
              className="bg-neutral-800 border-neutral-700 text-white"
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
              {selectedValue && !hasSavedValueInOptions && (
                <SelectItem value={selectedValue}>
                  {t.ebaySavedResourceNotLoaded.replace('{id}', selectedValue)}
                </SelectItem>
              )}
              {options.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name || option.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div
            id={`ebay-${field}-${policy.rowId}`}
            className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100"
          >
            {selectedValue
              ? t.ebaySavedResourceNotLoaded.replace('{id}', selectedValue)
              : t.ebayNoResourcesFound}
          </div>
        )}
      </div>
    );
  };

  const updateAllegroField = (field: keyof AllegroSellerSettings, value: string) => {
    setAllegroSellerSettings((prev) => ({ ...prev, [field]: value }));
  };

  const updateEtsyField = (field: EtsySellerSettingsField, value: string | boolean) => {
    setEtsySellerSettings((prev) => ({ ...prev, [field]: value }));
  };

  const renderAllegroResourceField = (
    field: keyof AllegroSellerSettings,
    label: string,
    options: AllegroResourceOption[],
    placeholder: string,
    helperText: string,
    required = true,
    allowEmpty = false
  ) => {
    const value = String(allegroSellerSettings[field] || '');
    const selectValue = value || (allowEmpty ? ALLEGRO_NONE_VALUE : undefined);

    return (
      <div className="space-y-2">
        <Label htmlFor={`allegro-${field}`}>
          {label}
          {required && <span className="ml-1 text-red-300">*</span>}
        </Label>
        {options.length > 0 ? (
          <Select
            value={selectValue}
            onValueChange={(selected) =>
              updateAllegroField(field, selected === ALLEGRO_NONE_VALUE ? '' : selected)
            }
          >
            <SelectTrigger
              id={`allegro-${field}`}
              className="bg-neutral-800 border-neutral-700 text-white"
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
              {allowEmpty && (
                <SelectItem value={ALLEGRO_NONE_VALUE}>{t.allegroNoOptionalValue}</SelectItem>
              )}
              {options.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div
            id={`allegro-${field}`}
            className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100"
          >
            {value
              ? t.allegroSavedResourceNotLoaded.replace('{id}', value)
              : t.allegroNoResourcesFound}
          </div>
        )}
        <p className="text-xs text-neutral-400">{helperText}</p>
      </div>
    );
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
        title={t.pageHeading(platformName)}
        description={t.pageDescription.replace('{platform}', platformName)}
        language={getCurrentLanguage()}
        robots="noindex, nofollow"
      />
      
      <AnimatedGradientBackground />

      <section className="relative py-28 text-center">
        <div className="container mx-auto px-4">
          <BackButtonGhost
            onClick={() => navigate(getLocalizedPathForCurrentLanguage('/connect-accounts'))}
          >
            {t.backToConnectedAccounts}
          </BackButtonGhost>
          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            {t.pageHeading(platformName)}
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

          {platform === 'allegro' && (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="mb-12 rounded-2xl bg-neutral-900/50 p-8 backdrop-blur-sm ring-1 ring-cyan-400/20"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-cyan-400" />
                    {t.allegroPublishingTitle}
                  </h2>
                  <p className="mt-2 text-neutral-300 text-sm">{t.allegroPublishingDescription}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void handleRefreshAllegroResources()}
                  disabled={allegroResourcesLoading}
                  className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${allegroResourcesLoading ? 'animate-spin' : ''}`} />
                  {allegroResourcesLoading ? t.allegroResourcesLoading : t.allegroRefreshResourcesButton}
                </button>
              </div>

              <div className="mb-6 rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm text-neutral-200">
                {t.allegroResourceSetupHint}
              </div>

              <div className="space-y-6 md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
                <div className="space-y-2">
                  <Label htmlFor="allegro-marketplace-id">{t.allegroMarketplaceLabel}</Label>
                  <Input
                    id="allegro-marketplace-id"
                    value={allegroSellerSettings.marketplace_id}
                    onChange={(event) => updateAllegroField('marketplace_id', event.target.value)}
                    placeholder="allegro-pl"
                    className="bg-neutral-800"
                  />
                  <p className="text-xs text-neutral-400">{t.allegroMarketplaceHelper}</p>
                </div>

                {renderAllegroResourceField(
                  'shipping_rates_id',
                  t.allegroShippingRatesLabel,
                  allegroResources.shippingRates,
                  t.allegroShippingRatesPlaceholder,
                  t.allegroShippingRatesHelper
                )}

                {renderAllegroResourceField(
                  'return_policy_id',
                  t.allegroReturnPolicyLabel,
                  allegroResources.returnPolicies,
                  t.allegroReturnPolicyPlaceholder,
                  t.allegroReturnPolicyHelper
                )}

                {renderAllegroResourceField(
                  'implied_warranty_id',
                  t.allegroImpliedWarrantyLabel,
                  allegroResources.impliedWarranties,
                  t.allegroImpliedWarrantyPlaceholder,
                  t.allegroImpliedWarrantyHelper
                )}

                {renderAllegroResourceField(
                  'warranty_id',
                  t.allegroWarrantyLabel,
                  allegroResources.warranties,
                  t.allegroWarrantyPlaceholder,
                  t.allegroWarrantyHelper,
                  false,
                  true
                )}

                <div className="space-y-2">
                  <Label htmlFor="allegro-invoice-type">{t.allegroInvoiceLabel}</Label>
                  <Select
                    value={allegroSellerSettings.invoice_type || ALLEGRO_NONE_VALUE}
                    onValueChange={(selected) =>
                      updateAllegroField(
                        'invoice_type',
                        selected === ALLEGRO_NONE_VALUE ? '' : selected
                      )
                    }
                  >
                    <SelectTrigger
                      id="allegro-invoice-type"
                      className="bg-neutral-800 border-neutral-700 text-white"
                    >
                      <SelectValue placeholder={t.allegroInvoicePlaceholder} />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                      <SelectItem value={ALLEGRO_NONE_VALUE}>{t.allegroNoOptionalValue}</SelectItem>
                      <SelectItem value="VAT">VAT</SelectItem>
                      <SelectItem value="VAT_MARGIN">{t.allegroInvoiceVatMargin}</SelectItem>
                      <SelectItem value="WITHOUT_VAT">{t.allegroInvoiceWithoutVat}</SelectItem>
                      <SelectItem value="NO_INVOICE">{t.allegroInvoiceNone}</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-neutral-400">{t.allegroInvoiceHelper}</p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="allegro-handling-time">{t.allegroHandlingTimeLabel}</Label>
                  <Input
                    id="allegro-handling-time"
                    value={allegroSellerSettings.handling_time}
                    onChange={(event) => updateAllegroField('handling_time', event.target.value)}
                    placeholder="PT24H"
                    className="bg-neutral-800"
                  />
                  <p className="text-xs text-neutral-400">{t.allegroHandlingTimeHelper}</p>
                </div>
              </div>
            </motion.div>
          )}

          {platform === 'etsy' && (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="mb-12 rounded-2xl bg-neutral-900/50 p-8 backdrop-blur-sm ring-1 ring-cyan-400/20"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-cyan-400" />
                    {t.etsyPublishingTitle}
                  </h2>
                  <p className="mt-2 text-neutral-300 text-sm">{t.etsyPublishingDescription}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void handleRefreshEtsyResources()}
                  disabled={etsyResourcesLoading}
                  className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${etsyResourcesLoading ? 'animate-spin' : ''}`} />
                  {etsyResourcesLoading ? t.etsyResourcesLoading : t.etsyRefreshResourcesButton}
                </button>
              </div>

              <div className="mb-6 rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm text-neutral-200">
                {t.etsyResourceSetupHint}
              </div>

              <div className="space-y-6 md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="etsy-shipping-profile">
                    {t.etsyShippingProfileLabel}
                    <span className="ml-1 text-red-300">*</span>
                  </Label>
                  {etsyResources.shippingProfiles.length > 0 ? (
                    <Select
                      value={etsySellerSettings.shipping_profile_id || undefined}
                      onValueChange={(selected) => updateEtsyField('shipping_profile_id', selected)}
                    >
                      <SelectTrigger
                        id="etsy-shipping-profile"
                        className="bg-neutral-800 border-neutral-700 text-white"
                      >
                        <SelectValue placeholder={t.etsyShippingProfilePlaceholder} />
                      </SelectTrigger>
                      <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                        {etsySellerSettings.shipping_profile_id
                          && !etsyResources.shippingProfiles.some(
                            (profile) =>
                              getEtsyShippingProfileId(profile) === etsySellerSettings.shipping_profile_id
                          ) && (
                            <SelectItem value={etsySellerSettings.shipping_profile_id}>
                              {t.etsySavedResourceNotLoaded.replace('{id}', etsySellerSettings.shipping_profile_id)}
                            </SelectItem>
                          )}
                        {etsyResources.shippingProfiles.map((profile) => {
                          const id = getEtsyShippingProfileId(profile);
                          if (!id) return null;
                          return (
                            <SelectItem key={id} value={id}>
                              {getEtsyShippingProfileLabel(profile)}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div
                      id="etsy-shipping-profile"
                      className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100"
                    >
                      {etsySellerSettings.shipping_profile_id
                        ? t.etsySavedResourceNotLoaded.replace('{id}', etsySellerSettings.shipping_profile_id)
                        : t.etsyNoShippingProfilesFound}
                    </div>
                  )}
                  <p className="text-xs text-neutral-400">{t.etsyShippingProfileHelper}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="etsy-who-made">{t.etsyWhoMadeLabel}</Label>
                  <Select
                    value={etsySellerSettings.who_made || emptyEtsySellerSettings.who_made}
                    onValueChange={(selected) => updateEtsyField('who_made', selected)}
                  >
                    <SelectTrigger
                      id="etsy-who-made"
                      className="bg-neutral-800 border-neutral-700 text-white"
                    >
                      <SelectValue placeholder={t.etsyWhoMadePlaceholder} />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                      {ETSY_WHO_MADE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-neutral-400">{t.etsyWhoMadeHelper}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="etsy-when-made">{t.etsyWhenMadeLabel}</Label>
                  <Select
                    value={etsySellerSettings.when_made || emptyEtsySellerSettings.when_made}
                    onValueChange={(selected) => updateEtsyField('when_made', selected)}
                  >
                    <SelectTrigger
                      id="etsy-when-made"
                      className="bg-neutral-800 border-neutral-700 text-white"
                    >
                      <SelectValue placeholder={t.etsyWhenMadePlaceholder} />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                      {ETSY_WHEN_MADE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-neutral-400">{t.etsyWhenMadeHelper}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="etsy-is-supply">{t.etsyIsSupplyLabel}</Label>
                  <Select
                    value={etsySellerSettings.is_supply ? 'true' : 'false'}
                    onValueChange={(selected) => updateEtsyField('is_supply', selected === 'true')}
                  >
                    <SelectTrigger
                      id="etsy-is-supply"
                      className="bg-neutral-800 border-neutral-700 text-white"
                    >
                      <SelectValue placeholder={t.etsyIsSupplyPlaceholder} />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                      <SelectItem value="false">{t.etsyIsSupplyNo}</SelectItem>
                      <SelectItem value="true">{t.etsyIsSupplyYes}</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-neutral-400">{t.etsyIsSupplyHelper}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="etsy-auto-renew">{t.etsyAutoRenewLabel}</Label>
                  <Select
                    value={etsySellerSettings.should_auto_renew ? 'true' : 'false'}
                    onValueChange={(selected) => updateEtsyField('should_auto_renew', selected === 'true')}
                  >
                    <SelectTrigger
                      id="etsy-auto-renew"
                      className="bg-neutral-800 border-neutral-700 text-white"
                    >
                      <SelectValue placeholder={t.etsyAutoRenewPlaceholder} />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                      <SelectItem value="false">{t.etsyAutoRenewNo}</SelectItem>
                      <SelectItem value="true">{t.etsyAutoRenewYes}</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-neutral-400">{t.etsyAutoRenewHelper}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="etsy-return-policy">{t.etsyReturnPolicyLabel}</Label>
                  <Input
                    id="etsy-return-policy"
                    value={etsySellerSettings.return_policy_id}
                    onChange={(event) => updateEtsyField('return_policy_id', event.target.value)}
                    placeholder={t.etsyReturnPolicyPlaceholder}
                    className="bg-neutral-800"
                  />
                  <p className="text-xs text-neutral-400">{t.etsyReturnPolicyHelper}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="etsy-readiness-state">{t.etsyReadinessStateLabel}</Label>
                  <Input
                    id="etsy-readiness-state"
                    value={etsySellerSettings.readiness_state_id}
                    onChange={(event) => updateEtsyField('readiness_state_id', event.target.value)}
                    placeholder={t.etsyReadinessStatePlaceholder}
                    className="bg-neutral-800"
                  />
                  <p className="text-xs text-neutral-400">{t.etsyReadinessStateHelper}</p>
                </div>
              </div>
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
              <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-cyan-400" />
                    {t.ebayPublishingTitle}
                  </h2>
                  <p className="text-neutral-300 text-sm mt-1">{t.ebayPublishingDescription}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void handleRefreshEbayResources()}
                  disabled={ebayResourcesLoading}
                  className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${ebayResourcesLoading ? 'animate-spin' : ''}`} />
                  {ebayResourcesLoading ? t.ebayResourcesLoading : t.ebayRefreshResourcesButton}
                </button>
              </div>

              {ebayReadiness && (
                <div className="mb-6 rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-4">
                  <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-semibold text-cyan-100">
                      {ebayReadiness.ready ? t.ebayReadyTitle : t.ebayNeedsSetupTitle}
                    </p>
                    <span className="text-xs uppercase tracking-wide text-cyan-200/80">
                      {ebayReadiness.marketplace_id}
                    </span>
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    {ebayReadiness.sections.map((section) => {
                      const actionLabel = getEbayReadinessActionLabel(section);
                      const isReady = section.status === 'ready';
                      const isBlocked = section.status === 'blocked_by_app_config' || section.status === 'reconnect_required';
                      return (
                        <div
                          key={section.key}
                          className={`rounded-lg border px-3 py-2 text-sm ${
                            isReady
                              ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100'
                              : isBlocked
                                ? 'border-red-400/30 bg-red-400/10 text-red-100'
                                : 'border-amber-400/30 bg-amber-400/10 text-amber-100'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="font-semibold">{section.label}</div>
                              <div className="mt-1 text-xs opacity-90">{section.message}</div>
                            </div>
                            {actionLabel && section.action_key !== 'none' && (
                              <button
                                type="button"
                                onClick={() => handleEbayReadinessAction(section)}
                                disabled={ebayReconnecting}
                                className="shrink-0 rounded-full border border-current/30 px-2.5 py-1 text-[11px] font-semibold transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {actionLabel}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mb-6 rounded-xl border border-cyan-400/20 bg-neutral-950/50 p-4 text-sm text-neutral-200">
                {t.ebayResourceSetupHint}
              </div>

              {ebayResourceErrors.policyResources && (
                <div className="mb-4 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
                  {t.ebayPolicyResourcesLoadError}
                </div>
              )}

              {ebayResources.program && (
                <div
                  className={`mb-6 rounded-xl border p-4 text-sm ${
                    ebayResources.program.opted_in
                      ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100'
                      : 'border-amber-400/30 bg-amber-400/10 text-amber-100'
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold">
                        {ebayResources.program.opted_in
                          ? t.ebayPolicyProgramReady
                          : t.ebayPolicyProgramNeedsOptIn}
                      </p>
                      {!ebayResources.program.opted_in && (
                        <p className="mt-1 text-xs opacity-90">{t.ebayPolicyProgramDescription}</p>
                      )}
                    </div>
                    {!ebayResources.program.opted_in && (
                      <button
                        type="button"
                        onClick={() => void handleOptInEbayPolicyProgram()}
                        disabled={ebayPolicyOptingIn}
                        className="rounded-full border border-amber-200/40 px-3 py-1.5 text-xs font-semibold transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {ebayPolicyOptingIn ? t.savingButton : t.ebayEnablePoliciesButton}
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div
                id="ebay-policy-settings"
                className="mb-4 scroll-mt-24 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h3 className="text-lg font-semibold">{t.ebayPoliciesTitle}</h3>
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
                            onBlur={() => void loadEbaySetup(normalizeMarketplaceId(policy.marketplace_id) || 'EBAY_PL', false)}
                            placeholder={t.ebayMarketplacePlaceholder}
                            list="ebay-marketplaces"
                            className="bg-neutral-800"
                          />
                          <p className="text-xs text-neutral-400">{t.ebayMarketplaceHelper}</p>
                        </div>
                        {renderEbayPolicySelect(
                          policy,
                          'payment_policy_id',
                          t.ebayPaymentPolicyLabel,
                          ebayResources.paymentPolicies,
                          t.ebayPaymentPolicyPlaceholder
                        )}
                        {renderEbayPolicySelect(
                          policy,
                          'return_policy_id',
                          t.ebayReturnPolicyLabel,
                          ebayResources.returnPolicies,
                          t.ebayReturnPolicyPlaceholder
                        )}
                        {renderEbayPolicySelect(
                          policy,
                          'fulfillment_policy_id',
                          t.ebayFulfillmentPolicyLabel,
                          ebayResources.fulfillmentPolicies,
                          t.ebayFulfillmentPolicyPlaceholder
                        )}
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

              <div
                id="ebay-dispatch-location-settings"
                className="mt-8 scroll-mt-24 rounded-xl border border-neutral-700 bg-neutral-900/60 p-5"
              >
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">{t.ebayLocationTitle}</h3>
                  <p className="mt-1 text-sm text-neutral-300">{t.ebayLocationDescription}</p>
                </div>
                {ebayResourceErrors.locationResources && (
                  <div className="mb-4 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
                    {t.ebayLocationResourcesLoadError}
                  </div>
                )}
                {ebayResources.locations.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                    <div className="space-y-2">
                      <Label htmlFor="ebay-dispatch-location">{t.ebayLocationLabel}</Label>
                      <Select
                        value={ebaySelectedLocation?.merchant_location_key || undefined}
                        onValueChange={(selected) => {
                          const location = ebayResources.locations.find(
                            (item) => item.merchant_location_key === selected
                          );
                          if (location) {
                            setEbaySelectedLocation(location);
                          }
                        }}
                      >
                        <SelectTrigger
                          id="ebay-dispatch-location"
                          className="bg-neutral-800 border-neutral-700 text-white"
                        >
                          <SelectValue placeholder={t.ebayLocationPlaceholder} />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                          {ebaySelectedLocation
                            && !ebayResources.locations.some(
                              (location) => location.merchant_location_key === ebaySelectedLocation.merchant_location_key
                            ) && (
                              <SelectItem value={ebaySelectedLocation.merchant_location_key}>
                                {t.ebaySavedResourceNotLoaded.replace('{id}', ebaySelectedLocation.merchant_location_key)}
                              </SelectItem>
                            )}
                          {ebayResources.locations.map((location) => (
                            <SelectItem
                              key={location.merchant_location_key}
                              value={location.merchant_location_key}
                            >
                              {location.name || location.merchant_location_key}
                              {location.address_summary ? ` - ${location.address_summary}` : ''}
                              {location.enabled === false ? ` (${t.ebayLocationDisabled})` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-neutral-400">{t.ebayLocationHelper}</p>
                    </div>
                    <SaveButton
                      type="button"
                      onClick={() => void handleSaveEbayLocation()}
                      disabled={ebayLocationSaving}
                      className="h-10 min-h-0 px-4 py-0"
                    >
                      {ebayLocationSaving ? t.savingButton : t.ebaySaveLocation}
                    </SaveButton>
                  </div>
                ) : (
                  <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
                    {ebaySelectedLocation?.merchant_location_key
                      ? t.ebaySavedResourceNotLoaded.replace('{id}', ebaySelectedLocation.merchant_location_key)
                      : t.ebayNoLocationsFound}
                  </div>
                )}

                <div className="mt-6 rounded-xl border border-cyan-400/15 bg-neutral-950/40 p-4">
                  <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h4 className="font-semibold text-white">{t.ebayCreateLocationTitle}</h4>
                      <p className="mt-1 text-sm text-neutral-300">{t.ebayCreateLocationDescription}</p>
                    </div>
                    <button
                      type="button"
                      onClick={prefillEbayLocationFromAddress}
                      className="rounded-full border border-cyan-400/40 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-400/10"
                    >
                      {t.ebayUseAddressButton}
                    </button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="ebay-location-name">{t.ebayLocationNameLabel}</Label>
                      <Input
                        id="ebay-location-name"
                        value={ebayLocationForm.name}
                        onChange={(event) => updateEbayLocationForm('name', event.target.value)}
                        placeholder={t.ebayLocationNamePlaceholder}
                        className="bg-neutral-800"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ebay-location-country">{t.ebayLocationCountryLabel}</Label>
                      <Input
                        id="ebay-location-country"
                        value={ebayLocationForm.country}
                        onChange={(event) => updateEbayLocationForm('country', event.target.value.toUpperCase())}
                        placeholder="PL"
                        className="bg-neutral-800"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="ebay-location-address-1">{t.ebayLocationAddressLine1Label}</Label>
                      <Input
                        id="ebay-location-address-1"
                        value={ebayLocationForm.address_line_1}
                        onChange={(event) => updateEbayLocationForm('address_line_1', event.target.value)}
                        placeholder={t.ebayLocationAddressLine1Placeholder}
                        className="bg-neutral-800"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ebay-location-city">{t.ebayLocationCityLabel}</Label>
                      <Input
                        id="ebay-location-city"
                        value={ebayLocationForm.city}
                        onChange={(event) => updateEbayLocationForm('city', event.target.value)}
                        placeholder={t.ebayLocationCityPlaceholder}
                        className="bg-neutral-800"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ebay-location-postal-code">{t.ebayLocationPostalCodeLabel}</Label>
                      <Input
                        id="ebay-location-postal-code"
                        value={ebayLocationForm.postal_code}
                        onChange={(event) => updateEbayLocationForm('postal_code', event.target.value)}
                        placeholder={t.ebayLocationPostalCodePlaceholder}
                        className="bg-neutral-800"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="ebay-location-address-2">{t.ebayLocationAddressLine2Label}</Label>
                      <Input
                        id="ebay-location-address-2"
                        value={ebayLocationForm.address_line_2}
                        onChange={(event) => updateEbayLocationForm('address_line_2', event.target.value)}
                        placeholder={t.ebayLocationAddressLine2Placeholder}
                        className="bg-neutral-800"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <SaveButton
                      type="button"
                      onClick={() => void handleCreateEbayLocation()}
                      disabled={ebayLocationCreating}
                      className="h-10 min-h-0 px-4 py-0"
                    >
                      {ebayLocationCreating ? t.savingButton : t.ebayCreateLocationButton}
                    </SaveButton>
                  </div>
                </div>
              </div>

              <datalist id="ebay-marketplaces">
                {EBAY_MARKETPLACE_OPTIONS.map((market) => (
                  <option key={market.id} value={market.id}>
                    {market.label}
                  </option>
                ))}
              </datalist>
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
