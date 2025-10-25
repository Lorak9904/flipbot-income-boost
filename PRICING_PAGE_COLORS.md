# FlipIt Color Palette - Pricing Page Quick Reference

## 🎨 Primary Brand Colors

### Cyan/Teal (Primary Brand)
```css
--flipbot-teal:       #0EA5E9  /* rgb(14, 165, 233) */
--flipbot-teal-light: #38BDF8  /* rgb(56, 189, 248) */
```
**Usage**: Primary CTAs, links, highlights, checkmarks, main gradient

### Purple (Secondary Brand)
```css
--flipbot-purple:       #8B5CF6  /* rgb(139, 92, 246) */
--flipbot-purple-light: #A78BFA  /* rgb(167, 139, 250) */
```
**Usage**: Secondary CTAs, Business tier, gradient mixing

### Fuchsia/Pink (Accent)
```css
--pink-500: #EC4899  /* rgb(236, 72, 153) */
```
**Usage**: Gradient endpoints, featured badges, highlights

### Orange (Warm Accent)
```css
--flipbot-orange:       #F97316  /* rgb(249, 115, 22) */
--flipbot-orange-light: #FB923C  /* rgb(251, 146, 60) */
```
**Usage**: Rating stars, warm accents, alerts

### Green (Success)
```css
--flipbot-green:       #10B981  /* rgb(16, 185, 129) */
--flipbot-green-light: #34D399  /* rgb(52, 211, 153) */
```
**Usage**: Checkmarks, success messages, positive indicators

---

## 🌑 Dark Theme Neutrals

### Background Colors
```css
--neutral-950: #0A0A0A  /* rgb(10, 10, 10) - Page background */
--neutral-900: #171717  /* rgb(23, 23, 23) - Cards (w/ opacity) */
--neutral-800: #262626  /* rgb(38, 38, 38) - Inputs, hovers */
--neutral-700: #404040  /* rgb(64, 64, 64) - Borders, dividers */
```

### Text Colors
```css
--neutral-400: #A3A3A3  /* rgb(163, 163, 163) - Secondary text */
--neutral-300: #D4D4D4  /* rgb(212, 212, 212) - Body text */
--white:       #FFFFFF  /* rgb(255, 255, 255) - Headings, primary text */
```

---

## 🌈 Gradient Recipes

### Primary Gradient (Main CTAs, Featured Badge)
```css
background: linear-gradient(to right, #0EA5E9, #EC4899);
/* from-cyan-500 to-fuchsia-500 */
```
**Apply to**: Pro CTA button, "Most Popular" badge, primary highlights

### Secondary Gradient (Alternative CTAs)
```css
background: linear-gradient(to right, #0EA5E9, #8B5CF6);
/* from-cyan-500 to-purple-500 */
```
**Apply to**: Secondary buttons, alternative highlights

### Business Gradient (Business Tier)
```css
background: linear-gradient(to right, #8B5CF6, #EC4899);
/* from-purple-500 to-fuchsia-500 */
```
**Apply to**: Business plan CTA

### Text Gradient (Prices, Special Text)
```css
background: linear-gradient(to right, #38BDF8, #A78BFA);
background-clip: text;
-webkit-background-clip: text;
color: transparent;
/* from-cyan-400 to-fuchsia-400 with bg-clip-text */
```
**Apply to**: Price amounts, highlighted text

### Subtle Background Gradient (Section Backgrounds)
```css
background: linear-gradient(to right, rgba(14, 165, 233, 0.1), rgba(236, 72, 153, 0.1));
/* from-cyan-500/10 to-fuchsia-500/10 */
```
**Apply to**: Trust section, highlighted areas

---

## 🎯 Component-Specific Colors

### Pricing Cards

#### Standard Card (Starter, Business)
```css
background: rgba(23, 23, 23, 0.5);  /* neutral-900/50 */
border: 1px solid #404040;          /* ring-1 ring-neutral-700 */
backdrop-filter: blur(4px);         /* backdrop-blur-sm */

/* Hover State */
border: 1px solid rgba(14, 165, 233, 0.4);  /* ring-cyan-400/40 */
transform: translateY(-4px);
```

#### Featured Card (Pro)
```css
background: rgba(23, 23, 23, 0.6);  /* neutral-900/60 */
border: 2px solid #0EA5E9;          /* ring-2 ring-cyan-400 */
box-shadow: 0 25px 50px -12px rgba(14, 165, 233, 0.2);  /* shadow-2xl shadow-cyan-500/20 */
backdrop-filter: blur(4px);

/* Hover State */
border: 2px solid #EC4899;  /* ring-fuchsia-400 */
box-shadow: 0 25px 50px -12px rgba(14, 165, 233, 0.3);
transform: translateY(-6px);
```

### Buttons

#### Primary CTA (Pro Plan)
```css
background: linear-gradient(to right, #0EA5E9, #EC4899);
color: white;
box-shadow: 0 10px 15px -3px rgba(236, 72, 153, 0.3);

/* Hover */
background: linear-gradient(to right, #0EA5E9, #D946A6);  /* to-fuchsia-600 */
```

#### Outline Button (Starter Plan)
```css
border: 1px solid #0EA5E9;  /* border-cyan-400 */
color: #0EA5E9;             /* text-cyan-400 */

/* Hover */
background: rgba(14, 165, 233, 0.1);  /* hover:bg-cyan-400/10 */
```

#### Business Button
```css
background: linear-gradient(to right, #8B5CF6, #EC4899);
color: white;
```

### Badges

#### Popular Badge
```css
background: linear-gradient(to right, #0EA5E9, #EC4899);
color: white;
padding: 0.25rem 1rem;
border-radius: 9999px;
font-weight: 600;
```

#### Save Percentage Badge
```css
background: rgba(16, 185, 129, 0.1);  /* bg-green-500/10 */
color: #34D399;                        /* text-green-400 */
```

### Icons

```css
/* Checkmarks */
color: #0EA5E9;  /* text-cyan-400 */

/* Stars (ratings) */
color: #F97316;  /* text-orange-400 */

/* Info icons */
color: #A3A3A3;  /* text-neutral-400 */
```

---

## 📐 Shadow Recipes

### Card Shadows
```css
/* Standard */
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);  /* shadow-md */

/* Featured Card */
box-shadow: 0 25px 50px -12px rgba(14, 165, 233, 0.2);  /* shadow-2xl shadow-cyan-500/20 */

/* Hover State */
box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);  /* shadow-2xl */
```

### Button Shadows
```css
/* Default */
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);  /* shadow-md */

/* Gradient Button */
box-shadow: 0 10px 15px -3px rgba(236, 72, 153, 0.3);  /* shadow-lg shadow-fuchsia-500/30 */

/* Hover */
box-shadow: 0 20px 25px -5px rgba(236, 72, 153, 0.3);  /* shadow-xl */
```

---

## ✅ Accessibility Color Contrasts

All combinations meet WCAG 2.1 Level AA standards:

| Foreground | Background | Contrast | Rating |
|------------|------------|----------|--------|
| white | neutral-950 | 21:1 | ✓✓✓ AAA |
| neutral-300 | neutral-950 | 9:1 | ✓✓ AA Large |
| neutral-400 | neutral-950 | 6:1 | ✓ AA |
| cyan-400 | neutral-950 | 10:1 | ✓✓ AA |
| fuchsia-400 | neutral-950 | 8:1 | ✓✓ AA |

---

## 🎨 Quick Copy-Paste Classes

### Common Combinations

**Card Background**
```html
className="bg-neutral-900/50 backdrop-blur-sm rounded-2xl"
```

**Featured Card Background**
```html
className="bg-neutral-900/60 backdrop-blur-sm rounded-2xl ring-2 ring-cyan-400 shadow-2xl shadow-cyan-500/20"
```

**Primary Button**
```html
className="bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/30"
```

**Outline Button**
```html
className="border border-cyan-400 text-cyan-400 hover:bg-cyan-400/10"
```

**Gradient Text**
```html
className="bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent"
```

**Checkmark Icon**
```html
<CheckCircle className="h-5 w-5 text-cyan-400" />
```

**Section Background Highlight**
```html
className="bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10"
```

---

## 🌐 CSS Custom Properties (Optional)

If you want to use CSS custom properties:

```css
:root {
  /* Brand Colors */
  --color-cyan: 14 165 233;      /* #0EA5E9 */
  --color-cyan-light: 56 189 248;
  --color-purple: 139 92 246;
  --color-purple-light: 167 139 250;
  --color-fuchsia: 236 72 153;
  --color-orange: 249 115 22;
  --color-green: 16 185 129;
  
  /* Neutrals */
  --color-neutral-950: 10 10 10;
  --color-neutral-900: 23 23 23;
  --color-neutral-800: 38 38 38;
  --color-neutral-700: 64 64 64;
  --color-neutral-400: 163 163 163;
  --color-neutral-300: 212 212 212;
}

/* Usage with opacity */
.element {
  background: rgb(var(--color-neutral-900) / 0.5);
  border-color: rgb(var(--color-cyan) / 1);
}
```

---

## 🎯 Color Usage Guidelines

### Do's ✅
- Use cyan gradients for primary CTAs
- Use purple for Business tier differentiation
- Keep text on dark backgrounds white or neutral-300
- Use checkmarks in cyan-400
- Apply subtle opacity to card backgrounds (50-60%)

### Don'ts ❌
- Don't mix warm (orange) with primary gradients
- Don't use bright text on bright backgrounds
- Don't exceed 3 gradient colors in one element
- Don't use pure white backgrounds (breaks dark theme)
- Don't forget backdrop-blur on translucent cards

---

## 📱 Dark Mode Only

This design is **dark mode only** - no light mode variant needed. All colors are optimized for dark backgrounds.

---

**Quick Reference Version**: 1.0  
**Companion to**: PRICING_PAGE_DESIGN.md & PRICING_PAGE_VISUAL_SPECS.md  
**Last Updated**: October 25, 2025
