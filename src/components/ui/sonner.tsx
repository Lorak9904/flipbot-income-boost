import { CircleAlert, CircleCheck, Info, LoaderCircle, TriangleAlert, X } from 'lucide-react';
import { Toaster as Sonner } from 'sonner';
import { getCurrentLanguage } from '@/components/language-utils';
import { useIsMobile } from '@/hooks/use-mobile';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const isMobile = useIsMobile();

  return (
    <Sonner
      theme="dark"
      position={isMobile ? 'top-center' : 'top-right'}
      duration={6_000}
      visibleToasts={2}
      gap={10}
      closeButton
      richColors
      pauseWhenPageIsHidden
      swipeDirections={['right', 'up']}
      offset={{ right: 20, top: 80 }}
      mobileOffset={{ right: 12, top: 76, left: 12 }}
      containerAriaLabel={getCurrentLanguage() === 'pl' ? 'Powiadomienia' : 'Notifications'}
      icons={{
        success: <CircleCheck className="h-5 w-5" aria-hidden="true" />,
        info: <Info className="h-5 w-5" aria-hidden="true" />,
        warning: <TriangleAlert className="h-5 w-5" aria-hidden="true" />,
        error: <CircleAlert className="h-5 w-5" aria-hidden="true" />,
        loading: <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />,
        close: <X className="h-4 w-4" aria-hidden="true" />,
      }}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast w-[min(400px,calc(100vw-20px))] max-w-full rounded-lg border border-white/10 bg-neutral-950/95 px-4 py-3 text-white shadow-2xl backdrop-blur-xl',
          title: 'break-words text-sm font-semibold leading-5 text-white',
          description: 'break-words text-sm leading-5 text-neutral-300',
          content: 'min-w-0 gap-0.5',
          icon: 'mt-0.5',
          closeButton:
            'border-white/10 bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white focus-visible:ring-2 focus-visible:ring-cyan-400',
          actionButton:
            'min-h-9 rounded-md border border-white/15 bg-white/5 px-3 text-sm font-semibold text-white hover:bg-white/10',
          cancelButton:
            'min-h-9 rounded-md bg-neutral-800 px-3 text-sm font-medium text-neutral-200 hover:bg-neutral-700',
          success: 'border-emerald-500/40 [&_[data-icon]]:text-emerald-400',
          info: 'border-cyan-500/40 [&_[data-icon]]:text-cyan-400',
          warning: 'border-amber-500/40 [&_[data-icon]]:text-amber-400',
          error: 'border-red-500/40 [&_[data-icon]]:text-red-400',
          loading: 'border-cyan-500/40 [&_[data-icon]]:text-cyan-400',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
