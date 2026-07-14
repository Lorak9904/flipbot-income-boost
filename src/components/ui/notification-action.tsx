import * as React from 'react';

import { cn } from '@/lib/utils';

type NotificationActionProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  altText: string;
};

export const NotificationAction = React.forwardRef<HTMLButtonElement, NotificationActionProps>(
  ({ altText, className, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      aria-label={altText}
      className={cn(
        'inline-flex min-h-9 shrink-0 items-center justify-center rounded-md border border-white/15 px-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950',
        className,
      )}
      {...props}
    />
  ),
);

NotificationAction.displayName = 'NotificationAction';
