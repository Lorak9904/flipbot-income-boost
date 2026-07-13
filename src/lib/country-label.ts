import type { Language } from '@/components/language-utils';

interface CountryLabelInput {
  country_code?: string | null;
  country_name?: string | null;
}

export const formatCountryLabel = (
  country: CountryLabelInput,
  language: Language,
  fallback = 'OLX'
) => {
  const code = country.country_code?.trim().toUpperCase();
  const providedName = country.country_name?.trim();
  let localizedName = providedName;

  if (code && typeof Intl.DisplayNames === 'function') {
    try {
      localizedName = new Intl.DisplayNames([language], { type: 'region' }).of(code) || providedName;
    } catch {
      localizedName = providedName;
    }
  }

  if (localizedName && code) return `${localizedName} (${code})`;
  return localizedName || code || fallback;
};
