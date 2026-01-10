# Pricing Page Design Document

## Executive Summary
This document outlines a comprehensive design for FlipIt's pricing page that maintains consistency with the existing application theme while creating a compelling, conversion-focused experience across desktop and mobile devices.

---

## Design Philosophy

### Core Principles
1. **Brand Consistency**: Maintain FlipIt's vibrant gradient aesthetic (cyan-to-fuchsia)
2. **Clarity First**: Pricing information should be immediately clear and scannable
3. **Trust Building**: Use social proof and benefit highlights to build confidence
4. **Mobile-First**: Ensure optimal experience on smaller screens
5. **Conversion Optimized**: Guide users toward action with clear CTAs

---

## Color Palette (From Analysis)

### Primary Brand Colors
- **Cyan/Teal**: `#0EA5E9` (flipbot-teal), `#38BDF8` (flipbot-teal-light)
- **Purple**: `#8B5CF6` (flipbot-purple), `#A78BFA` (flipbot-purple-light)
- **Fuchsia/Pink**: `rgba(236, 72, 153)` - Used in gradients
- **Orange**: `#F97316` (flipbot-orange), `#FB923C` (flipbot-orange-light)

### Supporting Colors
- **Green/Success**: `#10B981` (flipbot-green), `#34D399` (flipbot-green-light)
- **Gray Scale**: `#F1F1F1` (lightgray), `#8E9196` (gray)
- **Dark Theme**: `neutral-950` (base), `neutral-900` (cards), `neutral-800` (inputs)
- **Text**: White primary, `neutral-300` secondary

### Gradient Patterns (Already Established)
- **Primary Gradient**: `from-cyan-500 to-fuchsia-500`
- **Secondary Gradient**: `from-cyan-500 to-purple-500`
- **Accent Gradient**: `from-orange-500 to-orange-300`
- **Success Gradient**: `from-green-500 to-green-300`

---

## Layout Strategy

### Desktop Layout (≥768px)

#### 1. Hero Section
```
┌─────────────────────────────────────────────────────┐
│              [Animated Background]                   │
│                                                      │
│        Choose Your FlipIt Plan                      │
│     Find the perfect fit for your reselling         │
│              business                                │
│                                                      │
│    [Monthly] ←→ [Annual (Save 20%)]                │
│        ^ Toggle Switch Component                     │
└─────────────────────────────────────────────────────┘
```
**Design Specs:**
- Background: Same animated gradient system as HomePage (floating orbs, radial gradients)
- Title: `text-5xl md:text-6xl font-extrabold` with gradient text
- Pricing toggle: Custom switch component with `bg-neutral-800`, active `bg-gradient-to-r from-cyan-500 to-fuchsia-500`
- Spacing: `py-24`

#### 2. Pricing Cards Section (3-Column Grid)
```
┌──────────────────────────────────────────────────────────────┐
│   ┌──────────┐    ┌──────────┐    ┌──────────┐             │
│   │  BASIC   │    │   PRO    │    │ BUSINESS │             │
│   │          │    │ POPULAR  │    │          │             │
│   │  Features│    │ [Badge]  │    │ Features │             │
│   │   List   │    │ Features │    │   List   │             │
│   │          │    │   List   │    │          │             │
│   │  [CTA]   │    │  [CTA]   │    │  [CTA]   │             │
│   └──────────┘    └──────────┘    └──────────┘             │
└──────────────────────────────────────────────────────────────┘
```

**Card Design Specs:**

**a) Start Card (Left)**
- Container: `bg-neutral-900/50 backdrop-blur-sm rounded-2xl p-8 ring-1 ring-neutral-700`
- Hover: `hover:ring-cyan-400/40 hover:-translate-y-1 transition-all duration-300`
- No special badge
- Standard CTA: `border-cyan-400 text-cyan-400 hover:bg-cyan-400/10`

**b) Plus Card (Center) - FEATURED**
- Container: `bg-neutral-900/60 backdrop-blur-sm rounded-2xl p-8 ring-2 ring-cyan-400`
- Badge: Position `absolute -top-4`, text: "MOST POPULAR"
  - Style: `bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white px-4 py-1 rounded-full font-semibold`
- Scale: Slightly larger `scale-105` or `p-10` for prominence
- Hover: `hover:ring-fuchsia-400 hover:shadow-2xl hover:shadow-cyan-500/20`
- CTA: `bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white shadow-lg`
- Glow effect: Subtle `shadow-2xl shadow-cyan-500/20`

**c) Scale Card (Right)**
- Container: `bg-neutral-900/50 backdrop-blur-sm rounded-2xl p-8 ring-1 ring-neutral-700`
- Hover: `hover:ring-purple-400/40 hover:-translate-y-1 transition-all duration-300`
- Optional badge: "ENTERPRISE" in `text-purple-400`
- CTA: `bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white`

**Card Content Structure:**
```
┌────────────────────────┐
│ Plan Name              │  <- text-2xl font-bold
│ Brief description      │  <- text-neutral-300
│                        │
│ 29 PLN/month           │  <- text-4xl font-extrabold with gradient
│ or $XXX/year           │  <- text-sm text-neutral-400
│                        │
│ ✓ Feature 1           │  <- Cyan checkmark icon
│ ✓ Feature 2           │  <- text-neutral-200
│ ✓ Feature 3           │
│ ✓ Feature 4           │
│ ✓ Feature 5           │
│                        │
│  [Get Started →]       │  <- Button component
└────────────────────────┘
```

**Spacing:**
- Card gap: `gap-8` on grid
- Internal padding: `p-8` for Start/Scale, `p-10` for Plus
- Feature list spacing: `space-y-4`

#### 3. Feature Comparison Table Section
```
┌──────────────────────────────────────────────────────┐
│          Compare All Features                         │
│                                                       │
│  ┌─────────────┬────────┬─────┬──────────┐          │
│  │   Feature   │ Start  │ Plus│ Scale    │          │
│  ├─────────────┼────────┼─────┼──────────┤          │
│  │ Listings    │   5    │  30 │  100     │          │
│  │ Platforms   │   ✓    │  ✓  │    ✓     │          │
│  │ AI Support  │   ─    │  ✓  │    ✓     │          │
│  └─────────────┴────────┴─────┴──────────┘          │
└──────────────────────────────────────────────────────┘
```
**Design Specs:**
- Background: `bg-neutral-900/30 rounded-2xl p-8`
- Table headers: `font-semibold text-lg`
- Checkmarks: Cyan colored `CheckCircle` icons
- Alternating row background: `even:bg-neutral-800/30`
- Responsive: Becomes accordion on mobile

#### 4. FAQ Section
```
┌──────────────────────────────────────────────────────┐
│        Frequently Asked Questions                     │
│                                                       │
│  ▼ Can I change plans later?                         │
│    [Answer content expanded]                          │
│                                                       │
│  ► How does billing work?                            │
│                                                       │
│  ► What payment methods do you accept?               │
└──────────────────────────────────────────────────────┘
```
**Design Specs:**
- Use Radix UI Accordion component (already installed)
- Container: `max-w-3xl mx-auto`
- Items: `bg-neutral-900/40 rounded-lg border border-neutral-700/50`
- Hover: `hover:border-cyan-400/30`
- Spacing: `space-y-4`

#### 5. Trust/Social Proof Section
```
┌──────────────────────────────────────────────────────┐
│   Trusted by 1000+ Resellers Across Europe           │
│                                                       │
│    [★★★★★]    [★★★★★]    [★★★★★]                   │
│   "Quote..."  "Quote..."  "Quote..."                 │
└──────────────────────────────────────────────────────┘
```
**Design Specs:**
- Background: `bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10`
- Cards: `bg-neutral-900/60 backdrop-blur-sm rounded-xl p-6`
- Stars: Orange colored `Star` icons
- Grid: `grid-cols-1 md:grid-cols-3 gap-6`

#### 6. Final CTA Section
```
┌──────────────────────────────────────────────────────┐
│                                                       │
│      Ready to Start Your Flipping Journey?           │
│         Start with our 14-day free trial             │
│                                                       │
│            [Get Started Free →]                       │
│         No credit card required                       │
│                                                       │
└──────────────────────────────────────────────────────┘
```
**Design Specs:**
- Background: `bg-gradient-to-r from-cyan-500/30 via-fuchsia-500/20 to-cyan-400/30 rounded-3xl p-8`
- Title: `text-3xl md:text-4xl font-extrabold`
- Button: Large size with gradient `bg-gradient-to-r from-cyan-500 to-fuchsia-500`
- Subtext: `text-sm text-neutral-400`

---

### Mobile Layout (< 768px)

#### Key Differences:

1. **Hero Section**
   - Title reduces to `text-3xl`
   - Toggle switch remains full width
   - Padding: `py-16` instead of `py-24`

2. **Pricing Cards**
   - Stack vertically: `flex-col space-y-6`
  - Plus card maintains visual prominence with ring and badge
   - All cards full width
   - Swipeable carousel option using Embla (already installed)

3. **Feature Comparison**
   - Convert to accordion format
   - Each plan becomes a collapsible section
   - Features shown as lists within each section
   ```
   ▼ Start Plan Features
     • 5 listings
     • 1 AI image enhancement
     • Community support
   
   ► Plus Plan Features
   
   ► Scale Plan Features
   ```

4. **FAQ Section**
   - Remains accordion (already mobile-friendly)
   - Slightly reduced padding: `p-4`

5. **Trust Section**
   - Single column: `grid-cols-1`
   - Horizontal scroll option for testimonials

6. **Navigation**
   - Sticky price comparison bar at bottom (optional)
   - Quick jump-to-plan buttons

---

## Component Specifications

### 1. PricingToggle Component
```typescript
// Usage: Toggle between Monthly/Annual pricing
<PricingToggle value={billingCycle} onChange={setBillingCycle} />
```
**Design:**
- Container: `flex items-center gap-4 justify-center`
- Switch base: `bg-neutral-800 rounded-full p-1 w-64`
- Active side: `bg-gradient-to-r from-cyan-500 to-fuchsia-500 rounded-full`
- Labels: Monthly (left), Annual (right) with "Save 20%" badge
- Animation: Smooth slide transition `transition-all duration-300`

### 2. PricingCard Component
```typescript
interface PricingCardProps {
  name: string;
  description: string;
  price: number;
  billingCycle: 'monthly' | 'annual';
  features: string[];
  featured?: boolean;
  badge?: string;
  ctaText: string;
  ctaVariant: 'default' | 'secondary' | 'accent';
}
```
**Features:**
- Animated on scroll using Framer Motion (already installed)
- Hover effects with scale and glow
- Checkmark icons using `CheckCircle` from lucide-react
- Price display with currency formatting
- Responsive padding and spacing

### 3. ComparisonTable Component
```typescript
interface Feature {
  name: string;
  basic: string | boolean;
  pro: string | boolean;
  business: string | boolean;
}
```
**Features:**
- Sticky header on scroll
- Highlight differences with color coding
- Tooltips for complex features using Radix UI Tooltip
- Mobile transforms to accordion

### 4. PricingFAQ Component
```typescript
interface FAQItem {
  question: string;
  answer: string;
}
```
**Features:**
- Uses Radix UI Accordion
- Smooth expand/collapse animations
- Icon rotation on open/close

**Suggested FAQ Content:**

1. **Can I switch plans at any time?**
   - Yes! You can upgrade or downgrade your plan at any time from your account settings. Changes take effect immediately, and you'll only pay the prorated difference when upgrading.

2. **How does the free trial work?**
   - All paid plans include a 14-day free trial. No credit card required to start. You'll only be charged when the trial ends if you decide to continue.

3. **What payment methods do you accept?**
   - We accept all major credit and debit cards (Visa, Mastercard, American Express, Discover) through our secure payment processor Stripe. You can also pay using Google Pay or Apple Pay.

4. **Can I cancel anytime?**
   - Absolutely. You can cancel your subscription at any time from your account settings. You'll continue to have access until the end of your current billing period.

5. **How does billing work for annual plans?**
   - Annual plans are billed once per year and save you 20% compared to monthly billing. You'll receive an invoice at the start of each year.

6. **Is my payment information secure?**
   - Yes. All payments are processed through Stripe, a PCI-compliant payment processor trusted by millions of businesses worldwide. We never store your payment information on our servers.

7. **What happens if I exceed my listing limit?**
   - If you reach your listing limit, you'll be prompted to upgrade to a higher tier. Your existing listings will remain active, but you won't be able to add new ones until you upgrade or remove old listings.

8. **Do you offer refunds?**
   - We offer a 14-day money-back guarantee. If you're not satisfied within the first 14 days, contact us for a full refund.

---

## Animation Strategy

### Scroll Animations (Using Framer Motion)
```typescript
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 * i, duration: 0.6, ease: 'easeOut' },
  }),
};
```

**Applied To:**
- Hero content: Stagger title, description, toggle
- Pricing cards: Stagger left-to-right (0.1s delay each)
- Feature comparison: Fade in on scroll
- FAQ items: Stagger with slight delay

### Hover Animations
- **Cards**: `hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`
- **Buttons**: `hover:scale-[1.02] active:scale-[0.98]`
- **Toggle switch**: `hover:shadow-lg hover:shadow-cyan-500/20`

### Background Animation
- Reuse HomePage's animated gradient system:
  - Floating orbs with keyframe animations
  - Radial gradients with opacity pulsing
  - Subtle movement using `translate` transforms

---

## Responsive Breakpoints

### Tailwind Breakpoints (Already Configured)
- **sm**: 640px
- **md**: 768px (primary mobile/desktop split)
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1400px (container max-width)

### Layout Adjustments
```css
/* Mobile First Approach */
.pricing-grid {
  @apply flex flex-col gap-6;        /* < 768px: Stack vertically */
  @apply md:grid md:grid-cols-3;     /* ≥ 768px: 3-column grid */
  @apply md:gap-8;                    /* Larger gap on desktop */
}

.pricing-card {
  @apply w-full;                      /* Full width mobile */
  @apply md:w-auto;                   /* Auto width desktop */
}

.feature-comparison {
  @apply hidden md:block;             /* Hide table on mobile */
}

.feature-accordion {
  @apply block md:hidden;             /* Show accordion on mobile only */
}
```

---

## Accessibility Considerations

### ARIA Labels
- Price amounts: `aria-label="99 dollars per month"`
- Toggle switch: `role="switch" aria-checked="true/false"`
- Comparison table: Proper `<thead>`, `<tbody>`, `scope` attributes
- FAQ accordion: ARIA expanded states

### Keyboard Navigation
- Tab order: Toggle → Cards (left to right) → CTAs → FAQ
- Enter/Space to toggle billing cycle
- Arrow keys for accordion navigation

### Color Contrast
- Text on dark backgrounds: Use `text-white` and `text-neutral-300`
- All text meets WCAG AA standards (4.5:1 contrast)
- Interactive elements have clear focus states: `focus-visible:ring-2 focus-visible:ring-cyan-400`

### Screen Reader Support
- Semantic HTML: `<section>`, `<article>`, `<nav>`
- Descriptive button text (avoid "Click here")
- Alt text for icons (or `aria-hidden="true"` for decorative)

---

## Typography

### Font Families (Already Configured)
- **Headings**: Poppins (font-heading)
- **Body**: Inter (font-sans)

### Scale
```
Page Title: text-5xl md:text-6xl font-extrabold
Section Headings: text-3xl md:text-4xl font-bold
Card Titles: text-2xl font-bold
Prices: text-4xl font-extrabold
Body Text: text-base leading-relaxed
Small Text: text-sm
```

### Color Usage
- **Primary Text**: `text-white`
- **Secondary Text**: `text-neutral-300`
- **Muted Text**: `text-neutral-400`
- **Gradient Text**: `bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent`

---

## Suggested Pricing Structure (Content)

### Plan 1: Start
- **Price**: 0 PLN/month (Free tier)
- **Target**: Sellers starting with multi-platform listings
- **Features**:
  - 5 listings/month
  - 1 AI-enhanced photo/month
  - AI-generated descriptions
  - Manual review before publish
  - All supported marketplaces

### Plan 2: Plus (FEATURED)
- **Price**: 29 PLN/month or 279 PLN/year (save 20%)
- **Target**: Regular resellers
- **Features**:
  - 30 listings/month
  - 20 AI-enhanced photos/month
  - AI-generated descriptions
  - Suggested pricing and categories
  - Required attributes auto-fill
  - Manual review before publish
  - Email support
  
### Plan 3: Scale
- **Price**: 59 PLN/month or 569 PLN/year (save 20%)
- **Target**: Higher listing volumes
- **Features**:
  - 100 listings/month
  - 100 AI-enhanced photos/month
  - AI-generated descriptions
  - Suggested pricing and categories
  - Required attributes auto-fill
  - Manual review before publish
  - Priority email support

---

## Color Application Guide

### By Component Type

**Pricing Cards:**
- Background: `bg-neutral-900/50` or `bg-neutral-900/60` (featured)
- Border: `ring-1 ring-neutral-700` (basic), `ring-2 ring-cyan-400` (featured)
- Hover ring: `hover:ring-cyan-400/40` (basic), `hover:ring-fuchsia-400` (featured)

**Buttons:**
- Primary CTA: `bg-gradient-to-r from-cyan-500 to-fuchsia-500`
- Secondary: `border-cyan-400 text-cyan-400 hover:bg-cyan-400/10`
- Scale tier: `bg-gradient-to-r from-purple-500 to-fuchsia-500`

**Badges:**
- Popular badge: `bg-gradient-to-r from-cyan-500 to-fuchsia-500`
- Save percentage: `bg-green-500/10 text-green-400`
- Enterprise badge: `bg-purple-500/10 text-purple-400`

**Icons:**
- Checkmarks: `text-cyan-400`
- Stars (ratings): `text-orange-400`
- Close/Remove: `text-red-400`
- Info icons: `text-neutral-400`

**Backgrounds:**
- Page background: Same animated system as HomePage
- Section backgrounds: `bg-neutral-900/30` for subtle separation
- Card backgrounds: `bg-neutral-900/50 backdrop-blur-sm`
- Highlights: `bg-cyan-500/10` or `bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10`

---

## Implementation Notes

### Required Dependencies (Already Installed)
- ✅ React + TypeScript
- ✅ Tailwind CSS with custom config
- ✅ Framer Motion for animations
- ✅ Radix UI components (Accordion, Tooltip, etc.)
- ✅ Lucide React for icons
- ✅ React Router for navigation

### Recommended File Structure
```
src/
  pages/
    PricingPage.tsx              # Main page component
    pricing-translations.ts      # i18n translations
  components/
    pricing/
      PricingToggle.tsx          # Billing cycle toggle
      PricingCard.tsx            # Individual plan card
      ComparisonTable.tsx        # Feature comparison
      ComparisonTableMobile.tsx  # Mobile accordion version
      PricingFAQ.tsx            # FAQ accordion
      TrustSection.tsx          # Testimonials/social proof
```

### SEO Considerations
```typescript
<SEOHead
  title="FlipIt Pricing - Choose Your Reselling Plan | myflipit.live"
  description="Transparent pricing for FlipIt's marketplace automation. Start is free, Plus is 29 PLN/month, Scale is 59 PLN/month. All plans include the supported marketplaces."
  canonicalUrl="https://myflipit.live/pricing"
  keywords={[
    'FlipIt pricing',
    'reselling platform cost',
    'marketplace automation pricing',
    'OLX automation price',
    'Vinted automation cost',
  ]}
/>
```

### Payment Integration (Stripe)

**Note**: FlipIt will use **Stripe** for payment processing.

#### Integration Considerations

**Stripe Pricing Table (Recommended)**
- Use Stripe's embeddable Pricing Table for seamless checkout
- Allows dynamic pricing updates from Stripe Dashboard
- Handles subscription management, upgrades/downgrades automatically
- Built-in support for multiple currencies (PLN, EUR, USD, etc.)

**Implementation Approach:**
```typescript
// Option 1: Stripe Pricing Table (No-code approach)
<stripe-pricing-table 
  pricing-table-id="prctbl_xxx"
  publishable-key="pk_xxx">
</stripe-pricing-table>

// Option 2: Custom Checkout with Stripe API
// Plus CTA button onClick:
const handleSubscribe = async (priceId: string) => {
  const stripe = await loadStripe(publishableKey);
  const { error } = await stripe.redirectToCheckout({
    lineItems: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    successUrl: 'https://myflipit.live/success',
    cancelUrl: 'https://myflipit.live/pricing',
  });
};
```

**Stripe Product Setup:**
- **Start Plan**: No Stripe product needed (free tier)
- **Plus Plan**: Create Stripe product with monthly/annual prices
  - Monthly: 29 PLN/month (price_plus_monthly_pln)
  - Annual: 279 PLN/year (price_plus_annual_pln)
- **Scale Plan**: Create Stripe product with monthly/annual prices
  - Monthly: 59 PLN/month (price_scale_monthly_pln)
  - Annual: 569 PLN/year (price_scale_annual_pln)

**Design Considerations:**
- CTA buttons should trigger Stripe Checkout
- Show "Secure payment by Stripe" badge for trust
- Display accepted payment methods (Cards, Google Pay, Apple Pay)
- Add loading state during redirect to Stripe
- Handle post-payment success/cancel flows

**Additional Features:**
- Optional free trial (configure in Stripe product settings if needed)
- Proration on plan changes (automatic in Stripe)
- Tax calculation (Stripe Tax integration)
- Invoice generation (automatic via Stripe)

---

## Testing Checklist

### Visual Testing
- [ ] All pricing cards render correctly on desktop (1920px, 1440px, 1024px)
- [ ] Mobile layout stacks properly (768px, 375px, 320px)
- [ ] Featured card stands out appropriately
- [ ] Gradients render smoothly
- [ ] Animations trigger on scroll
- [ ] Hover states work on all interactive elements

### Functional Testing
- [ ] Billing toggle switches between monthly/annual
- [ ] Prices update correctly when toggling
- [ ] All CTAs link to correct pages
- [ ] FAQ accordion expands/collapses
- [ ] Comparison table is scrollable on mobile
- [ ] Navigation works on all breakpoints

### Accessibility Testing
- [ ] Keyboard navigation works throughout
- [ ] Screen reader announces all content
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA
- [ ] ARIA labels correct

### Performance Testing
- [ ] Page loads under 3 seconds
- [ ] Animations don't cause jank
- [ ] Images optimized
- [ ] No layout shift (CLS < 0.1)

---

## Future Enhancements

### Phase 2 Features
1. **Dynamic Pricing**: Show prices based on user's location/currency
2. **Calculator**: Let users estimate ROI based on their selling volume
3. **Plan Comparison Tool**: Side-by-side detailed comparison
4. **Video Demos**: Embed feature videos in cards
5. **Live Chat**: Add support widget for pricing questions
6. **A/B Testing**: Test different card orders and copy
7. **Limited Time Offers**: Banner for promotional pricing
8. **Student/Nonprofit Discounts**: Special pricing tiers

### Analytics to Track
- Conversion rate by plan
- Time spent on page
- Card interaction (hovers, clicks)
- FAQ open rate
- Exit points
- Toggle usage (monthly vs annual preference)

---

## Conclusion

This design creates a cohesive, conversion-focused pricing page that:
- ✅ Maintains FlipIt's vibrant brand identity
- ✅ Provides clear pricing information
- ✅ Works beautifully on all devices
- ✅ Uses established components and patterns
- ✅ Follows accessibility best practices
- ✅ Optimizes for conversion

The design leverages existing patterns from the codebase (animated backgrounds, gradient buttons, card layouts) while introducing new pricing-specific components that feel native to the application.

---

**Design Version**: 1.0  
**Date**: October 25, 2025  
**Status**: Ready for Review & Implementation
