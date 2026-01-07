/**
 * Button Presets - Centralized button configurations for FlipIt
 * 
 * This file defines all button variants used across the application.
 * When you need to change a button style globally, update it here.
 * 
 * Usage:
 * import { HeroCTA, SecondaryAction, SaveButton } from '@/components/ui/button-presets';
 * <HeroCTA>Get Started</HeroCTA>
 */

import React from 'react';
import { Button, ButtonProps } from './button';
import { ArrowRight, Save, Trash2, Settings, Download, ArrowLeft, Check } from 'lucide-react';

// ============================================================================
// HERO & CTA BUTTONS (Landing Pages, Major Actions)
// ============================================================================

/**
 * HeroCTA - Primary call-to-action for landing pages
 * Used in: HomePage, HowItWorksPage, PricingPage, GetStartedPage, SuccessStoriesPage, NotFound
 * Example: "Get Started Now", "Join Waitlist", "Start Free Trial"
 * 
 * UX Improvements:
 * - Added white border for better separation from gradient background
 * - Enhanced shadow with blur and spread for depth
 * - Hover state includes scale transform and intensified glow
 * - Ring offset creates clear focus state for accessibility
 */
export const HeroCTA = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', children, ...props }, ref) => (
    <Button
      ref={ref}
      size="lg"
      className={`
        bg-cyan-500
hover:bg-cyan-400
active:bg-cyan-600
text-black font-bold button-fluid-text leading-[1.2]
rounded-full px-4 sm:px-6 md:px-8 lg:px-10 py-2.5 sm:py-3 md:py-4 lg:py-6
w-full sm:w-auto
min-w-0 flex-shrink min-h-[52px]
text-balance
shadow-md
transition-colors duration-150

        ${className}`}
      {...props}
    >
      {children}
    </Button>
  )
);
HeroCTA.displayName = 'HeroCTA';

/**
 * HeroCTAWithArrow - Hero CTA with right arrow icon
 * Used in: HowItWorksPage, GetStartedPage
 * Example: "Add Your First Item →", "Get Early Access →"
 */
export const HeroCTAWithArrow = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', children, ...props }, ref) => (
    <HeroCTA ref={ref} className={className} {...props}>
      {children} <ArrowRight className="ml-2 h-5 w-5" />
    </HeroCTA>
  )
);
HeroCTAWithArrow.displayName = 'HeroCTAWithArrow';

/**
 * GhostIconButton - Icon-only ghost button (kebab/ellipsis etc.)
 * size: 'md' (36px) or 'lg' (44px) to match CTA rows
 */
export const GhostIconButton = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & { sizeVariant?: 'md' | 'lg' }
>(({ className = '', children, sizeVariant = 'md', ...props }, ref) => {
  const sizeClass = sizeVariant === 'lg' ? 'h-12 w-12' : 'h-9 w-9';
  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={`${sizeClass} rounded-full bg-neutral-800/80 text-white hover:bg-neutral-700 hover:text-white border border-neutral-700/60 ${className}`}
      {...props}
    >
      {children}
    </Button>
  );
});
GhostIconButton.displayName = 'GhostIconButton';

// ============================================================================
// SECONDARY ACTIONS (Less Prominent CTAs)
// ============================================================================

/**
 * SecondaryAction - Outline button with cyan accent
 * Used in: HomePage, FAQPage, SettingsPage
 * Example: "How it works", "Read the Playbook", "Manage Connected Accounts"
 * 
 * UX Improvements:
 * - Added backdrop blur for glass morphism effect
 * - Stronger background opacity for better contrast
 * - Enhanced glow on hover with dual shadow
 * - Brighter text and border for visibility
 */
export const SecondaryAction = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', children, ...props }, ref) => (
    <Button
      ref={ref}
      variant="outline"
      size="lg"
      className={`rounded-full border-2 border-cyan-400/70 text-cyan-200 button-fluid-text leading-[1.2] bg-cyan-950/30 backdrop-blur-sm
 px-4 sm:px-6 md:px-8 lg:px-10 py-2.5 sm:py-3 md:py-4 lg:py-6
 w-full sm:w-auto
 min-w-0 flex-shrink min-h-[52px]
 text-balance
 hover:bg-cyan-500/20 hover:border-cyan-300 hover:text-white
 hover:shadow-[0_0_30px_rgba(6,182,212,0.4),0_0_10px_rgba(6,182,212,0.2)]
 transition-all duration-300 hover:scale-[1.02]
 focus-visible:ring-4 focus-visible:ring-cyan-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950
 ${className}`}
      {...props}
    >
      {children}
    </Button>
  )
);
SecondaryAction.displayName = 'SecondaryAction';

/**
 * SecondaryActionWithArrow - Secondary action with right arrow
 * Used in: HomePage
 * Example: "How it works →"
 */
export const SecondaryActionWithArrow = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', children, ...props }, ref) => (
    <SecondaryAction ref={ref} className={className} {...props}>
      {children} <ArrowRight className="ml-2 h-5 w-5" />
    </SecondaryAction>
  )
);
SecondaryActionWithArrow.displayName = 'SecondaryActionWithArrow';

// ============================================================================
// FORM BUTTONS (Auth, Settings, Data Entry)
// ============================================================================

/**
 * AuthButton - Full-width gradient button for login/signup
 * Used in: LoginPage
 * Example: "Sign In", "Create Account"
 * 
 * UX Improvements:
 * - Stronger shadow for better depth on gradient background
 * - Enhanced hover state with brighter gradient
 * - Focus ring for keyboard navigation
 * - Disabled state with reduced glow
 */
/**
 * AuthButton - Full-width button for login/signup
 * Used in: LoginPage
 * Example: "Sign In", "Create Account"
 * 
 * UX: Solid cyan fill variant for form submission prominence
 * - Full width for form alignment
 * - Bold text for action clarity
 * - Disabled state prevents interaction feedback
 */
export const AuthButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', children, ...props }, ref) => (
    <Button
      ref={ref}
      size="lg"
      className={`rounded-full w-full border-2 border-cyan-400/70 text-white bg-cyan-600/90 backdrop-blur-sm
        text-sm sm:text-base py-3 sm:py-4 px-6 sm:px-8
        hover:bg-cyan-500 hover:border-cyan-300
        hover:shadow-[0_0_30px_rgba(6,182,212,0.4),0_0_10px_rgba(6,182,212,0.2)]
        transition-all duration-300 hover:scale-[1.02]
        focus-visible:ring-4 focus-visible:ring-cyan-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950
        font-semibold
        disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-cyan-600/90
        ${className}`}
      {...props}
    >
      {children}
    </Button>
  )
);
AuthButton.displayName = 'AuthButton';

/**
 * WaitlistButton - Full-width button for waitlist forms
 * Used in: GetStartedPage
 * Example: "Join Waitlist"
 * 
 * UX Improvements:
 * - Enhanced with borders and dual shadows
 * - Brighter hover gradient
 * - Better depth separation from background
 */
/**
 * WaitlistButton - Full-width button for waitlist forms
 * Used in: GetStartedPage
 * Example: "Join Waitlist"
 * 
 * UX: Solid cyan fill with larger padding for form prominence
 * - Larger text and padding for importance
 * - Full width for form alignment
 */
export const WaitlistButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', children, ...props }, ref) => (
    <Button
      ref={ref}
      className={`rounded-full w-full py-4 sm:py-5 md:py-6 text-base sm:text-lg md:text-xl font-semibold
        border-2 border-cyan-400/70 text-white bg-cyan-600/90 backdrop-blur-sm
        hover:bg-cyan-500 hover:border-cyan-300
        hover:shadow-[0_0_30px_rgba(6,182,212,0.4),0_0_10px_rgba(6,182,212,0.2)]
        transition-all duration-300 hover:scale-[1.02]
        focus-visible:ring-4 focus-visible:ring-cyan-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950
        ${className}`}
      {...props}
    >
      {children}
    </Button>
  )
);
WaitlistButton.displayName = 'WaitlistButton';

/**
 * SaveButton - Button for saving changes in forms/settings
 * Used in: SettingsPage, PlatformSettingsPage
 * Example: "Save Changes"
 * 
 * UX Improvements:
 * - Enhanced glow to stand out from background
 * - Border for better separation
 * - Pulse animation on hover for action confirmation
 */
/**
 * SaveButton - Button for saving changes in forms/settings
 * Used in: SettingsPage, PlatformSettingsPage
 * Example: "Save Changes"
 * 
 * UX: Solid cyan fill for save action prominence
 * - Icon for action recognition
 * - Bold for importance
 */
export const SaveButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', children, ...props }, ref) => (
    <Button
      ref={ref}
      size="lg"
      className={`rounded-full border-2 border-cyan-400/70 text-white bg-cyan-600/90 backdrop-blur-sm
        hover:bg-cyan-500 hover:border-cyan-300
        hover:shadow-[0_0_30px_rgba(6,182,212,0.4),0_0_10px_rgba(6,182,212,0.2)]
        transition-all duration-300 hover:scale-[1.02]
        focus-visible:ring-4 focus-visible:ring-cyan-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950
        font-semibold
        ${className}`}
      {...props}
    >
      <Save className="mr-2 h-5 w-5" />
      {children}
    </Button>
  )
);
SaveButton.displayName = 'SaveButton';

// ============================================================================
// NAVIGATION BUTTONS (Back, Cancel, etc.)
// ============================================================================

/**
 * BackButtonGhost - Ghost variant for back navigation
 * Used in: ItemDetailPage, PlatformSettingsPage
 * Example: "← Back to Items", "← Back to Connected Accounts"
 * 
 * UX Improvements:
 * - Added subtle background for better visibility
 * - Backdrop blur for glass effect
 * - Enhanced hover with glow
 * - Brighter text for readability
 */
export const BackButtonGhost = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', children, ...props }, ref) => (
    <Button
      ref={ref}
      variant="ghost"
      className={`rounded-full text-neutral-200 hover:text-white 
        bg-neutral-900/30 hover:bg-neutral-800/50 backdrop-blur-sm
        border border-neutral-700/50 hover:border-neutral-600
        hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]
        transition-all duration-300
        focus-visible:ring-2 focus-visible:ring-neutral-500/50
        ${className}`}
      {...props}
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      {children}
    </Button>
  )
);
BackButtonGhost.displayName = 'BackButtonGhost';

/**
 * BackButtonGradient - Gradient variant for back navigation
 * Used in: ItemDetailPage, UserItemsPage (error states)
 * Example: "Back to Items"
 * 
 * UX Improvements:
 * - Enhanced gradient with via color
 * - Borders and shadows for depth
 * - Brighter hover state for feedback
 */
/**
 * BackButtonGradient - Navigation button (now solid cyan)
 * Used in: ItemDetailPage, UserItemsPage (error states)
 * Example: "Back to Items"
 * 
 * UX: Solid cyan fill for prominent back navigation
 */
export const BackButtonGradient = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', children, ...props }, ref) => (
    <Button
      ref={ref}
      className={`rounded-full border-2 border-cyan-400/70 text-white bg-cyan-600/90 backdrop-blur-sm
        hover:bg-cyan-500 hover:border-cyan-300
        hover:shadow-[0_0_30px_rgba(6,182,212,0.4),0_0_10px_rgba(6,182,212,0.2)]
        transition-all duration-300 hover:scale-[1.02]
        focus-visible:ring-4 focus-visible:ring-cyan-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950
        ${className}`}
      {...props}
    >
      {children}
    </Button>
  )
);
BackButtonGradient.displayName = 'BackButtonGradient';

// ============================================================================
// ACTION BUTTONS (Settings, Management)
// ============================================================================

/**
 * ManageButton - Outline button with cyan styling for management actions
 * Used in: SettingsPage
 * Example: "Manage Connected Accounts"
 * 
 * UX Improvements:
 * - Glass morphism with backdrop blur
 * - Enhanced border and text contrast
 * - Glow effect on hover
 */
export const ManageButton = React.forwardRef<HTMLButtonElement, ButtonProps & { icon?: React.ElementType }>(
  ({ className = '', children, icon: Icon = Settings, ...props }, ref) => (
    <Button
      ref={ref}
      variant="outline"
      className={`rounded-full text-cyan-300 border-2 border-cyan-400/70 
        bg-cyan-950/30 hover:bg-cyan-500/20 backdrop-blur-sm
        hover:border-cyan-300 hover:text-white
        hover:shadow-[0_0_25px_rgba(6,182,212,0.35)]
        transition-all duration-300
        focus-visible:ring-4 focus-visible:ring-cyan-500/50
        ${className}`}
      {...props}
    >
      <Icon className="mr-2 h-4 w-4" />
      {children}
    </Button>
  )
);
ManageButton.displayName = 'ManageButton';

/**
 * SyncButton - Small outline button for sync actions
 * Used in: PlatformSettingsPage
 * Example: "Sync Address"
 * 
 * UX Improvements:
 * - Glass morphism with backdrop blur
 * - Readable text contrast (cyan-300 → white on hover)
 * - Enhanced glow effect
 * - Loading state with spinner
 */
export const SyncButton = React.forwardRef<HTMLButtonElement, ButtonProps & { isLoading?: boolean }>(
  ({ className = '', children, isLoading = false, ...props }, ref) => (
    <Button
      ref={ref}
      variant="outline"
      size="sm"
      className={`rounded-full text-cyan-300 border-2 border-cyan-400/70 
        bg-cyan-950/30 hover:bg-cyan-500/20 backdrop-blur-sm
        hover:border-cyan-300 hover:text-white
        hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        focus-visible:ring-2 focus-visible:ring-cyan-500/50
        ${className}`}
      disabled={isLoading}
      {...props}
    >
      <Download className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
      {children}
    </Button>
  )
);
SyncButton.displayName = 'SyncButton';

/**
 * ChangePasswordButton - Gradient button for password change
 * Used in: SettingsPage
 * Example: "Change Password"
 * 
 * UX Improvements:
 * - Enhanced gradient with via color
 * - Borders and shadows for depth
 * - Brighter hover state
 */
/**
 * ChangePasswordButton - Button for password change
 * Used in: SettingsPage
 * Example: "Change Password"
 * 
 * UX: Solid cyan fill for security action prominence
 */
export const ChangePasswordButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', children, ...props }, ref) => (
    <Button
      ref={ref}
      className={`rounded-full border-2 border-cyan-400/70 text-white bg-cyan-600/90 backdrop-blur-sm
        hover:bg-cyan-500 hover:border-cyan-300
        hover:shadow-[0_0_30px_rgba(6,182,212,0.4),0_0_10px_rgba(6,182,212,0.2)]
        transition-all duration-300 hover:scale-[1.02]
        focus-visible:ring-4 focus-visible:ring-cyan-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950
        font-semibold
        ${className}`}
      {...props}
    >
      <Settings className="mr-2 h-4 w-4" />
      {children}
    </Button>
  )
);
ChangePasswordButton.displayName = 'ChangePasswordButton';

// ============================================================================
// NAVBAR BUTTONS (Navigation-specific CTAs)
// ============================================================================

/**
 * NavbarLogin - Ghost variant for navbar login link
 * Used in: Navbar
 * Example: "Log in"
 * 
 * UX: Subtle ghost button for secondary navbar action
 */
export const NavbarLogin = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', children, ...props }, ref) => (
    <Button
      ref={ref}
      variant="ghost"
      className={`rounded-full text-cyan-400 hover:bg-cyan-400/10 hover:text-cyan-300
        transition-colors duration-200
        ${className}`}
      {...props}
    >
      {children}
    </Button>
  )
);
NavbarLogin.displayName = 'NavbarLogin';

/**
 * NavbarSignup - Primary CTA for navbar signup
 * Used in: Navbar
 * Example: "Sign up", "Get Started"
 * 
 * UX: Solid cyan fill for primary acquisition action
 */
export const NavbarSignup = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', children, ...props }, ref) => (
    <Button
      ref={ref}
      className={`rounded-full border-2 border-cyan-400/70 text-white bg-cyan-600/90 backdrop-blur-sm
        hover:bg-cyan-500 hover:border-cyan-300
        hover:shadow-[0_0_30px_rgba(6,182,212,0.4),0_0_10px_rgba(6,182,212,0.2)]
        transition-all duration-300 hover:scale-[1.02]
        focus-visible:ring-4 focus-visible:ring-cyan-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950
        font-semibold
        ${className}`}
      {...props}
    >
      {children}
    </Button>
  )
);
NavbarSignup.displayName = 'NavbarSignup';

// ============================================================================
// DESTRUCTIVE ACTIONS (Delete, Remove)
// ============================================================================

/**
 * DeleteButton - Red destructive button for delete actions
 * Used in: SettingsPage
 * Example: "Delete Account"
 * 
 * UX Improvements:
 * - Enhanced with warning glow (red shadow)
 * - Border for better separation
 * - Stronger hover feedback for destructive action
 */
export const DeleteButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', children, ...props }, ref) => (
    <Button
      ref={ref}
      variant="destructive"
      className={`rounded-full bg-red-600 hover:bg-red-700 
        border-2 border-red-500/50 hover:border-red-400
        shadow-[0_0_25px_rgba(220,38,38,0.3)] 
        hover:shadow-[0_0_40px_rgba(220,38,38,0.5)]
        transition-all duration-300 hover:scale-[1.02]
        focus-visible:ring-4 focus-visible:ring-red-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950
        ${className}`}
      {...props}
    >
      <Trash2 className="mr-2 h-4 w-4" />
      {children}
    </Button>
  )
);
DeleteButton.displayName = 'DeleteButton';

// ============================================================================
// PAGINATION & LIST ACTIONS
// ============================================================================

/**
 * PaginationButton - Outline button for pagination controls
 * Used in: UserItemsPage
 * Example: "Previous", "Next"
 * 
 * UX Improvements:
 * - Opaque background for better visibility
 * - Backdrop blur for glass effect
 * - Enhanced hover state with subtle glow
 * - Better disabled state visual
 */
export const PaginationButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', children, ...props }, ref) => (
    <Button
      ref={ref}
      variant="outline"
      size="sm"
      className={`rounded-full bg-neutral-800/80 hover:bg-neutral-700/90 backdrop-blur-sm
        border-2 border-neutral-600/70 hover:border-neutral-500 
        text-neutral-200 hover:text-white 
        hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]
        transition-all duration-200
        disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-neutral-800/80
        focus-visible:ring-2 focus-visible:ring-neutral-500/50
        ${className}`}
      {...props}
    >
      {children}
    </Button>
  )
);
PaginationButton.displayName = 'PaginationButton';

/**
 * AddItemButton - Button for adding new items
 * Used in: UserItemsPage (empty state)
 * Example: "Add Item", "Retry"
 * 
 * UX: Solid cyan fill for creation action prominence
 */
export const AddItemButton = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & { sizeVariant?: 'md' | 'lg' }
>(
  ({ className = '', children, sizeVariant = 'lg', ...props }, ref) => {
    const sizeClass =
      sizeVariant === 'lg'
        ? 'px-4 sm:px-6 md:px-8 lg:px-10 py-2.5 sm:py-3 md:py-4 lg:py-6'
        : 'h-10 min-h-0 px-4 py-0';
    const buttonSize = sizeVariant === 'lg' ? 'lg' : 'default';
    return (
      <Button
        ref={ref}
        size={buttonSize}
        className={`rounded-full border-2 border-cyan-400/70 text-white bg-cyan-600/90 backdrop-blur-sm
        hover:bg-cyan-500 hover:border-cyan-300
        hover:shadow-[0_0_30px_rgba(6,182,212,0.4),0_0_10px_rgba(6,182,212,0.2)]
        transition-all duration-300 hover:scale-[1.02]
        focus-visible:ring-4 focus-visible:ring-cyan-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950
        font-semibold button-fluid-text leading-tight
        ${sizeClass}
        ${className}`}
        {...props}
      >
        {children}
      </Button>
    );
  }
);
AddItemButton.displayName = 'AddItemButton';

// ============================================================================
// UTILITY EXPORTS - For custom variations
// ============================================================================

/**
 * Button class combinations for manual composition
 * Updated with enhanced UX/UI improvements for animated gradient backgrounds
 */
export const buttonClasses = {
  heroCTA: 'rounded-full border-2 border-cyan-400/70 text-white bg-cyan-600/90 backdrop-blur-sm hover:bg-cyan-500 hover:border-cyan-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.4),0_0_10px_rgba(6,182,212,0.2)] transition-all duration-300 hover:scale-[1.02] text-lg px-10 py-6 font-bold',
  secondaryAction: 'rounded-full border-2 border-cyan-400/70 text-cyan-200 bg-cyan-950/30 backdrop-blur-sm hover:bg-cyan-500/20 hover:border-cyan-300 hover:text-white hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all duration-300 hover:scale-[1.02]',
  authButton: 'rounded-full w-full border-2 border-cyan-400/70 text-white bg-cyan-600/90 backdrop-blur-sm hover:bg-cyan-500 hover:border-cyan-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.4),0_0_10px_rgba(6,182,212,0.2)] transition-all duration-300 hover:scale-[1.02] font-semibold',
  saveButton: 'rounded-full border-2 border-cyan-400/70 text-white bg-cyan-600/90 backdrop-blur-sm hover:bg-cyan-500 hover:border-cyan-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.4),0_0_10px_rgba(6,182,212,0.2)] transition-all duration-300 hover:scale-[1.02] font-semibold',
  deleteButton: 'rounded-full bg-red-600 hover:bg-red-700 border-2 border-red-500/50 hover:border-red-400 shadow-[0_0_25px_rgba(220,38,38,0.3)] hover:shadow-[0_0_40px_rgba(220,38,38,0.5)] transition-all duration-300 hover:scale-[1.02]',
  manageButton: 'rounded-full text-cyan-300 border-2 border-cyan-400/70 bg-cyan-950/30 hover:bg-cyan-500/20 backdrop-blur-sm hover:border-cyan-300 hover:text-white hover:shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all duration-300',
  syncButton: 'rounded-full text-cyan-300 border-2 border-cyan-400/70 bg-cyan-950/30 hover:bg-cyan-500/20 backdrop-blur-sm hover:border-cyan-300 hover:text-white hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-300',
  paginationButton: 'rounded-full bg-neutral-800/80 hover:bg-neutral-700/90 backdrop-blur-sm border-2 border-neutral-600/70 hover:border-neutral-500 text-neutral-200 hover:text-white hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-200 disabled:opacity-40',
  backButtonGhost: 'rounded-full text-neutral-200 hover:text-white bg-neutral-900/30 hover:bg-neutral-800/50 backdrop-blur-sm border border-neutral-700/50 hover:border-neutral-600 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300',
  backButtonGradient: 'rounded-full border-2 border-cyan-400/70 text-white bg-cyan-600/90 backdrop-blur-sm hover:bg-cyan-500 hover:border-cyan-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.4),0_0_10px_rgba(6,182,212,0.2)] transition-all duration-300 hover:scale-[1.02]',
  waitlistButton: 'rounded-full w-full border-2 border-cyan-400/70 text-white bg-cyan-600/90 backdrop-blur-sm hover:bg-cyan-500 hover:border-cyan-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.4),0_0_10px_rgba(6,182,212,0.2)] transition-all duration-300 hover:scale-[1.02] font-semibold',
  addItemButton: 'rounded-full border-2 border-cyan-400/70 text-white bg-cyan-600/90 backdrop-blur-sm hover:bg-cyan-500 hover:border-cyan-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.4),0_0_10px_rgba(6,182,212,0.2)] transition-all duration-300 hover:scale-[1.02] font-semibold',
  navbarLogin: 'rounded-full text-cyan-400 hover:bg-cyan-400/10 hover:text-cyan-300 transition-colors duration-200',
  navbarSignup: 'rounded-full border-2 border-cyan-400/70 text-white bg-cyan-600/90 backdrop-blur-sm hover:bg-cyan-500 hover:border-cyan-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.4),0_0_10px_rgba(6,182,212,0.2)] transition-all duration-300 hover:scale-[1.02] font-semibold',
  ghostIconButton: 'h-9 w-9 rounded-full bg-neutral-800/80 text-white hover:bg-neutral-700 hover:text-white border border-neutral-700/60',
};

/**
 * Usage Map - Which pages use which button presets
 * 
 * HeroCTA:
 *   - HomePage: "Get Started Now"
 *   - HowItWorksPage: "Add Your First Item"
 *   - PricingPage: "Start Free Trial"
 *   - GetStartedPage: "Join Waitlist", "Get Early Access"
 *   - SuccessStoriesPage: "Join the Waitlist"
 *   - FAQPage: "Join the FlipIt waitlist"
 *   - NotFound: "Return to Home"
 *   - FeaturesPage: "Join the Waitlist"
 * 
 * SecondaryAction:
 *   - HomePage: "How it works"
 *   - FAQPage: "Read the Playbook", "How FlipIt Works"
 * 
 * AuthButton:
 *   - LoginPage: "Sign In", "Create Account"
 * 
 * SaveButton:
 *   - SettingsPage: "Save Changes"
 *   - PlatformSettingsPage: "Save Changes"
 * 
 * BackButtonGhost:
 *   - ItemDetailPage: "Back to Items"
 *   - PlatformSettingsPage: "Back to Connected Accounts"
 * 
 * DeleteButton:
 *   - SettingsPage: "Delete Account"
 * 
 * ManageButton:
 *   - SettingsPage: "Manage Connected Accounts"
 * 
 * PaginationButton:
 *   - UserItemsPage: "Previous", "Next"
 * 
 * AddItemButton:
 *   - UserItemsPage: "Add Item", "Retry"
 */
