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
text-black font-bold
text-base
rounded-full px-10 py-6
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
      className={`border-2 border-cyan-400/70 text-cyan-200 bg-cyan-950/30 backdrop-blur-sm
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
export const AuthButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', children, ...props }, ref) => (
    <Button
      ref={ref}
      size="lg"
      className={`w-full bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-fuchsia-600 
        hover:from-cyan-400 hover:via-fuchsia-400 hover:to-fuchsia-500
        text-white border-2 border-white/20 hover:border-white/40
        shadow-[0_0_30px_rgba(236,72,153,0.4),0_0_12px_rgba(6,182,212,0.3)] 
        hover:shadow-[0_0_45px_rgba(236,72,153,0.6),0_0_18px_rgba(6,182,212,0.4)]
        transition-all duration-300
        focus-visible:ring-4 focus-visible:ring-fuchsia-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950
        disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed
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
export const WaitlistButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', children, ...props }, ref) => (
    <Button
      ref={ref}
      className={`w-full py-6 text-lg font-semibold
        bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-fuchsia-600 
        hover:from-cyan-400 hover:via-fuchsia-400 hover:to-fuchsia-500
        border-2 border-white/20 hover:border-white/40
        shadow-[0_0_35px_rgba(236,72,153,0.45),0_0_15px_rgba(6,182,212,0.3)] 
        hover:shadow-[0_0_50px_rgba(236,72,153,0.65),0_0_20px_rgba(6,182,212,0.4)]
        transition-all duration-300 hover:scale-[1.01]
        focus-visible:ring-4 focus-visible:ring-fuchsia-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950
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
export const SaveButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', children, ...props }, ref) => (
    <Button
      ref={ref}
      size="lg"
      className={`bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-fuchsia-600 
        hover:from-cyan-400 hover:via-fuchsia-400 hover:to-fuchsia-500
        border-2 border-white/20 hover:border-white/40
        shadow-[0_0_35px_rgba(236,72,153,0.45),0_0_15px_rgba(6,182,212,0.3)] 
        hover:shadow-[0_0_50px_rgba(236,72,153,0.65),0_0_20px_rgba(6,182,212,0.4)]
        transition-all duration-300 hover:scale-[1.02]
        focus-visible:ring-4 focus-visible:ring-fuchsia-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950
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
      className={`text-neutral-200 hover:text-white 
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
export const BackButtonGradient = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', children, ...props }, ref) => (
    <Button
      ref={ref}
      className={`bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-fuchsia-600 
        hover:from-cyan-400 hover:via-fuchsia-400 hover:to-fuchsia-500
        border-2 border-white/20 hover:border-white/40
        shadow-[0_0_30px_rgba(236,72,153,0.4),0_0_12px_rgba(6,182,212,0.3)] 
        hover:shadow-[0_0_45px_rgba(236,72,153,0.6),0_0_18px_rgba(6,182,212,0.4)]
        transition-all duration-300 hover:scale-[1.02]
        focus-visible:ring-4 focus-visible:ring-fuchsia-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950
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
      className={`text-cyan-300 border-2 border-cyan-400/70 
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
      className={`text-cyan-300 border-2 border-cyan-400/70 
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
export const ChangePasswordButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', children, ...props }, ref) => (
    <Button
      ref={ref}
      className={`bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-fuchsia-600 
        hover:from-cyan-400 hover:via-fuchsia-400 hover:to-fuchsia-500
        border-2 border-white/20 hover:border-white/40
        shadow-[0_0_30px_rgba(236,72,153,0.4),0_0_12px_rgba(6,182,212,0.3)] 
        hover:shadow-[0_0_45px_rgba(236,72,153,0.6),0_0_18px_rgba(6,182,212,0.4)]
        transition-all duration-300 hover:scale-[1.02]
        focus-visible:ring-4 focus-visible:ring-fuchsia-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950
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
      className={`bg-red-600 hover:bg-red-700 
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
      className={`bg-neutral-800/80 hover:bg-neutral-700/90 backdrop-blur-sm
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
 * AddItemButton - Gradient button for adding new items
 * Used in: UserItemsPage (empty state)
 * Example: "Add Item", "Retry"
 * 
 * UX Improvements:
 * - Full gradient treatment with via color
 * - Borders and dual shadows
 * - Better visibility against background
 */
export const AddItemButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', children, ...props }, ref) => (
    <Button
      ref={ref}
      className={`bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-fuchsia-600 
        hover:from-cyan-400 hover:via-fuchsia-400 hover:to-fuchsia-500
        border-2 border-white/20 hover:border-white/40
        shadow-[0_0_30px_rgba(236,72,153,0.4),0_0_12px_rgba(6,182,212,0.3)] 
        hover:shadow-[0_0_45px_rgba(236,72,153,0.6),0_0_18px_rgba(6,182,212,0.4)]
        transition-all duration-300 hover:scale-[1.02]
        focus-visible:ring-4 focus-visible:ring-fuchsia-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950
        ${className}`}
      {...props}
    >
      {children}
    </Button>
  )
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
  heroCTA: 'bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-fuchsia-600 hover:from-cyan-400 hover:via-fuchsia-400 hover:to-fuchsia-500 text-white text-lg px-10 py-6 font-bold rounded-full shadow-[0_0_40px_rgba(236,72,153,0.5),0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_60px_rgba(236,72,153,0.7),0_0_25px_rgba(6,182,212,0.5)] border-2 border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105',
  secondaryAction: 'border-2 border-cyan-400/70 text-cyan-200 bg-cyan-950/30 backdrop-blur-sm hover:bg-cyan-500/20 hover:border-cyan-300 hover:text-white hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all duration-300 hover:scale-[1.02]',
  authButton: 'w-full bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-fuchsia-600 hover:from-cyan-400 hover:via-fuchsia-400 hover:to-fuchsia-500 text-white border-2 border-white/20 hover:border-white/40 shadow-[0_0_30px_rgba(236,72,153,0.4),0_0_12px_rgba(6,182,212,0.3)] hover:shadow-[0_0_45px_rgba(236,72,153,0.6),0_0_18px_rgba(6,182,212,0.4)] transition-all duration-300',
  saveButton: 'bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-fuchsia-600 hover:from-cyan-400 hover:via-fuchsia-400 hover:to-fuchsia-500 border-2 border-white/20 hover:border-white/40 shadow-[0_0_35px_rgba(236,72,153,0.45),0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_50px_rgba(236,72,153,0.65),0_0_20px_rgba(6,182,212,0.4)] transition-all duration-300 hover:scale-[1.02]',
  deleteButton: 'bg-red-600 hover:bg-red-700 border-2 border-red-500/50 hover:border-red-400 shadow-[0_0_25px_rgba(220,38,38,0.3)] hover:shadow-[0_0_40px_rgba(220,38,38,0.5)] transition-all duration-300 hover:scale-[1.02]',
  manageButton: 'text-cyan-300 border-2 border-cyan-400/70 bg-cyan-950/30 hover:bg-cyan-500/20 backdrop-blur-sm hover:border-cyan-300 hover:text-white hover:shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all duration-300',
  syncButton: 'text-cyan-300 border-2 border-cyan-400/70 bg-cyan-950/30 hover:bg-cyan-500/20 backdrop-blur-sm hover:border-cyan-300 hover:text-white hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-300',
  paginationButton: 'bg-neutral-800/80 hover:bg-neutral-700/90 backdrop-blur-sm border-2 border-neutral-600/70 hover:border-neutral-500 text-neutral-200 hover:text-white hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-200 disabled:opacity-40',
  backButtonGhost: 'text-neutral-200 hover:text-white bg-neutral-900/30 hover:bg-neutral-800/50 backdrop-blur-sm border border-neutral-700/50 hover:border-neutral-600 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300',
  backButtonGradient: 'bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-fuchsia-600 hover:from-cyan-400 hover:via-fuchsia-400 hover:to-fuchsia-500 border-2 border-white/20 hover:border-white/40 shadow-[0_0_30px_rgba(236,72,153,0.4),0_0_12px_rgba(6,182,212,0.3)] hover:shadow-[0_0_45px_rgba(236,72,153,0.6),0_0_18px_rgba(6,182,212,0.4)] transition-all duration-300 hover:scale-[1.02]',
  waitlistButton: 'w-full bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-fuchsia-600 hover:from-cyan-400 hover:via-fuchsia-400 hover:to-fuchsia-500 border-2 border-white/20 hover:border-white/40 shadow-[0_0_35px_rgba(236,72,153,0.45),0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_50px_rgba(236,72,153,0.65),0_0_20px_rgba(6,182,212,0.4)] transition-all duration-300 hover:scale-[1.01]',
  addItemButton: 'bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-fuchsia-600 hover:from-cyan-400 hover:via-fuchsia-400 hover:to-fuchsia-500 border-2 border-white/20 hover:border-white/40 shadow-[0_0_30px_rgba(236,72,153,0.4),0_0_12px_rgba(6,182,212,0.3)] hover:shadow-[0_0_45px_rgba(236,72,153,0.6),0_0_18px_rgba(6,182,212,0.4)] transition-all duration-300 hover:scale-[1.02]',
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
