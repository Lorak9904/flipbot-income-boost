import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, Save, Facebook, Store } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 * i, duration: 0.6, ease: 'easeOut' },
  }),
};

const SettingsPage = () => {
  const { user} = useAuth();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [connectFacebook, setConnectFacebook] = useState(!!user);
  const [connectAllegro, setConnectAllegro] = useState(!!user);
  const [newsletter, setNewsletter] = useState(user ?? true);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
    //   await updateProfile({ displayName, email, password, connectFacebook, connectAllegro, newsletter });
      toast({ title: 'Settings saved', description: 'Your changes have been applied.' });
      setPassword('');
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
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
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-neutral-800" />
              </div>
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

          <div className="text-center">
            <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:to-fuchsia-600 shadow-lg shadow-fuchsia-500/20" onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-5 w-5" /> {saving ? 'Saving…' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SettingsPage;
