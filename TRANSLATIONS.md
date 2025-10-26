# Translation Implementation Guide

## Overview
This document describes the translation system implemented for the FlipIt application to support both English (en) and Polish (pl) languages.

## Translation System

### Language Utilities
Located in: `src/components/language-utils.ts`

The translation system uses a centralized utility that:
- Detects current language from cookies
- Provides language switching functionality
- Offers type-safe translation access

### Supported Languages
- **English (en)** - Default language
- **Polish (pl)** - Secondary language

### Usage Pattern

1. **Create translation file** (e.g., `component-translations.ts`):
```typescript
import { Translations } from '../components/language-utils';

export const componentTranslations: Translations = {
  en: {
    key: 'English text',
    // ... more keys
  },
  pl: {
    key: 'Polish text',
    // ... more keys
  }
};
```

2. **Use in component**:
```typescript
import { getTranslations } from '@/components/language-utils';
import { componentTranslations } from './component-translations';

const Component = () => {
  const t = getTranslations(componentTranslations);
  
  return <div>{t.key}</div>;
};
```

## Completed Translations

### Pages
- ✅ **HomePage** - `homepage-translations.ts`
- ✅ **HowItWorksPage** - `howitworks-translations.ts`
- ✅ **GetStartedPage** - `getstarted-translations.ts`
- ✅ **AutomatedResellingPlatformGuide** - `guide-translations.ts`
- ✅ **SuccessStoriesPage** - `successstories-translations.ts`
- ✅ **LoginPage** - `login-translations.ts`
- ✅ **FAQPage** - `faq-translations.ts` (NEW)
- ✅ **NotFound** - `notfound-translations.ts` (NEW)
- ✅ **OlxSuccessPage** - `olxsuccess-translations.ts` (NEW)

### Components
- ✅ **Navbar** - `navbar-translations.ts`
- ✅ **Footer** - `footer-translations.ts`
- ✅ **CookieBanner** - `cookiebanner-translations.ts` (NEW)
- ✅ **UserMenu** - `usermenu-translations.ts` (NEW)
- ✅ **ReviewItemForm** - `reviewitem-translations.ts` (NEW)
- ✅ **ConnectOlxButton** - `connectolx-translations.ts` (NEW)

## Translation Files Created (Not Yet Applied)

The following translation files have been created but not yet integrated into their respective pages:

1. **AddItemPage** - `additem-translations.ts`
2. **UserItemsPage** - `useritems-translations.ts`
3. **ItemDetailPage** - `itemdetail-translations.ts`
4. **ConnectAccountsPage** - `connectaccounts-translations.ts`
5. **SettingsPage** - `settings-translations.ts`

### To Apply These Translations:

For each page above, follow these steps:

1. Import the translation utilities and file:
```typescript
import { getTranslations } from '@/components/language-utils';
import { pageTranslations } from './page-translations';
```

2. Inside the component, initialize translations:
```typescript
const t = getTranslations(pageTranslations);
```

3. Replace hard-coded strings with translation keys:
```typescript
// Before:
<p>Authentication Required</p>

// After:
<p>{t.authRequired}</p>
```

## Pages Not Requiring Translation

- **FeaturesPage** - Route commented out in `App.tsx`
- **Index.tsx** - Not used in routing
- **FacebookCallbackPage** - Empty file (only 1 line)
- **Terms, Privacy, Cookies** - Legal documents loaded from markdown files

## Testing Translation System

### Manual Testing
1. Open the application
2. Look for the language toggle in the Navbar (shows "PL" when in English, "EN" when in Polish)
3. Click to switch languages
4. Verify all translated pages display correct language
5. Check that language preference persists after page reload

### Pages to Test
- Homepage
- How It Works
- Get Started (Waitlist)
- Guide
- Success Stories
- Login
- FAQ
- 404 Page
- Navigation menu
- Footer links
- Cookie banner

## Best Practices

1. **Consistent Keys**: Use descriptive, camelCase keys
2. **Complete Coverage**: Ensure both languages have all keys
3. **Escape Characters**: Use double quotes for strings containing apostrophes
4. **Context**: Group related translations together
5. **Placeholders**: Consider using parameters for dynamic content

## Immediate Next Steps

1. **Complete integration of remaining translation files** - Apply the 5 pre-created translation files to their pages

## Future Enhancements

1. Add more languages (e.g., German, French)
2. Implement lazy loading for translation files
3. Add translation management system
4. Implement missing translations detection
5. Add automated tests for translation coverage

## Notes

- All translation files follow the same structure using the `Translations` type
- The system automatically falls back to English if a key is missing
- Language preference is stored in cookies with 1-year expiration
- Page refreshes automatically when language is changed to apply new translations
