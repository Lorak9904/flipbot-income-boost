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
    reasons: {
      implemented_not_certified: 'Implemented, but not yet production-certified.',
      unofficial_session_integration: 'Uses a session-based integration, not an official marketplace API.',
      etsy_app_config_missing: 'Etsy app configuration is not complete.',
      operation_not_implemented: 'This operation is not implemented yet.',
    },
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
    reasons: {
      implemented_not_certified: 'Funkcja jest wdrożona, ale nie ma jeszcze certyfikacji produkcyjnej.',
      unofficial_session_integration: 'Połączenie korzysta z sesji, a nie z oficjalnego API platformy.',
      etsy_app_config_missing: 'Konfiguracja aplikacji Etsy nie jest kompletna.',
      operation_not_implemented: 'Ta operacja nie jest jeszcze wdrożona.',
    },
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

export function capabilityReasonLabel(language: string, reasonCode: string | null): string | null {
  if (!reasonCode) return null;
  const translations = getPlatformCapabilityCopy(language).reasons as Record<string, string>;
  return translations[reasonCode] || getPlatformCapabilityCopy(language).unavailable;
}
