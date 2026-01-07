import { AnimatedGradientBackground } from '@/components/AnimatedGradientBackground';
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
  AddItemButton,
  NavbarLogin,
  NavbarSignup,
} from '@/components/ui/button-presets';

/**
 * ButtonsPage - Development showcase for all button presets
 * Route: /dev/buttons
 * 
 * This page displays all available button presets from button-presets.tsx
 * Use this page to preview button styles and test hover states
 */
const ButtonsPage = () => {
  return (
    <>
      <AnimatedGradientBackground />
      
      <div className="relative min-h-screen py-20 px-4">
        <div className="max-w-6xl mx-auto space-y-16">
          
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-white">Button Presets Showcase</h1>
            <p className="text-neutral-300">All available button components from button-presets.tsx</p>
          </div>

          {/* Hero & CTA Buttons */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-white border-b border-neutral-700 pb-2">
              Hero & CTA Buttons
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-neutral-900/50 backdrop-blur-sm p-8 rounded-lg">
              <div className="space-y-3">
                <p className="text-sm text-neutral-400 font-mono">HeroCTA</p>
                <HeroCTA>Get Started Now</HeroCTA>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-neutral-400 font-mono">HeroCTAWithArrow</p>
                <HeroCTAWithArrow>Add Your First Item</HeroCTAWithArrow>
              </div>
            </div>
          </section>

          {/* Secondary Actions */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-white border-b border-neutral-700 pb-2">
              Secondary Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-neutral-900/50 backdrop-blur-sm p-8 rounded-lg">
              <div className="space-y-3">
                <p className="text-sm text-neutral-400 font-mono">SecondaryAction</p>
                <SecondaryAction>How it works</SecondaryAction>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-neutral-400 font-mono">SecondaryActionWithArrow</p>
                <SecondaryActionWithArrow>Learn More</SecondaryActionWithArrow>
              </div>
            </div>
          </section>

          {/* Form Buttons */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-white border-b border-neutral-700 pb-2">
              Form Buttons
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-neutral-900/50 backdrop-blur-sm p-8 rounded-lg">
              <div className="space-y-3">
                <p className="text-sm text-neutral-400 font-mono">AuthButton</p>
                <AuthButton>Sign In</AuthButton>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-neutral-400 font-mono">AuthButton (disabled)</p>
                <AuthButton disabled>Creating Account...</AuthButton>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-neutral-400 font-mono">WaitlistButton</p>
                <WaitlistButton>Join Waitlist</WaitlistButton>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-neutral-400 font-mono">SaveButton</p>
                <SaveButton>Save Changes</SaveButton>
              </div>
            </div>
          </section>

          {/* Navbar Buttons */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-white border-b border-neutral-700 pb-2">
              Navbar Buttons
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-neutral-900/50 backdrop-blur-sm p-8 rounded-lg">
              <div className="space-y-3">
                <p className="text-sm text-neutral-400 font-mono">NavbarLogin</p>
                <NavbarLogin>Log in</NavbarLogin>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-neutral-400 font-mono">NavbarSignup</p>
                <NavbarSignup>Sign up</NavbarSignup>
              </div>
            </div>
          </section>

          {/* Navigation Buttons */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-white border-b border-neutral-700 pb-2">
              Navigation Buttons
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-neutral-900/50 backdrop-blur-sm p-8 rounded-lg">
              <div className="space-y-3">
                <p className="text-sm text-neutral-400 font-mono">BackButtonGhost</p>
                <BackButtonGhost>Back to Items</BackButtonGhost>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-neutral-400 font-mono">BackButtonGradient</p>
                <BackButtonGradient>Back to Items</BackButtonGradient>
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-white border-b border-neutral-700 pb-2">
              Action Buttons
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-neutral-900/50 backdrop-blur-sm p-8 rounded-lg">
              <div className="space-y-3">
                <p className="text-sm text-neutral-400 font-mono">ManageButton</p>
                <ManageButton>Manage Accounts</ManageButton>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-neutral-400 font-mono">SyncButton</p>
                <SyncButton>Sync Address</SyncButton>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-neutral-400 font-mono">SyncButton (loading)</p>
                <SyncButton isLoading>Syncing...</SyncButton>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-neutral-400 font-mono">ChangePasswordButton</p>
                <ChangePasswordButton>Change Password</ChangePasswordButton>
              </div>
            </div>
          </section>

          {/* Destructive Actions */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-white border-b border-neutral-700 pb-2">
              Destructive Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-neutral-900/50 backdrop-blur-sm p-8 rounded-lg">
              <div className="space-y-3">
                <p className="text-sm text-neutral-400 font-mono">DeleteButton</p>
                <DeleteButton>Delete Account</DeleteButton>
              </div>
            </div>
          </section>

          {/* Pagination & List Actions */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-white border-b border-neutral-700 pb-2">
              Pagination & List Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-neutral-900/50 backdrop-blur-sm p-8 rounded-lg">
              <div className="space-y-3">
                <p className="text-sm text-neutral-400 font-mono">PaginationButton</p>
                <div className="flex gap-2">
                  <PaginationButton>Previous</PaginationButton>
                  <PaginationButton>Next</PaginationButton>
                  <PaginationButton disabled>Disabled</PaginationButton>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-neutral-400 font-mono">AddItemButton</p>
                <AddItemButton>Add Item</AddItemButton>
              </div>
            </div>
          </section>

        </div>
      </div>
    </>
  );
};

export default ButtonsPage;
