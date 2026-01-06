# 🎨 FlipIt Frontend UI Toolbook

**Version**: 1.0  
**Last Updated**: January 6, 2026  
**Purpose**: This document defines the UI characteristics, design patterns, and coding standards for all frontend elements in FlipIt. Use this as your source of truth when creating new components or modifying existing ones.

---

## 📖 How to Use This Toolbook

**When adding a new UI element:**
1. Read the **Vibe** section to understand the design personality
2. Check **Global Design Tokens** to use existing values (never hardcode)
3. Review **Element Characteristics** for the specific pattern you're building
4. Follow the **New Element Creation Procedure**
5. Copy the **Vibe Coding Prompt** into your LLM for consistent generation

**Golden Rule**: If a pattern exists, reuse it. If a token exists, use it. Never invent one-off styles.

---

## 🌟 The Vibe

FlipIt's UI personality is defined by these core principles:

### Visual Personality
- **Density**: Balanced – not cramped, not wasteful. Breathing room matters.
- **Tone**: Professional yet friendly – we're a productivity tool, not a game.
- **Shape**: Rounded and approachable – `rounded-lg` is default, `rounded-full` for pills/badges.
- **Contrast**: Bold gradients for primary actions, subtle for surfaces.
- **Motion**: Subtle and purposeful – quick transitions (200-300ms), no gratuitous animations.

### Interaction Philosophy
- **Micro-interactions**: Buttons scale on hover/active (`hover:scale-[1.02]`, `active:scale-[0.98]`)
- **Feedback**: Immediate visual response to all interactions
- **Accessibility-first**: Every element must be keyboard-navigable with visible focus rings
- **Mobile-responsive**: Touch targets ≥44px, simplified layouts on small screens

### Color Usage
- **Gradients for CTA**: Primary actions use `bg-gradient-primary` (teal gradient)
- **Semantic colors**: `destructive` for delete/danger, `success` for confirmations
- **Neutral surfaces**: Cards, inputs, and backgrounds use HSL semantic tokens
- **Never hardcode**: Use Tailwind color classes or CSS variables only

---

## 🎨 Global Design Tokens

### Color System (HSL Semantic Tokens)
**Base Semantic Colors** (defined in `index.css` via CSS variables):
```css
--background       /* Page background */
--foreground       /* Primary text */
--card             /* Card surface */
--card-foreground  /* Text on cards */
--primary          /* Primary actions (teal: #0EA5E9) */
--secondary        /* Secondary surfaces */
--muted            /* Subdued backgrounds */
--muted-foreground /* Subtle text */
--destructive      /* Errors, delete actions */
--border           /* Borders, dividers */
--input            /* Input backgrounds */
--ring             /* Focus ring color */
```

**FlipBot Brand Colors** (use for special cases):
```typescript
flipbot-teal         // #0EA5E9 (primary brand)
flipbot-teal-light   // #38BDF8
flipbot-purple       // #8B5CF6
flipbot-purple-light // #A78BFA
flipbot-orange       // #F97316
flipbot-orange-light // #FB923C
flipbot-green        // #10B981
flipbot-green-light  // #34D399
flipbot-gray         // #8E9196
flipbot-lightgray    // #F1F1F1
```

**Gradient Classes** (predefined in Tailwind config):
```typescript
bg-gradient-primary   // Linear: teal to light teal
bg-gradient-secondary // Linear: teal to purple
bg-gradient-accent    // Linear: orange to light orange
bg-gradient-success   // Linear: green to light green
```

**Token Usage Rules**:
- ✅ Always use semantic tokens (`bg-background`, `text-foreground`)
- ✅ Use brand colors sparingly (hero sections, logos, special CTAs)
- ❌ Never hardcode hex values in components
- ❌ Never create one-off color values without adding to config

---

### Typography
**Font Families**:
- **Sans (body text)**: `font-sans` → Inter (300, 400, 500, 600, 700)
- **Headings**: `font-heading` → Poppins (400, 500, 600, 700)

**Text Scale** (use Tailwind defaults):
```typescript
text-xs    // 0.75rem  (12px)
text-sm    // 0.875rem (14px)
text-base  // 1rem     (16px) – body default
text-lg    // 1.125rem (18px)
text-xl    // 1.25rem  (20px)
text-2xl   // 1.5rem   (24px) – card titles
text-3xl   // 1.875rem (30px)
text-4xl   // 2.25rem  (36px)
text-5xl   // 3rem     (48px) – hero headings
```

**Typography Rules**:
- All `<h1>`–`<h6>` use `font-heading font-semibold` by default (set in `index.css`)
- Body text: `font-sans` + `text-base`
- Captions/metadata: `text-sm text-muted-foreground`
- Never mix font families arbitrarily

---

### Spacing Scale
**Use Tailwind's default scale** (0.25rem = 4px unit):
```typescript
p-1   // 0.25rem (4px)
p-2   // 0.5rem  (8px)
p-3   // 0.75rem (12px)
p-4   // 1rem    (16px)  ← Common padding
p-6   // 1.5rem  (24px)  ← Card padding
p-8   // 2rem    (32px)
p-10  // 2.5rem  (40px)
p-12  // 3rem    (48px)
```

**Spacing Rules**:
- **Cards**: Default padding `p-6` (header/content/footer)
- **Buttons**: `px-4 py-2` (default), `px-8` (lg), `px-10` (xl)
- **Sections**: `py-12` or `py-16` for vertical rhythm
- **Gaps**: Use `gap-2`, `gap-4`, `gap-6` for flex/grid spacing
- ❌ Never use arbitrary values like `p-[13px]` unless absolutely required

---

### Border Radius
**Defined as CSS variables**:
```css
--radius: 1rem;  /* Base radius */
```

**Classes** (in Tailwind config):
```typescript
rounded-sm  // calc(var(--radius) - 4px) = 0.75rem
rounded-md  // calc(var(--radius) - 2px) = 0.875rem  ← Default for buttons/inputs
rounded-lg  // var(--radius) = 1rem                  ← Default for cards
rounded-full // Full pill shape (badges, avatars)
rounded-xl  // 1.25rem
rounded-2xl // 1.5rem
```

**Radius Rules**:
- **Cards/Panels**: `rounded-lg`
- **Buttons/Inputs**: `rounded-md`
- **Badges/Pills**: `rounded-full`
- **Modal corners**: `sm:rounded-lg` (flat on mobile)

---

### Shadows
**Use Tailwind defaults**:
```typescript
shadow-sm  // Subtle elevation
shadow-md  // Default card shadow
shadow-lg  // Elevated cards, hover states
shadow-xl  // Modals, popovers
shadow-2xl // Hero elements
```

**Shadow Rules**:
- **Cards**: `shadow-sm` default, `hover:shadow-lg` on interactive cards
- **Buttons**: `shadow-md`, `hover:shadow-lg` on gradient buttons
- **Modals**: `shadow-lg`
- **Dropdowns**: `shadow-md`

---

### Animations & Transitions
**Predefined Keyframes** (in Tailwind config):
```typescript
animate-fade-in      // Fade in + translateY(10px)  | 500ms
animate-fade-out     // Fade out + translateY(10px) | 500ms
animate-scale-in     // Scale from 0.95 to 1        | 300ms
animate-bounce-light // Gentle bounce               | 2s infinite
animate-accordion-down // Radix accordion          | 200ms
animate-accordion-up   // Radix accordion          | 200ms
```

**Transition Classes**:
```typescript
transition-all       // Smooth all properties (200ms default)
transition-colors    // Color changes only
transition-transform // Transform only
duration-200         // 200ms
duration-300         // 300ms
ease-out            // Standard easing
```

**Animation Rules**:
- Default transitions: `transition-all duration-200 ease-out`
- Hover effects: `hover:scale-[1.02]` (buttons), `hover:opacity-90`
- Active states: `active:scale-[0.98]`
- **Motion preferences**: Respect `prefers-reduced-motion` (use Tailwind's `motion-reduce:` prefix)
- ❌ No animations longer than 500ms for UI feedback
- ❌ No continuous animations except loading states

---

## 🧩 Element Characteristics

This section defines **consistent characteristics** for each UI element type. Follow these checklists when building or modifying components.

---

### 1. Buttons

**Component**: `src/components/ui/button.tsx`

**Variants**:
```typescript
default    // bg-gradient-primary (teal gradient) – primary CTA
destructive // bg-destructive – delete, cancel, danger
outline    // border + bg-background – secondary action
secondary  // bg-gradient-secondary (teal-to-purple) – special CTAs
accent     // bg-gradient-accent (orange) – promotional
success    // bg-gradient-success (green) – confirmations
ghost      // Transparent, hover:bg-accent – tertiary/icon actions
link       // Underlined text link
```

**Sizes**:
```typescript
sm      // h-9 px-3        – Compact buttons
default // h-10 px-4 py-2  – Standard
lg      // h-11 px-8       – Prominent
xl      // h-12 px-10 py-6 text-lg – Hero CTAs
icon    // h-10 w-10       – Icon-only square
```

**States & Behavior**:
- **Default**: Base variant styling
- **Hover**: `hover:scale-[1.02] hover:shadow-lg` (gradient variants)
- **Active**: `active:scale-[0.98]`
- **Focus**: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
- **Disabled**: `disabled:pointer-events-none disabled:opacity-50`
- **Loading**: Add `<Loader2 className="animate-spin" />` icon, disable button

**Icon Usage**:
- Icons: `[&_svg]:size-4 [&_svg]:shrink-0`
- Left icon: Place before text in `gap-2` layout
- Right icon: Place after text
- Icon-only: Use `size="icon"` variant

**Copy Rules**:
- Use action verbs: "Save", "Upload", "Delete", "Continue"
- Sentence case (not ALL CAPS): "Get Started", not "GET STARTED"
- Destructive actions: "Delete Item" (explicit), not "OK"

**Do's**:
- ✅ Use gradient variants for primary actions
- ✅ Provide visual hierarchy (primary → outline → ghost)
- ✅ Include loading states for async actions
- ✅ Use `asChild` prop to render as `<Link>` if needed

**Don'ts**:
- ❌ Never disable without explaining why (use tooltip)
- ❌ Don't overuse gradients (max 1-2 gradient buttons per view)
- ❌ Don't use generic labels like "Submit" or "OK" without context

---

### 2. Inputs & Forms

**Components**: `input.tsx`, `textarea.tsx`, `label.tsx`, `form.tsx` (React Hook Form wrapper)

**Structure Pattern**:
```tsx
<FormField>
  <FormLabel>Field Name</FormLabel>
  <FormControl>
    <Input placeholder="Enter value..." />
  </FormControl>
  <FormDescription>Helper text (optional)</FormDescription>
  <FormMessage /> {/* Error message */}
</FormField>
```

**Input Styling**:
- Base: `h-10 rounded-md border border-input bg-background px-3 py-2`
- Focus: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
- Error: Add `border-destructive` when validation fails
- Disabled: `disabled:cursor-not-allowed disabled:opacity-50`

**Label Rules**:
- Always pair inputs with labels (use `<Label>` component)
- Required fields: Add `*` or "(required)" suffix
- Optional fields: Add "(optional)" suffix for clarity

**Placeholder Rules**:
- Use for examples: "e.g., john@example.com"
- Never replace labels with placeholders
- Keep concise (1-3 words)

**Validation Timing**:
- **On blur**: Validate when user leaves field
- **On submit**: Full form validation
- **Real-time**: Only for critical fields (password strength, username availability)

**Error Handling**:
- Display errors via `<FormMessage>` (auto-shown by `react-hook-form`)
- Error text: `text-sm text-destructive`
- Inline errors below field (not tooltips)

**Do's**:
- ✅ Use React Hook Form for validation
- ✅ Show clear error messages ("Email is required", not "Invalid input")
- ✅ Provide helper text for complex fields
- ✅ Group related fields (use `<fieldset>` or sections)

**Don'ts**:
- ❌ Don't validate on every keystroke (annoying)
- ❌ Don't use placeholder-only labels (accessibility issue)
- ❌ Don't show success checkmarks on every field (noisy)

---

### 3. Cards & Panels

**Component**: `src/components/ui/card.tsx`

**Structure**:
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Subtitle</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Main content */}
  </CardContent>
  <CardFooter>
    {/* Actions */}
  </CardFooter>
</Card>
```

**Styling**:
- Base: `rounded-lg border bg-card text-card-foreground shadow-sm`
- Padding: `p-6` for header/content/footer
- Header spacing: `space-y-1.5` (title + description)
- Footer: `flex items-center` (horizontal button layout)

**Interactive Cards**:
- Hoverable: Add `hover:shadow-lg transition-shadow cursor-pointer`
- Clickable: Wrap entire card in `<button>` or `<Link>` with proper ARIA
- Selected state: Add `ring-2 ring-primary`

**Card Variants** (custom):
- **Gradient card**: Use `bg-gradient-card` for hero/featured cards
- **Flat card**: Remove `shadow-sm` for embedded cards
- **Bordered card**: Keep default `border`

**Do's**:
- ✅ Use cards for discrete content blocks
- ✅ Keep card actions in footer (primary on right)
- ✅ Use `CardDescription` for metadata/subtitles

**Don'ts**:
- ❌ Don't nest cards more than 2 levels deep
- ❌ Don't mix padding inconsistently (stick to `p-6`)
- ❌ Don't make entire card clickable if only one action is valid

---

### 4. Modals & Dialogs

**Component**: `src/components/ui/dialog.tsx`, `alert-dialog.tsx`, `sheet.tsx`

**Dialog Structure**:
```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    {/* Content */}
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Sizing**:
- Default max-width: `max-w-lg` (512px)
- Large: `max-w-2xl` (672px)
- Full-width mobile: `w-full` with `sm:rounded-lg`

**Overlay**:
- Background: `bg-black/80` (semi-transparent)
- Animation: `fade-in-0` / `fade-out-0`

**Close Behavior**:
- **X button**: Top-right corner, `opacity-70 hover:opacity-100`
- **Escape key**: Auto-handled by Radix Dialog
- **Overlay click**: Dismissible by default (can disable with `onInteractOutside`)

**Footer Layout**:
- Mobile: `flex-col-reverse` (primary on top)
- Desktop: `sm:flex-row sm:justify-end sm:space-x-2` (primary on right)

**Focus Management**:
- **Initial focus**: First focusable element (input or primary button)
- **Focus trap**: Auto-enabled by Radix
- **Return focus**: Auto-returns to trigger on close

**Do's**:
- ✅ Use `<AlertDialog>` for destructive confirmations
- ✅ Place primary action on right (desktop) / top (mobile)
- ✅ Keep modals focused (single task)
- ✅ Use `DialogDescription` for context

**Don'ts**:
- ❌ Don't nest modals (use separate flows)
- ❌ Don't disable overlay click without good reason
- ❌ Don't exceed `max-w-2xl` (use Sheet for wide content)

---

### 5. Tables & Lists

**Component**: `src/components/ui/table.tsx`

**Structure**:
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Column 1</TableHead>
      <TableHead>Column 2</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Data 1</TableCell>
      <TableCell>Data 2</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

**Styling**:
- Row hover: `hover:bg-muted/50 transition-colors`
- Row borders: `border-b`
- Header: `font-medium text-muted-foreground`
- Cell padding: `p-4` default, `p-2` compact

**Empty States**:
```tsx
<TableRow>
  <TableCell colSpan={columns} className="h-24 text-center">
    <p className="text-muted-foreground">No results found.</p>
  </TableCell>
</TableRow>
```

**Loading States**:
- Use `<Skeleton>` components in cells
- Show placeholder rows (3-5)
- Disable sorting/filtering during load

**Sorting/Filtering**:
- Sort icons: Use `lucide-react` `ArrowUpDown`, `ArrowUp`, `ArrowDown`
- Filter UI: Place above table (not inline in headers)
- Active state: Highlight sorted column header

**Responsive Tables**:
- Mobile: Convert to card list or horizontal scroll (`overflow-x-auto`)
- Sticky headers: Add `sticky top-0 bg-background z-10` to `<TableHeader>`

**Do's**:
- ✅ Show empty states (never blank tables)
- ✅ Use hover states for scanability
- ✅ Limit columns on mobile (≤3)

**Don'ts**:
- ❌ Don't make entire rows clickable if only one action is valid
- ❌ Don't hide critical data on mobile (prioritize columns)
- ❌ Don't use tables for non-tabular data (use cards)

---

### 6. Navigation

**Components**: `src/components/Navbar.tsx`, `sidebar.tsx`

**Navbar Pattern**:
- Height: `h-16` (64px)
- Layout: `flex items-center justify-between px-4 md:px-6`
- Logo: Left side
- Nav links: Center (desktop) or hidden (mobile)
- User menu: Right side

**Active State**:
- Indicator: Underline (`border-b-2 border-primary`) or background (`bg-accent`)
- Text: `text-primary` or `font-semibold`

**Mobile Navigation**:
- Hamburger menu: Use `<Sheet>` component (slide-in drawer)
- Icon size: `h-6 w-6`
- Full-height drawer with close button

**Sidebar (if used)**:
- Width: `w-64` (256px) desktop, full-width mobile
- Collapsible: Toggle button, `w-16` collapsed
- Active link: `bg-sidebar-accent text-sidebar-accent-foreground`

**Breadcrumbs** (if used):
- Separator: `/` or `>` (use `lucide-react` `ChevronRight`)
- Current page: `text-foreground font-medium` (no link)
- Previous pages: `text-muted-foreground hover:text-foreground`

**Do's**:
- ✅ Highlight active page clearly
- ✅ Make logo a link to home
- ✅ Ensure mobile menu is keyboard-accessible

**Don'ts**:
- ❌ Don't have multiple active states (confusing)
- ❌ Don't hide critical actions in mobile menu
- ❌ Don't use horizontal scroll for nav links

---

### 7. Feedback (Toasts, Alerts, Notifications)

**Components**: `toast.tsx`, `toaster.tsx`, `alert.tsx`, `use-toast.ts`

**Toast Usage** (via `useToast` hook):
```tsx
const { toast } = useToast();

toast({
  title: "Success!",
  description: "Item uploaded successfully.",
  variant: "default", // or "destructive"
});
```

**Toast Variants**:
- **default**: Info/success (no special styling)
- **destructive**: Errors (`bg-destructive text-destructive-foreground`)

**Toast Behavior**:
- **Position**: Bottom-right (desktop), bottom-center (mobile)
- **Duration**: 5000ms default (use `duration` prop to override)
- **Dismissible**: Auto-dismisses or manual close (X button)
- **Stacking**: Max 3 visible, oldest auto-dismissed

**Alert Component** (for inline notices):
```tsx
<Alert variant="default | destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Heads up!</AlertTitle>
  <AlertDescription>Important message here.</AlertDescription>
</Alert>
```

**Alert Styling**:
- Padding: `p-4`
- Border: `border` + rounded
- Icon: Left-aligned, `h-4 w-4`

**Severity Mapping**:
- **Info**: `<Alert>` default variant or toast default
- **Success**: Toast with success title/green icon (optional)
- **Warning**: Alert with warning icon (`AlertTriangle`)
- **Error**: `variant="destructive"` for both

**Loading States**:
- **Spinners**: Use `<Loader2 className="animate-spin" />`
- **Skeletons**: Use `<Skeleton>` for content placeholders
- **Inline loading**: Show spinner + "Loading..." text

**Do's**:
- ✅ Use toasts for transient feedback (saved, deleted)
- ✅ Use alerts for persistent context (warnings, info blocks)
- ✅ Provide actionable error messages ("Check your connection and retry")

**Don'ts**:
- ❌ Don't stack more than 3 toasts (noisy)
- ❌ Don't use toasts for critical errors (use modal)
- ❌ Don't show loading spinners longer than 3s without progress indicator

---

### 8. Icons

**Library**: `lucide-react`

**Icon Sizing**:
```tsx
h-4 w-4  // Default inline icon (16px)
h-5 w-5  // Larger inline (20px)
h-6 w-6  // Nav icons, larger buttons (24px)
h-8 w-8  // Feature icons (32px)
h-12 w-12 // Hero icons (48px)
```

**Icon Usage**:
- **With buttons**: Defined via `[&_svg]:size-4` in button component
- **Standalone**: Wrap in container with `flex items-center justify-center`
- **Color**: Inherit text color (`text-foreground`, `text-muted-foreground`)

**Icon Style**:
- **Stroke-based**: All Lucide icons are consistent stroke weight
- **No mixing**: Don't mix filled and stroked icons in the same context

**Alignment**:
- **Vertical centering**: Use `flex items-center gap-2`
- **Baseline alignment**: For inline text, ensure icons don't disrupt line height

**Do's**:
- ✅ Use semantic icons (Trash for delete, Check for success)
- ✅ Keep icon sizes consistent in a given context
- ✅ Provide `aria-label` for icon-only buttons

**Don'ts**:
- ❌ Don't use decorative icons excessively
- ❌ Don't resize icons arbitrarily (stick to standard sizes)
- ❌ Don't use icons without text labels unless universally understood

---

### 9. Spacing & Layout

**Container Rules**:
- Max width: `container` class (responsive, centered, `max-w-screen-2xl`)
- Padding: `px-4` mobile, `md:px-6` desktop

**Section Spacing**:
- Vertical rhythm: `py-12` (48px) or `py-16` (64px) between sections
- Hero sections: `py-20` or `py-24`

**Grid Layouts**:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Cards or items */}
</div>
```

**Flex Layouts**:
```tsx
<div className="flex flex-col md:flex-row items-center gap-4">
  {/* Elements */}
</div>
```

**Responsive Breakpoints** (Tailwind defaults):
```typescript
sm:  640px   // Small tablets
md:  768px   // Tablets
lg:  1024px  // Laptops
xl:  1280px  // Desktops
2xl: 1536px  // Large screens
```

**Do's**:
- ✅ Use consistent gap values (`gap-2`, `gap-4`, `gap-6`)
- ✅ Stack vertically on mobile (`flex-col` → `md:flex-row`)
- ✅ Use grid for uniform layouts, flexbox for flexible

**Don'ts**:
- ❌ Don't mix arbitrary spacing (`gap-[17px]`)
- ❌ Don't forget mobile-first design (start with `flex-col`)
- ❌ Don't exceed `2xl` breakpoint (diminishing returns)

---

### 10. Motion & Animations

**Transition Defaults**:
```tsx
className="transition-all duration-200 ease-out"
```

**Hover Effects**:
- **Buttons**: `hover:scale-[1.02]` + `hover:shadow-lg`
- **Cards**: `hover:shadow-lg`
- **Links**: `hover:text-primary` or `hover:underline`

**Animation Usage**:
- **Page load**: Use `animate-fade-in` for staggered content
- **Modal open**: Radix auto-handles animations (zoom + fade)
- **Loading**: `animate-spin` for spinners, `animate-pulse` for skeletons

**Reduced Motion**:
```tsx
className="transition-all motion-reduce:transition-none"
```

**Animation Timing**:
- UI feedback: 200-300ms
- Page transitions: 300-500ms
- Loading indicators: Continuous (until loaded)

**Do's**:
- ✅ Keep animations subtle and purposeful
- ✅ Use `motion-reduce:` prefix for accessibility
- ✅ Test on slower devices (avoid jank)

**Don'ts**:
- ❌ Don't animate layout shifts (causes reflow)
- ❌ Don't use animations longer than 500ms for UI
- ❌ Don't animate everything (visual noise)

---

### 11. Accessibility Baseline

**Keyboard Navigation**:
- **Tab order**: Logical, matches visual flow
- **Focus visible**: All interactive elements show focus ring (`focus-visible:ring-2`)
- **Skip links**: Provide skip-to-content link for screen readers

**Focus Ring Standard**:
```tsx
focus-visible:outline-none 
focus-visible:ring-2 
focus-visible:ring-ring 
focus-visible:ring-offset-2
```

**ARIA Patterns**:
- **Buttons**: Use `<button>` (not `<div onClick>`)
- **Links**: Use `<a>` with `href` (not `<span>`)
- **Modals**: Radix Dialog auto-handles `aria-modal`, focus trap
- **Forms**: Label all inputs, use `aria-describedby` for errors

**Color Contrast**:
- Text: Minimum 4.5:1 for normal text (WCAG AA)
- Large text: Minimum 3:1 for headings
- Interactive elements: Ensure visible focus indicators

**Screen Reader Support**:
- **Icon-only buttons**: Add `aria-label` or `<span className="sr-only">Label</span>`
- **Loading states**: Use `aria-live="polite"` for updates
- **Error messages**: Auto-announced via `<FormMessage>` (React Hook Form)

**Do's**:
- ✅ Test with keyboard only (no mouse)
- ✅ Use semantic HTML (`<button>`, `<nav>`, `<main>`)
- ✅ Provide text alternatives for icons/images

**Don'ts**:
- ❌ Don't remove focus outlines (customize with ring classes)
- ❌ Don't rely on color alone (use icons + text)
- ❌ Don't create keyboard traps (ensure escape routes)

---

## 🛠️ New Element Creation Procedure

Follow this checklist **before** writing any code for a new UI element:

### Step 1: Specification (Required Inputs)
Define these before building:
- [ ] **Purpose**: What problem does this solve? (1-2 sentences)
- [ ] **User Story**: "As a [user], I want to [action] so that [benefit]"
- [ ] **States**: Default, hover, focus, active, disabled, loading, error, empty
- [ ] **Responsive Behavior**: How does it adapt on mobile/tablet/desktop?
- [ ] **Accessibility**: Keyboard navigation, focus management, ARIA roles
- [ ] **Dependencies**: What existing components/tokens will you use?

### Step 2: Design API
Define the component interface:
- [ ] **Props**: What configuration options are needed? (Keep minimal!)
- [ ] **Variants**: What visual variations exist? (e.g., size, color)
- [ ] **Events**: What callbacks are needed? (e.g., `onClick`, `onChange`)
- [ ] **Default Values**: What are sensible defaults?

Example:
```tsx
interface NewComponentProps {
  variant?: "default" | "secondary" | "destructive";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}
```

### Step 3: Implementation Checklist
- [ ] Reuse existing primitives (shadcn/ui, Radix, Tailwind)
- [ ] Use semantic tokens (no hardcoded colors/spacing)
- [ ] Implement all states (default, hover, focus, disabled, loading)
- [ ] Add responsive classes (`sm:`, `md:`, `lg:`)
- [ ] Add accessibility attributes (`aria-*`, focus-visible)
- [ ] Use `cva` (class-variance-authority) for variants
- [ ] Use `cn()` utility for className merging
- [ ] Forward refs (`React.forwardRef`) for native elements

### Step 4: Definition of Done
- [ ] Component matches design spec (visuals, spacing, colors)
- [ ] All states implemented and tested
- [ ] Keyboard navigation works (tab, enter, escape)
- [ ] Focus ring visible and styled consistently
- [ ] Mobile responsive (tested at `sm`, `md`, `lg` breakpoints)
- [ ] No console errors or warnings
- [ ] No hardcoded values (uses tokens)
- [ ] Props API is minimal and intuitive
- [ ] Inline docs for non-obvious behavior (TSDoc comments)

---

## 🤖 Vibe Coding Prompt (Copy/Paste for LLM)

**Use this prompt when asking an LLM to generate new UI components for FlipIt:**

```
You are building a new UI component for FlipIt, a React + TypeScript + Tailwind CSS + shadcn/ui application.

STRICT REQUIREMENTS:
1. **Design System**: Use shadcn/ui components (based on Radix UI primitives) and Tailwind CSS exclusively.
2. **No Hardcoding**: NEVER hardcode colors, spacing, or font sizes. Use semantic tokens from Tailwind config:
   - Colors: bg-background, text-foreground, border-border, bg-primary, text-destructive, etc.
   - Spacing: p-4, gap-6, py-12 (Tailwind scale only)
   - Typography: text-sm, text-base, text-2xl, font-heading, font-sans
   - Radius: rounded-md, rounded-lg, rounded-full
3. **Existing Primitives**: Reuse existing shadcn/ui components: Button, Card, Input, Dialog, Badge, etc. (located in src/components/ui/)
4. **Variants**: Use class-variance-authority (cva) for component variants
5. **Styling Utility**: Use cn() from @/lib/utils for className merging
6. **States**: Implement ALL states:
   - Default, Hover, Focus, Active, Disabled, Loading, Error, Empty
   - Use: hover:, focus-visible:, active:, disabled:, data-[state=*]:
7. **Accessibility**:
   - Keyboard navigation: Ensure tab order is logical
   - Focus rings: focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
   - ARIA: Use semantic HTML (button, a, nav) and ARIA attributes where needed
   - Screen readers: Add aria-label for icon-only elements, sr-only for hidden text
8. **Responsive Design**:
   - Mobile-first: Start with base classes, add sm:, md:, lg: breakpoints
   - Touch targets: Minimum 44px (h-11) for buttons on mobile
9. **Motion**:
   - Transitions: transition-all duration-200 ease-out (or duration-300)
   - Hover effects: hover:scale-[1.02] for buttons, hover:shadow-lg for cards
   - Respect reduced motion: motion-reduce:transition-none
10. **Code Quality**:
    - TypeScript: Fully typed props, use React.FC or React.forwardRef
    - Props API: Minimal and intuitive (only essential props)
    - Ref forwarding: Use React.forwardRef for native elements
    - No new libraries: Use existing dependencies unless absolutely required

COMPONENT CHECKLIST (I will follow):
☑️ I will not invent styles (use tokens only)
☑️ I will reuse existing primitives (shadcn/ui components)
☑️ I will keep props minimal (only what's needed)
☑️ I will implement all states (default, hover, focus, disabled, loading, error, empty)
☑️ I will ensure accessibility (keyboard nav, focus rings, ARIA)
☑️ I will make it responsive (mobile-first with breakpoints)
☑️ I will use cva for variants and cn() for className merging
☑️ I will add inline TSDoc comments for non-obvious behavior
☑️ I will test reduced motion preferences (motion-reduce:)

VISUAL VIBE:
- Tone: Professional yet friendly (productivity tool, not a game)
- Shape: Rounded (rounded-lg for cards, rounded-md for buttons)
- Motion: Subtle and purposeful (200-300ms transitions, scale effects)
- Colors: Bold gradients for CTAs, neutral surfaces otherwise
- Spacing: Balanced (not cramped, not wasteful – stick to p-4, p-6, gap-4)

EXAMPLE COMPONENT STRUCTURE:
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const componentVariants = cva(
  "base-classes-here",
  {
    variants: {
      variant: {
        default: "...",
        secondary: "...",
      },
      size: {
        sm: "...",
        md: "...",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

interface ComponentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof componentVariants> {
  // Custom props here
}

const Component = React.forwardRef<HTMLDivElement, ComponentProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(componentVariants({ variant, size, className }))}
        {...props}
      />
    )
  }
)
Component.displayName = "Component"

export { Component, componentVariants }

NOW BUILD: [Describe the component you need here]
```

---

## 📚 Examples

### Example 1: Tag/Badge Component

**Specification**:
- **Purpose**: Visual label for categories, status, or metadata
- **Variants**: default (primary), secondary, destructive, outline
- **Sizes**: sm, default
- **States**: Default, hover (interactive badges), disabled
- **Accessibility**: Use semantic HTML (`<span>` or `<button>` if clickable)

**Implementation** (already exists in `badge.tsx`):
```tsx
<Badge variant="default">New</Badge>
<Badge variant="secondary">In Progress</Badge>
<Badge variant="destructive">Urgent</Badge>
<Badge variant="outline">Optional</Badge>
```

**Usage Rules**:
- Use for status indicators, tags, counts
- Don't overuse (max 3-5 badges per item)
- If clickable, use `<button>` with badge styles

---

### Example 2: ConfirmDeleteDialog Pattern

**Specification**:
- **Purpose**: Confirm destructive action before deleting item
- **Components**: AlertDialog (not Dialog, because destructive)
- **States**: Default, loading (during deletion), error (if fails)
- **Accessibility**: Focus on "Cancel" initially, "Delete" is destructive variant

**Implementation**:
```tsx
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive" size="sm">
      <Trash className="h-4 w-4" />
      Delete
    </Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone. This will permanently delete your item.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction 
        onClick={handleDelete} 
        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
      >
        {isDeleting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Deleting...
          </>
        ) : (
          "Delete"
        )}
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

**Usage Rules**:
- Always use `<AlertDialog>` for destructive confirmations
- Explain consequences in description
- Show loading state during async action
- Handle errors inline or with toast

---

### Example 3: EmptyState Component

**Specification**:
- **Purpose**: Friendly message when no data exists
- **Variants**: default (with action), info-only (no action)
- **Components**: Custom component using existing primitives
- **States**: Default only (static)

**Implementation**:
```tsx
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && (
        <div className="mb-4 text-muted-foreground">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-md">
        {description}
      </p>
      {action}
    </div>
  );
};

// Usage:
<EmptyState
  icon={<Package className="h-12 w-12" />}
  title="No items yet"
  description="Upload your first item to get started with automated listings."
  action={
    <Button>
      <Upload className="h-4 w-4" />
      Upload Item
    </Button>
  }
/>
```

**Usage Rules**:
- Use for empty tables, lists, dashboards
- Provide clear action to resolve (if applicable)
- Keep description concise (1-2 sentences)

---

## 🎯 Final Checklist

Before committing a new UI element, verify:

- [ ] Component uses semantic tokens (no hardcoded values)
- [ ] All states implemented (default, hover, focus, disabled, loading, error, empty)
- [ ] Keyboard navigation works (tab, enter, escape)
- [ ] Focus ring visible and consistent
- [ ] Mobile responsive (tested at `sm`, `md`, `lg`)
- [ ] Uses existing primitives (shadcn/ui, Radix, Tailwind)
- [ ] Props API is minimal and intuitive
- [ ] Accessibility attributes added (`aria-*`, semantic HTML)
- [ ] No console errors or warnings
- [ ] Follows FlipIt's visual vibe (rounded, gradient CTAs, subtle motion)
- [ ] Inline docs for non-obvious behavior (TSDoc)

---

## 📖 References

- **shadcn/ui Docs**: [ui.shadcn.com](https://ui.shadcn.com)
- **Radix UI Primitives**: [radix-ui.com](https://radix-ui.com)
- **Tailwind CSS**: [tailwindcss.com](https://tailwindcss.com)
- **Lucide Icons**: [lucide.dev](https://lucide.dev)
- **WCAG 2.1 Guidelines**: [w3.org/WAI/WCAG21](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Maintained by**: FlipIt Frontend Team  
**Questions?**: Check existing components in `src/components/ui/` or review this toolbook.  
**Updates**: This document evolves with the design system. Propose changes via PR.
