import type { CapabilityStatus, IntegrationMethod } from '@/lib/api/platform-capabilities';

const copy = {
  en: {
    status: {
      certified: 'Certified',
      beta: 'Beta',
      experimental: 'Experimental',
      unavailable: 'Unavailable',
    },
    method: {
      official_api: 'Official marketplace API',
      session_based: 'Session-based connection',
    },
    unavailable: 'This operation is not available for this marketplace.',
    loadFailed: 'Marketplace availability could not be checked. Try again.',
  },
  pl: {
    status: {
      certified: 'Certyfikowane',
      beta: 'Beta',
      experimental: 'Eksperymentalne',
      unavailable: 'Niedostępne',
    },
    method: {
      official_api: 'Oficjalne API platformy',
      session_based: 'Połączenie oparte na sesji',
    },
    unavailable: 'Ta operacja nie jest dostępna dla tej platformy.',
    loadFailed: 'Nie udało się sprawdzić dostępności platform. Spróbuj ponownie.',
  },
} as const;

export function getPlatformCapabilityCopy(language: string) {
  return language === 'pl' ? copy.pl : copy.en;
}

export function capabilityStatusLabel(language: string, status: CapabilityStatus): string {
  return getPlatformCapabilityCopy(language).status[status];
}

export function integrationMethodLabel(language: string, method: IntegrationMethod): string {
  return getPlatformCapabilityCopy(language).method[method];
}
