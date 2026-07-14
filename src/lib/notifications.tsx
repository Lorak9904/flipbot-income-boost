import type { ReactNode } from 'react';
import { toast as sonnerToast, type ExternalToast } from 'sonner';

export type NotificationKind = 'default' | 'success' | 'info' | 'warning' | 'error' | 'loading';

export type NotificationOptions = Omit<ExternalToast, 'description' | 'duration'> & {
  description?: ReactNode;
  duration?: number;
  persistent?: boolean;
};

const notificationDurations: Record<Exclude<NotificationKind, 'loading'>, number> = {
  default: 5_000,
  success: 4_500,
  info: 5_000,
  warning: 7_000,
  error: 10_000,
};

const showNotification = (
  kind: NotificationKind,
  title: ReactNode,
  options: NotificationOptions = {},
) => {
  const { persistent, duration, action, description, ...rest } = options;
  const resolvedDuration =
    persistent || action || kind === 'loading'
      ? Number.POSITIVE_INFINITY
      : duration ?? notificationDurations[kind];
  const toastOptions: ExternalToast = {
    ...rest,
    action,
    description,
    duration: resolvedDuration,
  };

  if (kind === 'default') return sonnerToast(title, toastOptions);
  return sonnerToast[kind](title, toastOptions);
};

export const notify = Object.assign(
  (title: ReactNode, options?: NotificationOptions) => showNotification('default', title, options),
  {
    success: (title: ReactNode, options?: NotificationOptions) =>
      showNotification('success', title, options),
    info: (title: ReactNode, options?: NotificationOptions) =>
      showNotification('info', title, options),
    warning: (title: ReactNode, options?: NotificationOptions) =>
      showNotification('warning', title, options),
    error: (title: ReactNode, options?: NotificationOptions) =>
      showNotification('error', title, options),
    loading: (title: ReactNode, options?: NotificationOptions) =>
      showNotification('loading', title, options),
    dismiss: (id?: string | number) => sonnerToast.dismiss(id),
  },
);

export const dismissNotification = notify.dismiss;
