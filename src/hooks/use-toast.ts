import type { ReactNode } from 'react';

import { dismissNotification, notify, type NotificationKind } from '@/lib/notifications';

type ToastInput = {
  id?: string | number;
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  duration?: number;
  persistent?: boolean;
  variant?: 'default' | 'destructive' | Exclude<NotificationKind, 'default' | 'loading'>;
};

const showLegacyToast = ({
  title,
  description,
  action,
  duration,
  id,
  persistent,
  variant = 'default',
}: ToastInput) => {
  const kind: Exclude<NotificationKind, 'loading'> =
    variant === 'destructive' ? 'error' : variant;
  const options = { description, action, duration, id, persistent };
  const toastId = kind === 'default' ? notify(title, options) : notify[kind](title, options);

  return {
    id: toastId,
    dismiss: () => dismissNotification(toastId),
    update: (next: ToastInput) => showLegacyToast({ ...next, id: toastId }),
  };
};

export const toast = showLegacyToast;

export const useToast = () => ({
  toast: showLegacyToast,
  dismiss: dismissNotification,
});
