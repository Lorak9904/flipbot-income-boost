import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  HeroCTA,
  HeroCTAWithArrow,
  SecondaryAction,
  SecondaryActionWithArrow,
  AuthButton,
  WaitlistButton,
  SaveButton,
  BackButtonGhost,
  BackButtonGradient,
  ManageButton,
  SyncButton,
  ChangePasswordButton,
  DeleteButton,
  PaginationButton,
  AddItemButton
} from '@/components/ui/button-presets';
import { 
  ArrowRight, 
  Upload, 
  Download, 
  Trash2, 
  Settings, 
  Plus, 
  Save, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  Lock,
  Store
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedGradientBackground } from '@/components/AnimatedGradientBackground';

const ButtonShowcase = () => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const simulateLoading = (id: string) => {
    setLoadingStates(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setLoadingStates(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-neutral-950 text-white">
      <AnimatedGradientBackground />

      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">
            FlipIt Button Presets
          </h1>
          <p className="text-neutral-400 text-lg">
            Centralized button components used across the application
          </p>
          <p className="text-neutral-500 text-sm mt-2">
            Dev Reference • /dev/buttons • Single source of truth
          </p>
        </div>

        <div className="space-y-8">
          {/* Hero & CTA Buttons */}
          <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-cyan-400">Hero & CTA Buttons</CardTitle>
              <CardDescription>Primary call-to-action buttons for landing pages and major actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">HeroCTA</h3>
                <p className="text-sm text-neutral-400 mb-3">
                  Gradient button • Used in: HomePage, PricingPage, FAQPage, NotFound, FeaturesPage, SuccessStoriesPage, ConnectAccountsPage
                </p>
                <div className="flex flex-wrap gap-4">
                  <HeroCTA>Get Started Now</HeroCTA>
                  <HeroCTA disabled>Disabled State</HeroCTA>
                  <HeroCTA asChild>
                    <Link to="/get-started">With Link</Link>
                  </HeroCTA>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">HeroCTAWithArrow</h3>
                <p className="text-sm text-neutral-400 mb-3">
                  Gradient button with arrow • Used in: HowItWorksPage, GetStartedPage
                </p>
                <div className="flex flex-wrap gap-4">
                  <HeroCTAWithArrow>Add Your First Item</HeroCTAWithArrow>
                  <Link to="/add-item">
                    <HeroCTAWithArrow>Get Early Access</HeroCTAWithArrow>
                  </Link>
                </div>
                <p className="text-xs text-amber-400 mt-2">
                  ⚠️ Cannot use asChild - arrow is built-in. Wrap Link around component instead.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Secondary Actions */}
          <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-cyan-400">Secondary Actions</CardTitle>
              <CardDescription>Less prominent CTAs with cyan outline styling</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">SecondaryAction</h3>
                <p className="text-sm text-neutral-400 mb-3">
                  Cyan outline • Used in: HomePage, FAQPage
                </p>
                <div className="flex flex-wrap gap-4">
                  <SecondaryAction>How it works</SecondaryAction>
                  <SecondaryAction>Read the Playbook</SecondaryAction>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">SecondaryActionWithArrow</h3>
                <p className="text-sm text-neutral-400 mb-3">
                  Cyan outline with arrow • Used in: HomePage
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/how-it-works">
                    <SecondaryActionWithArrow>How it works</SecondaryActionWithArrow>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Buttons */}
          <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-cyan-400">Form Buttons</CardTitle>
              <CardDescription>Buttons for authentication, settings, and data entry</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">AuthButton</h3>
                <p className="text-sm text-neutral-400 mb-3">
                  Full-width gradient • Used in: LoginPage
                </p>
                <div className="max-w-md">
                  <AuthButton>Sign In</AuthButton>
                  <AuthButton disabled className="mt-2">Creating Account...</AuthButton>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">WaitlistButton</h3>
                <p className="text-sm text-neutral-400 mb-3">
                  Full-width gradient • Used in: GetStartedPage
                </p>
                <div className="max-w-md">
                  <WaitlistButton>Join Waitlist</WaitlistButton>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">SaveButton</h3>
                <p className="text-sm text-neutral-400 mb-3">
                  Gradient with save icon • Used in: SettingsPage, PlatformSettingsPage
                </p>
                <div className="flex flex-wrap gap-4">
                  <SaveButton onClick={() => simulateLoading('save')} disabled={loadingStates['save']}>
                    {loadingStates['save'] ? 'Saving...' : 'Save Changes'}
                  </SaveButton>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">ChangePasswordButton</h3>
                <p className="text-sm text-neutral-400 mb-3">
                  Gradient with lock icon • Used in: SettingsPage
                </p>
                <div className="flex flex-wrap gap-4">
                  <ChangePasswordButton>Change Password</ChangePasswordButton>
                  <ChangePasswordButton disabled>Changing Password...</ChangePasswordButton>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-cyan-400">Navigation Buttons</CardTitle>
              <CardDescription>Back buttons and navigation controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">BackButtonGhost</h3>
                <p className="text-sm text-neutral-400 mb-3">
                  Subtle ghost style with arrow • Used in: ItemDetailPage, PlatformSettingsPage
                </p>
                <div className="flex flex-wrap gap-4">
                  <BackButtonGhost onClick={() => {}}>Back to Items</BackButtonGhost>
                  <BackButtonGhost onClick={() => {}}>Back to Connected Accounts</BackButtonGhost>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">BackButtonGradient</h3>
                <p className="text-sm text-neutral-400 mb-3">
                  Prominent gradient style • Used in: ItemDetailPage (error states), UserItemsPage
                </p>
                <div className="flex flex-wrap gap-4">
                  <BackButtonGradient onClick={() => {}}>Back to Items</BackButtonGradient>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">PaginationButton</h3>
                <p className="text-sm text-neutral-400 mb-3">
                  Outline style for pagination • Used in: UserItemsPage
                </p>
                <div className="flex flex-wrap gap-4">
                  <PaginationButton onClick={() => {}}>
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </PaginationButton>
                  <PaginationButton onClick={() => {}}>
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </PaginationButton>
                  <PaginationButton disabled>
                    <ChevronLeft className="h-4 w-4" />
                    Disabled
                  </PaginationButton>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-cyan-400">Action Buttons</CardTitle>
              <CardDescription>Settings, management, and utility actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">ManageButton</h3>
                <p className="text-sm text-neutral-400 mb-3">
                  Cyan outline with icon • Used in: SettingsPage
                </p>
                <div className="flex flex-wrap gap-4">
                  <ManageButton onClick={() => {}}>Manage Connected Accounts</ManageButton>
                  <ManageButton onClick={() => {}} icon={Store}>Custom Icon</ManageButton>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">SyncButton</h3>
                <p className="text-sm text-neutral-400 mb-3">
                  Small cyan outline with loading state • Used in: PlatformSettingsPage
                </p>
                <div className="flex flex-wrap gap-4">
                  <SyncButton onClick={() => simulateLoading('sync')} isLoading={loadingStates['sync']}>
                    Sync Address
                  </SyncButton>
                  <SyncButton isLoading={true}>Syncing...</SyncButton>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">AddItemButton</h3>
                <p className="text-sm text-neutral-400 mb-3">
                  Gradient style • Used in: UserItemsPage (empty state, retry)
                </p>
                <div className="flex flex-wrap gap-4">
                  <AddItemButton onClick={() => {}}>Add Item</AddItemButton>
                  <AddItemButton onClick={() => {}}>Retry</AddItemButton>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Destructive Actions */}
          <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-red-400">Destructive Actions</CardTitle>
              <CardDescription>Delete and remove operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">DeleteButton</h3>
                <p className="text-sm text-neutral-400 mb-3">
                  Red destructive with trash icon • Used in: SettingsPage
                </p>
                <div className="flex flex-wrap gap-4">
                  <DeleteButton onClick={() => {}}>Delete Account</DeleteButton>
                  <DeleteButton disabled>Deleting...</DeleteButton>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Implementation Guide */}
          <Card className="bg-neutral-900/50 border-cyan-400/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-cyan-400">Implementation Guide</CardTitle>
              <CardDescription>How to use button presets in your pages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-neutral-800/50 p-4 rounded-lg">
                <p className="text-sm text-neutral-300 font-mono mb-2">Import:</p>
                <code className="text-xs text-cyan-400">
                  import {'{'} HeroCTA, SaveButton {'}'} from '@/components/ui/button-presets';
                </code>
              </div>
              
              <div className="bg-neutral-800/50 p-4 rounded-lg">
                <p className="text-sm text-neutral-300 font-mono mb-2">Usage:</p>
                <code className="text-xs text-cyan-400">
                  {'<HeroCTA onClick={handleClick}>Click Me</HeroCTA>'}
                </code>
              </div>

              <div className="bg-neutral-800/50 p-4 rounded-lg">
                <p className="text-sm text-neutral-300 font-mono mb-2">With Link (asChild):</p>
                <code className="text-xs text-cyan-400">
                  {'<HeroCTA asChild><Link to="/page">Go</Link></HeroCTA>'}
                </code>
              </div>

              <div className="bg-amber-900/20 border border-amber-500/30 p-4 rounded-lg">
                <p className="text-sm text-amber-400 font-semibold mb-2">⚠️ Important: Arrow Variants</p>
                <p className="text-xs text-neutral-300 mb-2">
                  Buttons with arrows (HeroCTAWithArrow, SecondaryActionWithArrow) cannot use asChild.
                </p>
                <code className="text-xs text-cyan-400 block mt-2">
                  {'<Link to="/page"><HeroCTAWithArrow>Text</HeroCTAWithArrow></Link>'}
                </code>
              </div>

              <div className="bg-cyan-900/20 border border-cyan-500/30 p-4 rounded-lg">
                <p className="text-sm text-cyan-400 font-semibold mb-2">✨ Benefits</p>
                <ul className="text-xs text-neutral-300 space-y-1 list-disc list-inside">
                  <li>Change style once → updates everywhere automatically</li>
                  <li>Type-safe with TypeScript</li>
                  <li>Consistent design across 13+ pages</li>
                  <li>Built-in accessibility and loading states</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* File Location */}
          <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl text-white">Source Code</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-400 mb-2">All button presets defined in:</p>
              <code className="text-cyan-400 text-sm">
                frontend/src/components/ui/button-presets.tsx
              </code>
              <p className="text-xs text-neutral-500 mt-4">
                15 reusable presets • Single source of truth • 13 pages refactored
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ButtonShowcase;
