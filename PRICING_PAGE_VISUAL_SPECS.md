# Pricing Page - Visual Specifications & Mockups

## Table of Contents
1. [Desktop Wireframe](#desktop-wireframe)
2. [Mobile Wireframe](#mobile-wireframe)
3. [Component Visual Specs](#component-visual-specs)
4. [Color Swatches & Usage](#color-swatches--usage)
5. [Spacing & Grid System](#spacing--grid-system)

---

## Desktop Wireframe

### Full Page Layout (1440px viewport)
```
╔══════════════════════════════════════════════════════════════════════════════╗
║                        NAVBAR (Sticky, Dark)                                  ║
║  FlipIt                    How It Works | Guide        🌐 EN | Login | Signup║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  [Animated Background: Floating orbs + gradient pulses]                      ║
║                                                                               ║
║                     Choose Your FlipIt Plan                                  ║
║               text-6xl font-extrabold with gradient                          ║
║                                                                               ║
║           Find the perfect fit for your reselling business                   ║
║                    text-xl text-neutral-300                                  ║
║                                                                               ║
║                  ┌─────────────────────┐                                     ║
║                  │ Monthly ◯━━━◉ Annual│  ← Toggle Switch                   ║
║                  │        (Save 20%)    │                                     ║
║                  └─────────────────────┘                                     ║
║                                                                               ║
║══════════════════════════════════════════════════════════════════════════════║
║                         Pricing Cards Section                                 ║
║     py-24 | container max-w-7xl mx-auto                                      ║
║                                                                               ║
║  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          ║
║  │                  │  │  ╔══════════╗    │  │                  │          ║
║  │   STARTER        │  │  ║ POPULAR! ║    │  │   BUSINESS       │          ║
║  │                  │  │  ╚══════════╝    │  │                  │          ║
║  │ For beginners    │  │  PRO             │  │ For power users  │          ║
║  │                  │  │  Most flexible   │  │                  │          ║
║  │                  │  │                  │  │                  │          ║
║  │    FREE          │  │   99 PLN/mo      │  │   299 PLN/mo     │          ║
║  │                  │  │  or 950 PLN/yr   │  │  or 2850 PLN/yr  │          ║
║  │                  │  │                  │  │                  │          ║
║  │ ✓ 25 listings    │  │ ✓ 500 listings   │  │ ✓ Unlimited      │          ║
║  │ ✓ 2 platforms    │  │ ✓ All platforms  │  │ ✓ Everything Pro │          ║
║  │ ✓ Basic AI       │  │ ✓ Advanced AI    │  │ ✓ Multi-user     │          ║
║  │ ✓ Community      │  │ ✓ Priority       │  │ ✓ API access     │          ║
║  │   support        │  │   support        │  │ ✓ Account mgr    │          ║
║  │ ✓ 10 photos/mo   │  │ ✓ Unlimited      │  │ ✓ White-label    │          ║
║  │                  │  │   photos         │  │                  │          ║
║  │                  │  │ ✓ Analytics      │  │                  │          ║
║  │                  │  │ ✓ Auto repost    │  │                  │          ║
║  │                  │  │ ✓ Auto messages  │  │                  │          ║
║  │                  │  │                  │  │                  │          ║
║  │ ┌──────────────┐ │  │ ┌──────────────┐ │  │ ┌──────────────┐ │          ║
║  │ │ Get Started  │ │  │ │ Start Pro ▸  │ │  │ │ Contact Us ▸ │ │          ║
║  │ └──────────────┘ │  │ └──────────────┘ │  │ └──────────────┘ │          ║
║  │   Outline btn    │  │  Gradient btn    │  │  Purple gradient │          ║
║  └──────────────────┘  └──────────────────┘  └──────────────────┘          ║
║      Standard           Featured + Glow         Standard                     ║
║                                                                               ║
║══════════════════════════════════════════════════════════════════════════════║
║                    Feature Comparison Table                                   ║
║     bg-neutral-900/30 rounded-2xl p-8 | max-w-5xl mx-auto                   ║
║                                                                               ║
║  ┌────────────────────────┬─────────┬──────────┬──────────┐                 ║
║  │ Feature                │ Starter │   Pro    │ Business │                 ║
║  ├────────────────────────┼─────────┼──────────┼──────────┤                 ║
║  │ Active Listings        │   25    │   500    │ Unlimited│                 ║
║  │ Marketplace Connections│    2    │    4     │    4     │                 ║
║  │ AI Description Quality │  Basic  │ Advanced │ Advanced │                 ║
║  │ AI Photo Enhancement   │ 10/mo   │ Unlimited│ Unlimited│                 ║
║  │ Automated Re-listing   │    ✗    │    ✓     │    ✓     │                 ║
║  │ Price Recommendations  │    ✗    │    ✓     │    ✓     │                 ║
║  │ Sales Analytics        │    ✗    │    ✓     │ Advanced │                 ║
║  │ Automated Messaging    │    ✗    │    ✓     │    ✓     │                 ║
║  │ Multi-user Accounts    │    ✗    │    ✗     │ Up to 5  │                 ║
║  │ API Access             │    ✗    │    ✗     │    ✓     │                 ║
║  │ Priority Support       │    ✗    │  Email   │ Phone+Email                ║
║  │ Dedicated Manager      │    ✗    │    ✗     │    ✓     │                 ║
║  └────────────────────────┴─────────┴──────────┴──────────┘                 ║
║                                                                               ║
║══════════════════════════════════════════════════════════════════════════════║
║                    Frequently Asked Questions                                 ║
║                   max-w-3xl mx-auto | py-16                                  ║
║                                                                               ║
║  ┌─────────────────────────────────────────────────────────────┐            ║
║  │ ▼ Can I switch plans at any time?                            │            ║
║  │                                                               │            ║
║  │   Yes! You can upgrade or downgrade your plan at any time... │            ║
║  │   [Full answer text in neutral-300]                          │            ║
║  └─────────────────────────────────────────────────────────────┘            ║
║                                                                               ║
║  ┌─────────────────────────────────────────────────────────────┐            ║
║  │ ► How does the free trial work?                              │            ║
║  └─────────────────────────────────────────────────────────────┘            ║
║                                                                               ║
║  ┌─────────────────────────────────────────────────────────────┐            ║
║  │ ► What payment methods do you accept?                        │            ║
║  └─────────────────────────────────────────────────────────────┘            ║
║                                                                               ║
║  ┌─────────────────────────────────────────────────────────────┐            ║
║  │ ► Can I cancel anytime?                                      │            ║
║  └─────────────────────────────────────────────────────────────┘            ║
║                                                                               ║
║══════════════════════════════════════════════════════════════════════════════║
║                      Trusted by Resellers                                     ║
║         bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10                  ║
║                                                                               ║
║        Trusted by 1000+ Resellers Across Europe                              ║
║                                                                               ║
║  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  ║
║  │ ★★★★★        │    │ ★★★★★        │    │ ★★★★★        │                  ║
║  │              │    │              │    │              │                  ║
║  │ "FlipIt has  │    │ "I went from │    │ "The auto-   │                  ║
║  │  saved me    │    │  manual to   │    │  mation is   │                  ║
║  │  hours..."   │    │  automated..." │  │  incredible" │                  ║
║  │              │    │              │    │              │                  ║
║  │ - Anna K.    │    │ - Marek P.   │    │ - Kasia W.   │                  ║
║  │   Warsaw     │    │   Krakow     │    │   Gdansk     │                  ║
║  └──────────────┘    └──────────────┘    └──────────────┘                  ║
║                                                                               ║
║══════════════════════════════════════════════════════════════════════════════║
║                         Final Call to Action                                  ║
║                                                                               ║
║              ┌─────────────────────────────────────┐                         ║
║              │                                     │                         ║
║              │  Ready to Start Your Flipping      │                         ║
║              │           Journey?                 │                         ║
║              │                                     │                         ║
║              │  Start with our 14-day free trial  │                         ║
║              │                                     │                         ║
║              │    ┌───────────────────────┐       │                         ║
║              │    │  Get Started Free ▸   │       │                         ║
║              │    └───────────────────────┘       │                         ║
║              │      Large gradient button          │                         ║
║              │                                     │                         ║
║              │    No credit card required          │                         ║
║              │                                     │                         ║
║              └─────────────────────────────────────┘                         ║
║                                                                               ║
║══════════════════════════════════════════════════════════════════════════════║
║                            FOOTER                                             ║
║           [Standard footer from existing pages]                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## Mobile Wireframe

### Full Page Layout (375px viewport)
```
╔═══════════════════════════════════╗
║         NAVBAR (Mobile)           ║
║  FlipIt              [☰ Menu]    ║
╠═══════════════════════════════════╣
║                                   ║
║  [Animated Background]            ║
║                                   ║
║    Choose Your                    ║
║    FlipIt Plan                    ║
║  text-3xl font-extrabold          ║
║                                   ║
║  Find the perfect fit for         ║
║  your reselling business          ║
║                                   ║
║  ┌───────────────────────┐        ║
║  │ Monthly ◯━━◉ Annual   │        ║
║  │      (Save 20%)       │        ║
║  └───────────────────────┘        ║
║                                   ║
╠═══════════════════════════════════╣
║      Pricing Cards                ║
║   (Stacked Vertically)            ║
║                                   ║
║  ┌─────────────────────┐          ║
║  │   STARTER           │          ║
║  │                     │          ║
║  │ For beginners       │          ║
║  │                     │          ║
║  │      FREE           │          ║
║  │                     │          ║
║  │ ✓ 25 listings       │          ║
║  │ ✓ 2 platforms       │          ║
║  │ ✓ Basic AI          │          ║
║  │ ✓ Community support │          ║
║  │ ✓ 10 photos/month   │          ║
║  │                     │          ║
║  │ ┌─────────────────┐ │          ║
║  │ │  Get Started    │ │          ║
║  │ └─────────────────┘ │          ║
║  └─────────────────────┘          ║
║                                   ║
║  ┌─────────────────────┐          ║
║  │  ╔═════════════╗    │          ║
║  │  ║  POPULAR!   ║    │          ║
║  │  ╚═════════════╝    │          ║
║  │       PRO           │          ║
║  │                     │          ║
║  │ Most flexible plan  │          ║
║  │                     │          ║
║  │   99 PLN/month      │          ║
║  │  or 950 PLN/year    │          ║
║  │                     │          ║
║  │ ✓ 500 listings      │          ║
║  │ ✓ All platforms     │          ║
║  │ ✓ Advanced AI       │          ║
║  │ ✓ Priority support  │          ║
║  │ ✓ Unlimited photos  │          ║
║  │ ✓ Analytics         │          ║
║  │ ✓ Auto repost       │          ║
║  │ ✓ Auto messaging    │          ║
║  │                     │          ║
║  │ ┌─────────────────┐ │          ║
║  │ │  Start Pro ▸    │ │          ║
║  │ └─────────────────┘ │          ║
║  │   Gradient button   │          ║
║  └─────────────────────┘          ║
║    Larger + Glow                  ║
║                                   ║
║  ┌─────────────────────┐          ║
║  │   BUSINESS          │          ║
║  │                     │          ║
║  │ For power users     │          ║
║  │                     │          ║
║  │   299 PLN/month     │          ║
║  │  or 2850 PLN/year   │          ║
║  │                     │          ║
║  │ ✓ Unlimited         │          ║
║  │ ✓ Everything in Pro │          ║
║  │ ✓ Multi-user (5)    │          ║
║  │ ✓ API access        │          ║
║  │ ✓ Account manager   │          ║
║  │ ✓ White-label       │          ║
║  │                     │          ║
║  │ ┌─────────────────┐ │          ║
║  │ │  Contact Us ▸   │ │          ║
║  │ └─────────────────┘ │          ║
║  └─────────────────────┘          ║
║                                   ║
╠═══════════════════════════════════╣
║  Feature Comparison               ║
║  (Accordion Format)               ║
║                                   ║
║  ┌─────────────────────┐          ║
║  │ ▼ Starter Features  │          ║
║  │                     │          ║
║  │ • 25 listings       │          ║
║  │ • 2 platforms       │          ║
║  │ • Basic AI          │          ║
║  │ • Community support │          ║
║  └─────────────────────┘          ║
║                                   ║
║  ┌─────────────────────┐          ║
║  │ ► Pro Features      │          ║
║  └─────────────────────┘          ║
║                                   ║
║  ┌─────────────────────┐          ║
║  │ ► Business Features │          ║
║  └─────────────────────┘          ║
║                                   ║
╠═══════════════════════════════════╣
║  FAQ Section                      ║
║  (Same accordion style)           ║
║                                   ║
║  ┌─────────────────────┐          ║
║  │ ▼ Can I switch      │          ║
║  │   plans?            │          ║
║  │                     │          ║
║  │ Yes! You can...     │          ║
║  └─────────────────────┘          ║
║                                   ║
║  ┌─────────────────────┐          ║
║  │ ► Free trial?       │          ║
║  └─────────────────────┘          ║
║                                   ║
╠═══════════════════════════════════╣
║  Testimonials                     ║
║  (Horizontal scroll)              ║
║                                   ║
║  ← ┌───────────┐ →                ║
║    │ ★★★★★     │                  ║
║    │           │                  ║
║    │ "FlipIt   │                  ║
║    │  has..."  │                  ║
║    │           │                  ║
║    │ - Anna K. │                  ║
║    └───────────┘                  ║
║                                   ║
╠═══════════════════════════════════╣
║  Final CTA                        ║
║                                   ║
║  ┌─────────────────────┐          ║
║  │  Ready to Start?    │          ║
║  │                     │          ║
║  │ 14-day free trial   │          ║
║  │                     │          ║
║  │ ┌─────────────────┐ │          ║
║  │ │ Get Started ▸   │ │          ║
║  │ └─────────────────┘ │          ║
║  │                     │          ║
║  │ No credit card      │          ║
║  └─────────────────────┘          ║
║                                   ║
╠═══════════════════════════════════╣
║         FOOTER                    ║
╚═══════════════════════════════════╝
```

---

## Component Visual Specs

### 1. Pricing Card - Detailed Breakdown

#### Standard Card (Starter/Business)
```
┌─────────────────────────────────┐
│ padding: 2rem (p-8)             │
│ bg: neutral-900/50              │
│ backdrop-blur-sm                │
│ rounded-2xl                     │
│ ring-1 ring-neutral-700         │
│                                 │
│  PLAN NAME                      │  ← text-2xl font-bold text-white
│  Brief description text         │  ← text-sm text-neutral-300
│                                 │     mt-2
│                                 │
│  [Price Display]                │  ← mt-6
│    99 PLN                       │  ← text-4xl font-extrabold
│    per month                    │     gradient text: cyan→fuchsia
│    or 950 PLN/year             │  ← text-sm text-neutral-400 mt-1
│                                 │
│  ─────────────────             │  ← Divider, my-6
│                                 │     border-neutral-700
│  Features List:                 │  ← space-y-4
│                                 │
│  ✓ Feature 1                    │  ← flex items-start gap-3
│  │ └─ CheckCircle (cyan-400)   │     text-base text-neutral-200
│  ✓ Feature 2                    │
│  ✓ Feature 3                    │
│  ✓ Feature 4                    │
│  ✓ Feature 5                    │
│                                 │
│  [Spacer grows]                 │  ← flex-grow to push button down
│                                 │
│  ┌───────────────────────────┐  │  ← mt-8
│  │      Get Started →        │  │     w-full button
│  └───────────────────────────┘  │     h-11 px-6
│    Border: cyan-400             │     variant: outline for Basic
│    Text: cyan-400               │     variant: gradient for Business
│    Hover: bg-cyan-400/10        │
│                                 │
└─────────────────────────────────┘
  Width: 100% (mobile) / 384px (desktop)
  Height: auto (min-h-[600px])

Hover State:
  • transform: translateY(-4px)
  • ring: ring-cyan-400/40
  • shadow: shadow-xl
  • transition: all 300ms
```

#### Featured Card (Pro)
```
┌─────────────────────────────────┐
│         ╔═════════════╗         │  ← Absolute positioned badge
│         ║ MOST POPULAR║         │     -top-4, bg-gradient cyan→fuchsia
│         ╚═════════════╝         │     text-white px-4 py-1
│─────────────────────────────────│     rounded-full font-semibold
│ padding: 2.5rem (p-10)          │     text-sm
│ bg: neutral-900/60              │
│ backdrop-blur-sm                │
│ rounded-2xl                     │
│ ring-2 ring-cyan-400            │  ← Thicker ring
│ shadow-2xl                      │  ← Stronger shadow
│ shadow-cyan-500/20              │  ← Colored glow
│                                 │
│  PRO                            │  ← text-2xl font-bold text-white
│  Most flexible for resellers    │  ← text-sm text-neutral-300
│                                 │
│                                 │
│  [Price Display]                │
│    99 PLN                       │  ← Same as standard
│    per month                    │
│    or 950 PLN/year             │
│                                 │
│  ─────────────────             │
│                                 │
│  Features List (more items):    │
│                                 │
│  ✓ Feature 1                    │
│  ✓ Feature 2                    │
│  ✓ Feature 3                    │
│  ✓ Feature 4                    │
│  ✓ Feature 5                    │
│  ✓ Feature 6                    │
│  ✓ Feature 7                    │
│  ✓ Feature 8                    │
│                                 │
│  [Spacer]                       │
│                                 │
│  ┌───────────────────────────┐  │
│  │      Start Pro →          │  │  ← Full gradient button
│  └───────────────────────────┘  │     bg: cyan-500 → fuchsia-500
│    Gradient: cyan → fuchsia     │     text-white
│    Shadow: shadow-lg            │     hover: to-fuchsia-600
│    Shadow color: fuchsia-500/30 │
│                                 │
└─────────────────────────────────┘
  Width: Same as standard
  Height: auto (min-h-[640px])
  Scale: 1.02 (slightly larger visually)

Hover State:
  • transform: translateY(-6px)
  • ring: ring-fuchsia-400
  • shadow: shadow-3xl
  • glow: shadow-cyan-500/30
```

### 2. Pricing Toggle Component

```
Closed View (Monthly Selected):
┌──────────────────────────────────────┐
│  bg: neutral-800                     │
│  rounded-full                        │
│  p-1                                 │
│  w-72                                │
│                                      │
│  ┌────────────┐  ┌────────────────┐ │
│  │  Monthly   │  │  Annual        │ │
│  │   (Active) │  │  Save 20%!     │ │
│  └────────────┘  └────────────────┘ │
│   ↑ Gradient bg      ↑ Text only    │
│     cyan→fuchsia     neutral-400    │
│     text-white       hover effect   │
└──────────────────────────────────────┘

Interaction States:
• Smooth slide transition (300ms)
• Active side has gradient background
• Inactive side is transparent
• Hover: Entire toggle gets subtle glow
• Focus: ring-2 ring-cyan-400 outline

Visual feedback:
• Click → immediate slide
• Price numbers animate (fade/scale)
```

### 3. Feature Comparison Table

```
Desktop Version (≥768px):
┌────────────────────────────────────────────────────────────────┐
│  bg: neutral-900/30                                            │
│  rounded-2xl                                                   │
│  p-8                                                           │
│  max-w-5xl mx-auto                                            │
│                                                                │
│  ┌──────────────────────┬──────────┬──────────┬──────────┐   │
│  │ Feature              │ Starter  │   Pro    │ Business │   │
│  │ (Sticky)             │          │          │          │   │
│  ├──────────────────────┼──────────┼──────────┼──────────┤   │
│  │ Active Listings      │    25    │   500    │ Unlimited│   │
│  ├──────────────────────┼──────────┼──────────┼──────────┤   │
│  │ Marketplace          │    2     │    4     │    4     │   │
│  │ Connections          │          │          │          │   │
│  ├──────────────────────┼──────────┼──────────┼──────────┤   │
│  │ AI Description       │  Basic   │ Advanced │ Advanced │   │
│  │ Quality              │          │          │          │   │
│  ├──────────────────────┼──────────┼──────────┼──────────┤   │
│  │ ...more rows         │          │          │          │   │
│  └──────────────────────┴──────────┴──────────┴──────────┘   │
│                                                                │
└────────────────────────────────────────────────────────────────┘

Styling Details:
• Header row: bg-neutral-800 font-semibold
• Alternating rows: even:bg-neutral-800/30
• Text alignment: left for features, center for values
• Checkmarks: CheckCircle icon in cyan-400
• X marks: XCircle icon in neutral-500
• Cell padding: px-4 py-3
• Border: border-b border-neutral-700/50

Mobile Version (<768px):
Converts to accordion:
┌──────────────────────────┐
│ ▼ Starter Plan           │
│   • 25 listings          │
│   • 2 platforms          │
│   • Basic AI             │
│                          │
│ ► Pro Plan               │
│                          │
│ ► Business Plan          │
└──────────────────────────┘
```

### 4. FAQ Accordion Item

```
Collapsed State:
┌────────────────────────────────────────────────────┐
│  ► Can I switch plans at any time?                 │
│     ↑ ChevronRight icon                           │
│     text-lg font-semibold                          │
│                                                    │
│  bg: neutral-900/40                                │
│  border: border-neutral-700/50                     │
│  rounded-lg                                        │
│  p-4                                               │
│  hover: border-cyan-400/30                         │
└────────────────────────────────────────────────────┘

Expanded State:
┌────────────────────────────────────────────────────┐
│  ▼ Can I switch plans at any time?                 │
│     ↑ ChevronDown icon (rotated)                  │
│     text-lg font-semibold                          │
│                                                    │
│  Yes! You can upgrade or downgrade your plan at    │
│  any time from your account settings. Changes      │
│  take effect immediately. If you upgrade, you'll   │
│  only pay the prorated difference...               │
│     ↑ text-neutral-300                            │
│     pt-4 leading-relaxed                           │
│                                                    │
│  bg: neutral-900/40                                │
│  border: border-cyan-400/40 (highlighted)          │
│  rounded-lg                                        │
│  p-4                                               │
└────────────────────────────────────────────────────┘

Animation:
• Icon rotation: 90deg over 200ms
• Content slide down: height auto with easing
• Border color transition: 200ms
```

### 5. Testimonial Card

```
┌──────────────────────────────┐
│  bg: neutral-900/60          │
│  backdrop-blur-sm            │
│  rounded-xl                  │
│  p-6                         │
│  ring-1 ring-neutral-700/30  │
│                              │
│  ★ ★ ★ ★ ★                  │  ← Star icons in orange-400
│  text-lg                     │     gap-1 flex
│                              │
│  "FlipIt has saved me hours  │  ← Quote text
│   every week and doubled my  │     text-neutral-200
│   profits in just 3 months!" │     italic leading-relaxed
│                              │     mt-4
│  ────────────────            │  ← Divider, mt-4
│                              │     border-neutral-700/50
│  Anna Kowalski               │  ← Author name
│  text-sm font-medium         │     mt-4 text-white
│                              │
│  Warsaw, Poland              │  ← Location
│  text-xs text-neutral-400    │
│                              │
└──────────────────────────────┘
  Width: 100% (mobile) / 384px (desktop)
  Height: auto

Hover State:
  • transform: translateY(-2px)
  • shadow: shadow-lg
  • ring: ring-cyan-400/20
```

---

## Color Swatches & Usage

### Primary Brand Colors

**Cyan/Teal Family**
```
██████ #0EA5E9 (flipbot-teal)
       - Primary CTAs
       - Links and highlights
       - Icon accents
       
██████ #38BDF8 (flipbot-teal-light)
       - Hover states
       - Gradient endpoints
       - Subtle backgrounds
```

**Purple Family**
```
██████ #8B5CF6 (flipbot-purple)
       - Secondary CTAs
       - Business tier accents
       - Gradient mixing
       
██████ #A78BFA (flipbot-purple-light)
       - Hover states
       - Badge backgrounds
```

**Fuchsia/Pink**
```
██████ rgba(236, 72, 153, 1) (Pink-500)
       - Gradient mixing
       - Featured badges
       - Accent highlights
```

**Orange Family**
```
██████ #F97316 (flipbot-orange)
       - Rating stars
       - Alert highlights
       - Warm accents
       
██████ #FB923C (flipbot-orange-light)
       - Hover states
```

**Green Family (Success)**
```
██████ #10B981 (flipbot-green)
       - Success messages
       - Checkmarks
       - Positive indicators
       
██████ #34D399 (flipbot-green-light)
       - Hover states
```

### Neutral Scale

**Dark Theme (Primary)**
```
██████ #0A0A0A (neutral-950)
       - Page background
       - Darkest elements
       
██████ #171717 (neutral-900)
       - Card backgrounds (60% opacity)
       - Container backgrounds (30-50% opacity)
       
██████ #262626 (neutral-800)
       - Input backgrounds
       - Hover states
       - Table rows
       
██████ #404040 (neutral-700)
       - Borders (default)
       - Dividers
       
██████ #A3A3A3 (neutral-400)
       - Secondary text
       - Placeholders
       
██████ #D4D4D4 (neutral-300)
       - Body text
       - Descriptions
       
██████ #FFFFFF (white)
       - Headings
       - Primary text
       - High contrast
```

### Gradient Applications

**Primary Gradient (Main CTAs)**
```
Linear: from-cyan-500 to-fuchsia-500
Use: Pro CTA button, Popular badge
RGB: rgb(6, 182, 212) → rgb(236, 72, 153)
```

**Secondary Gradient (Alternative CTAs)**
```
Linear: from-cyan-500 to-purple-500
Use: Secondary buttons, highlights
RGB: rgb(6, 182, 212) → rgb(139, 92, 246)
```

**Business Gradient**
```
Linear: from-purple-500 to-fuchsia-500
Use: Business tier CTA
RGB: rgb(139, 92, 246) → rgb(236, 72, 153)
```

**Subtle Background Gradient**
```
Linear: from-cyan-500/10 to-fuchsia-500/10
Use: Section backgrounds, highlights
Opacity: 10% of base colors
```

**Text Gradient (Prices)**
```
Linear: from-cyan-400 to-fuchsia-400
Use: Price displays, special text
Apply: bg-clip-text text-transparent
```

---

## Spacing & Grid System

### Container Widths
```
max-w-7xl:  1280px  (Main content container)
max-w-5xl:  1024px  (Feature comparison table)
max-w-3xl:   768px  (FAQ section, Final CTA)
max-w-2xl:   672px  (Hero description)
```

### Vertical Spacing (Sections)
```
Hero:              py-24 (desktop) / py-16 (mobile)
Pricing Cards:     py-24 (desktop) / py-16 (mobile)
Feature Compare:   py-16
FAQ:               py-16
Testimonials:      py-16
Final CTA:         py-16
```

### Card Spacing
```
Grid Gap:          gap-8 (desktop) / gap-6 (mobile)
Card Padding:      p-8 (standard) / p-10 (featured)
Mobile Padding:    p-6 (all cards)
```

### Typography Spacing
```
Heading → Subheading:  mb-4
Heading → Body:        mb-6
Paragraph spacing:     space-y-4
List items:            space-y-3 or space-y-4
```

### Component Internal Spacing
```
Button padding:     px-6 py-3 (default)
                   px-8 py-4 (large)
                   px-10 py-6 (xl)

Input padding:      px-4 py-3

Card header:        mb-6
Card footer:        mt-8

Icon + Text gap:    gap-2 (default)
                   gap-3 (larger)
```

### Grid System
```
Pricing Cards (Desktop):
  grid-cols-3
  gap-8
  Equal width columns

Testimonials (Desktop):
  grid-cols-3
  gap-6

Mobile (All):
  flex-col or grid-cols-1
  gap-6
```

### Responsive Breakpoints Usage
```
Text Sizes:
  Mobile:  text-3xl → Desktop: text-6xl (Hero)
  Mobile:  text-2xl → Desktop: text-4xl (Section headings)
  Mobile:  text-xl  → Desktop: text-2xl (Card titles)

Padding:
  Mobile:  px-4 py-16 → Desktop: px-8 py-24 (Sections)
  Mobile:  p-6       → Desktop: p-8 (Cards)

Layout:
  Mobile:  flex-col  → Desktop: grid-cols-3 (Cards)
  Mobile:  block     → Desktop: grid (Table)
```

---

## Z-Index Layers

```
Layer 0 (-z-20):  Animated background
Layer 1 (-z-10):  Background decorations
Layer 2 (z-0):    Base content (default)
Layer 3 (z-10):   Cards, modals
Layer 4 (z-50):   Navbar (sticky)
Layer 5 (z-100):  Tooltips, dropdowns
```

---

## Animation Timing

```
Instant:      0ms     (Immediate feedback)
Fast:         100ms   (Micro-interactions)
Normal:       200ms   (Accordions, toggles)
Smooth:       300ms   (Card hovers, transitions)
Slow:         500ms   (Fade-ins, complex animations)

Easing Functions:
  ease-out:   Most exits and entrances
  ease-in:    Subtle exits
  ease-in-out: Smooth both ways
```

---

## Accessibility Color Contrasts

```
White on neutral-950:      21:1 ✓✓✓ (AAA)
neutral-300 on neutral-950: 9:1 ✓✓ (AA Large)
neutral-400 on neutral-950: 6:1 ✓ (AA)
cyan-400 on neutral-950:   10:1 ✓✓ (AA)
```

All text combinations meet WCAG 2.1 Level AA standards.

---

**Document Version**: 1.0  
**Companion to**: PRICING_PAGE_DESIGN.md  
**Last Updated**: October 25, 2025
