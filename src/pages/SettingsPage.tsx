import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SaveButton, ManageButton, DeleteButton, ChangePasswordButton } from '@/components/ui/button-presets';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Save, Store, Trash2, AlertTriangle, MapPin } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { getTranslations } from '@/components/language-utils';
import { settingsTranslations } from './settings-translations';
import { CreditsBalanceCard } from '@/components/credits/CreditsBalanceCard';
import { TransactionHistoryModal } from '@/components/credits/TransactionHistoryModal';
import { PlanManagementDialog } from '@/components/credits/PlanManagementDialog';
import { AnimatedGradientBackground } from '@/components/AnimatedGradientBackground';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 * i, duration: 0.6, ease: 'easeOut' },
  }),
};

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const t = getTranslations(settingsTranslations);

  const [displayName, setDisplayName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newsletter, setNewsletter] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const [showPlanManagement, setShowPlanManagement] = useState(false);
  
  // Address fields
  const [addressCity, setAddressCity] = useState('');
  const [addressPostalCode, setAddressPostalCode] = useState('');
  const [addressCountry, setAddressCountry] = useState('');
  const [addressStreet, setAddressStreet] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Load user profile with address on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem('flipit_token');
        if (!token) return;

        const response = await fetch('/api/user/profile/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setDisplayName(data.name || '');
          setEmail(data.email || '');
          setAddressCity(data.address_city || '');
          setAddressPostalCode(data.address_postal_code || '');
          setAddressCountry(data.address_country || '');
          setAddressStreet(data.address_street || '');
        }
      } catch (e) {
        console.error('Failed to load profile:', e);
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('flipit_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/user/profile/', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: displayName,
          email: email,
          address_city: addressCity,
          address_postal_code: addressPostalCode,
          address_country: addressCountry,
          address_street: addressStreet,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to update profile');
      }

      toast({ 
        title: t.toastSettingsSavedTitle, 
        description: t.toastSettingsSavedDescription 
      });
    } catch (e: any) {
      toast({ 
        title: t.toastErrorTitle, 
        description: e.message || 'Failed to save settings', 
        variant: 'destructive' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: t.toastMissingFieldsTitle,
        description: t.toastMissingFieldsDescription,
        variant: 'destructive',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: t.toastPasswordsNoMatchTitle,
        description: t.toastPasswordsNoMatchDescription,
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: t.toastPasswordTooShortTitle,
        description: t.toastPasswordTooShortDescription,
        variant: 'destructive',
      });
      return;
    }

    setChangingPassword(true);
    try {
      const token = localStorage.getItem('flipit_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/user/change-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to change password');
      }

      toast({
        title: t.toastPasswordChangedTitle,
        description: t.toastPasswordChangedDescription,
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: any) {
      toast({
        title: t.toastErrorTitle,
        description: e.message || 'Failed to change password',
        variant: 'destructive',
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      const token = localStorage.getItem('flipit_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/user/delete-account/', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      toast({
        title: t.toastAccountDeletedTitle,
        description: t.toastAccountDeletedDescription,
      });

      // Logout and redirect
      logout();
      navigate('/');
    } catch (e: any) {
      toast({
        title: t.toastErrorTitle,
        description: e.message || 'Failed to delete account',
        variant: 'destructive',
      });
      setDeletingAccount(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <SEOHead
        title="Settings | FlipIt"
        description="Manage your FlipIt account and marketplace connections."
        canonicalUrl="https://myflipit.live/settings"
        robots="noindex, nofollow"
      />
      <AnimatedGradientBackground />

      <section className="relative py-28 text-center">
        <div className="container mx-auto px-4">
          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            {t.pageTitle.split(' ')[0]} <span className="text-cyan-400">{t.pageTitle.split(' ')[1]}</span>
          </motion.h1>
          <motion.p custom={2} initial="hidden" animate="visible" variants={fadeUp} className="mx-auto mt-4 max-w-xl text-neutral-300">
            {t.pageDescription}
          </motion.p>
        </div>
      </section>

      <section className="relative pb-32">
        <div className="container mx-auto max-w-3xl px-4">
          {/* Profile */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-12 rounded-2xl bg-neutral-900/50 p-8 backdrop-blur-sm ring-1 ring-cyan-400/20">
            <h2 className="mb-6 text-xl font-semibold">{t.profileTitle}</h2>
            <div className="space-y-6 md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
              <div className="space-y-2">
                <Label htmlFor="name">{t.displayNameLabel}</Label>
                <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="bg-neutral-800" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t.emailLabel}</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-neutral-800" />
              </div>
            </div>
          </motion.div>

          {/* Default Address */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-12 rounded-2xl bg-neutral-900/50 p-8 backdrop-blur-sm ring-1 ring-cyan-400/20">
            <h2 className="mb-4 text-xl font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-cyan-400" />
              {t.addressTitle}
            </h2>
            <p className="text-neutral-300 text-sm mb-6">{t.addressDescription}</p>
            <div className="space-y-6 md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
              <div className="space-y-2">
                <Label htmlFor="addressCity">{t.addressCityLabel}</Label>
                <Input 
                  id="addressCity" 
                  value={addressCity} 
                  onChange={(e) => setAddressCity(e.target.value)} 
                  placeholder={t.addressCityPlaceholder}
                  className="bg-neutral-800" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addressPostalCode">{t.addressPostalCodeLabel}</Label>
                <Input 
                  id="addressPostalCode" 
                  value={addressPostalCode} 
                  onChange={(e) => setAddressPostalCode(e.target.value)} 
                  placeholder={t.addressPostalCodePlaceholder}
                  className="bg-neutral-800" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addressCountry">{t.addressCountryLabel}</Label>
                <Input 
                  id="addressCountry" 
                  value={addressCountry} 
                  onChange={(e) => setAddressCountry(e.target.value)} 
                  placeholder={t.addressCountryPlaceholder}
                  className="bg-neutral-800" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addressStreet">{t.addressStreetLabel}</Label>
                <Input 
                  id="addressStreet" 
                  value={addressStreet} 
                  onChange={(e) => setAddressStreet(e.target.value)} 
                  placeholder={t.addressStreetPlaceholder}
                  className="bg-neutral-800" 
                />
              </div>
            </div>
          </motion.div>

          {/* Password Change */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-12 rounded-2xl bg-neutral-900/50 p-8 backdrop-blur-sm ring-1 ring-cyan-400/20">
            <h2 className="mb-6 text-xl font-semibold flex items-center gap-2">
              <Lock className="h-5 w-5 text-cyan-400" />
              {t.passwordTitle}
            </h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">{t.currentPasswordLabel}</Label>
                <Input 
                  id="currentPassword" 
                  type="password" 
                  placeholder={t.currentPasswordPlaceholder} 
                  value={currentPassword} 
                  onChange={(e) => setCurrentPassword(e.target.value)} 
                  className="bg-neutral-800" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">{t.newPasswordLabel}</Label>
                <Input 
                  id="newPassword" 
                  type="password" 
                  placeholder={t.newPasswordPlaceholder} 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  className="bg-neutral-800" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t.confirmPasswordLabel}</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  placeholder={t.confirmPasswordPlaceholder} 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  className="bg-neutral-800" 
                />
              </div>
              <ChangePasswordButton 
                onClick={handlePasswordChange}
                disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
              >
                {changingPassword ? t.changingPasswordButton : t.changePasswordButton}
              </ChangePasswordButton>
            </div>
          </motion.div>

          {/* Marketplace Connections - Simplified (Task 3) */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-12 rounded-2xl bg-neutral-900/50 p-8 backdrop-blur-sm ring-1 ring-cyan-400/20">
            <h2 className="mb-4 text-xl font-semibold">{t.marketplacesTitle}</h2>
            <p className="text-neutral-300 text-sm mb-4">
              Connect your marketplace accounts to publish listings directly. Manage your connections in the dedicated tab.
            </p>
            <ManageButton
              onClick={() => navigate('/connect-accounts')}
            >
              Manage Connected Accounts
            </ManageButton>
          </motion.div>

          {/* Subscription & Credits - NEW SECTION */}
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }} 
            variants={fadeUp} 
            className="mb-12"
          >
            <CreditsBalanceCard
              onManagePlan={() => setShowPlanManagement(true)}
              onViewHistory={() => setShowTransactionHistory(true)}
            />
          </motion.div>

          {/* Notifications */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-16 rounded-2xl bg-neutral-900/50 p-8 backdrop-blur-sm ring-1 ring-cyan-400/20">
            <h2 className="mb-6 text-xl font-semibold">{t.notificationsTitle}</h2>
            <div className="flex items-center justify-between">
              <span className="text-neutral-200">{t.productUpdates}</span>
              <Switch onCheckedChange={setNewsletter} />
            </div>
          </motion.div>

          <div className="text-center mb-12">
            <SaveButton onClick={handleSave} disabled={saving}>
              {saving ? t.savingButton : t.saveButton}
            </SaveButton>
          </div>

          {/* Danger Zone */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="rounded-2xl bg-red-950/20 p-8 backdrop-blur-sm ring-1 ring-red-500/30">
            <h2 className="mb-6 text-xl font-semibold flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-5 w-5" />
              {t.dangerZoneTitle}
            </h2>
            <div className="space-y-4">
              <p className="text-neutral-300 text-sm">
                {t.dangerZoneDescription}
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DeleteButton>
                    {t.deleteAccountButton}
                  </DeleteButton>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-neutral-900 border-red-500/30">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-400 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      {t.deleteDialogTitle}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-neutral-300">
                      {t.deleteDialogDescription}
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>{t.deleteDialogListItem1}</li>
                        <li>{t.deleteDialogListItem2}</li>
                        <li>{t.deleteDialogListItem3}</li>
                        <li>{t.deleteDialogListItem4}</li>
                      </ul>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-neutral-800 hover:bg-neutral-700">
                      {t.deleteDialogCancel}
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      disabled={deletingAccount}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {deletingAccount ? t.deletingDialogConfirm : t.deleteDialogConfirm}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Modals */}
      <TransactionHistoryModal
        open={showTransactionHistory}
        onOpenChange={setShowTransactionHistory}
      />
      <PlanManagementDialog
        open={showPlanManagement}
        onOpenChange={setShowPlanManagement}
      />
    </div>
  );
};

export default SettingsPage;
