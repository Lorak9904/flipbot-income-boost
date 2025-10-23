import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
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
import { Mail, Lock, Save, Facebook, Store, Trash2, AlertTriangle } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';

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

  const [displayName, setDisplayName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [connectFacebook, setConnectFacebook] = useState(!!user);
  const [connectAllegro, setConnectAllegro] = useState(!!user);
  const [newsletter, setNewsletter] = useState(user ?? true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('flipit_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/FlipIt/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: displayName,
          email: email,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      toast({ 
        title: 'Settings saved', 
        description: 'Your profile has been updated successfully.' 
      });
    } catch (e: any) {
      toast({ 
        title: 'Error', 
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
        title: 'Missing fields',
        description: 'Please fill in all password fields',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'New password and confirmation must match',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 8 characters',
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

      const response = await fetch('/api/FlipIt/api/user/change-password', {
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
        title: 'Password changed',
        description: 'Your password has been updated successfully',
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: any) {
      toast({
        title: 'Error',
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

      const response = await fetch('/api/FlipIt/api/user/delete-account', {
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
        title: 'Account deleted',
        description: 'Your account has been permanently deleted',
      });

      // Logout and redirect
      logout();
      navigate('/');
    } catch (e: any) {
      toast({
        title: 'Error',
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
      {/* Unified Animated Gradient Background (reuse HomePage pattern) */}
      <div className="fixed inset-0 -z-20">
        <div className="absolute inset-0 bg-neutral-950" />
        <motion.div className="absolute inset-0" initial={{ opacity: 1 }} animate={{ opacity: [1, 0.7, 1] }} transition={{ duration: 12, repeat: Infinity }} style={{ background: 'radial-gradient(circle at 20% 20%, rgba(236,72,153,.3) 0%, transparent 50%)' }} />
        <motion.div className="absolute inset-0" initial={{ opacity: 0.7 }} animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 14, repeat: Infinity }} style={{ background: 'radial-gradient(circle at 80% 40%, rgba(6,182,212,.25) 0%, transparent 50%)' }} />
        <motion.div className="absolute inset-0" initial={{ opacity: 0.5 }} animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 16, repeat: Infinity }} style={{ background: 'radial-gradient(circle at 40% 80%, rgba(168,85,247,.2) 0%, transparent 50%)' }} />
      </div>

      <section className="relative py-28 text-center">
        <motion.h1 initial="hidden" animate="visible" variants={fadeUp} className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          Account <span className="text-cyan-400">Settings</span>
        </motion.h1>
        <motion.p custom={2} initial="hidden" animate="visible" variants={fadeUp} className="mx-auto mt-4 max-w-xl text-neutral-300">
          Manage your profile, marketplace connections and notifications.
        </motion.p>
      </section>

      <section className="relative pb-32">
        <div className="container mx-auto max-w-3xl px-4">
          {/* Profile */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-12 rounded-2xl bg-neutral-900/50 p-8 backdrop-blur-sm ring-1 ring-cyan-400/20">
            <h2 className="mb-6 text-xl font-semibold">Profile</h2>
            <div className="space-y-6 md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="bg-neutral-800" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-neutral-800" />
              </div>
            </div>
          </motion.div>

          {/* Password Change */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-12 rounded-2xl bg-neutral-900/50 p-8 backdrop-blur-sm ring-1 ring-cyan-400/20">
            <h2 className="mb-6 text-xl font-semibold flex items-center gap-2">
              <Lock className="h-5 w-5 text-cyan-400" />
              Change Password
            </h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input 
                  id="currentPassword" 
                  type="password" 
                  placeholder="Enter current password" 
                  value={currentPassword} 
                  onChange={(e) => setCurrentPassword(e.target.value)} 
                  className="bg-neutral-800" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input 
                  id="newPassword" 
                  type="password" 
                  placeholder="Enter new password (min 8 characters)" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  className="bg-neutral-800" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  placeholder="Confirm new password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  className="bg-neutral-800" 
                />
              </div>
              <Button 
                onClick={handlePasswordChange}
                disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
                className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:to-fuchsia-600"
              >
                <Lock className="mr-2 h-4 w-4" />
                {changingPassword ? 'Changing Password...' : 'Change Password'}
              </Button>
            </div>
          </motion.div>

          {/* Marketplace Connections */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-12 rounded-2xl bg-neutral-900/50 p-8 backdrop-blur-sm ring-1 ring-cyan-400/20">
            <h2 className="mb-6 text-xl font-semibold">Marketplaces</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-neutral-200"><Facebook className="h-5 w-5 text-cyan-400" /> Facebook Marketplace</div>
                <Switch checked={connectFacebook} onCheckedChange={setConnectFacebook} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-neutral-200"><Store className="h-5 w-5 text-cyan-400" /> Allegro</div>
                <Switch checked={connectAllegro} onCheckedChange={setConnectAllegro} />
              </div>
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-16 rounded-2xl bg-neutral-900/50 p-8 backdrop-blur-sm ring-1 ring-cyan-400/20">
            <h2 className="mb-6 text-xl font-semibold">Notifications</h2>
            <div className="flex items-center justify-between">
              <span className="text-neutral-200">Product updates & tips</span>
              <Switch onCheckedChange={setNewsletter} />
            </div>
          </motion.div>

          <div className="text-center mb-12">
            <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:to-fuchsia-600 shadow-lg shadow-fuchsia-500/20" onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-5 w-5" /> {saving ? 'Saving…' : 'Save Profile Settings'}
            </Button>
          </div>

          {/* Danger Zone */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="rounded-2xl bg-red-950/20 p-8 backdrop-blur-sm ring-1 ring-red-500/30">
            <h2 className="mb-6 text-xl font-semibold flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </h2>
            <div className="space-y-4">
              <p className="text-neutral-300 text-sm">
                Once you delete your account, there is no going back. This action will permanently delete your account, all your items, and all associated data.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-neutral-900 border-red-500/30">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-400 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-neutral-300">
                      This action cannot be undone. This will permanently delete your account and remove all your data from our servers, including:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>All your listed items</li>
                        <li>Your profile information</li>
                        <li>All marketplace connections</li>
                        <li>All item statistics and history</li>
                      </ul>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-neutral-800 hover:bg-neutral-700">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      disabled={deletingAccount}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {deletingAccount ? 'Deleting...' : 'Yes, delete my account'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default SettingsPage;
