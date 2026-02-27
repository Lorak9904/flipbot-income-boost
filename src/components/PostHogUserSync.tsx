import { useEffect, useRef } from 'react';
import { usePostHog } from '@posthog/react';
import { useAuth } from '@/contexts/AuthContext';

export default function PostHogUserSync() {
  const posthog = usePostHog();
  const { user, isAuthenticated } = useAuth();
  const identifiedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!posthog) return;

    if (isAuthenticated && user?.id) {
      const userId = String(user.id);
      if (identifiedUserIdRef.current !== userId) {
        posthog.identify(userId, {
          email: user.email,
          name: user.name,
          provider: user.provider,
          language: user.language,
        });
        identifiedUserIdRef.current = userId;
      }
      return;
    }

    if (identifiedUserIdRef.current) {
      posthog.reset();
      identifiedUserIdRef.current = null;
    }
  }, [
    isAuthenticated,
    posthog,
    user?.email,
    user?.id,
    user?.language,
    user?.name,
    user?.provider,
  ]);

  return null;
}
