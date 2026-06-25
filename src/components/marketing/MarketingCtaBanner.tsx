import { ReactNode } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HeroCTA, SecondaryAction } from '@/components/ui/button-presets';

interface CtaAction {
  text: string;
  href: string;
  onClick?: () => void;
}

interface MarketingCtaBannerProps {
  title: string;
  description?: string;
  primaryAction: CtaAction;
  secondaryAction?: CtaAction;
  eyebrow?: string;
  proofPoints?: string[];
  footer?: ReactNode;
  maxWidthClassName?: string;
  className?: string;
}

export const MarketingCtaBanner = ({
  title,
  description,
  primaryAction,
  secondaryAction,
  eyebrow,
  proofPoints,
  footer,
  maxWidthClassName = 'max-w-3xl',
  className = '',
}: MarketingCtaBannerProps) => {
  return (
    <div
      className={`relative mx-auto w-full ${maxWidthClassName} overflow-hidden rounded-3xl border border-cyan-300/20 bg-neutral-950/85 p-6 text-center shadow-2xl shadow-cyan-500/10 backdrop-blur md:p-8 md:text-left ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-28 left-10 h-56 w-56 rounded-full bg-fuchsia-400/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative grid gap-7 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <div>
          {eyebrow && (
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              {eyebrow}
            </span>
          )}

          <h2 className="text-3xl font-extrabold leading-tight text-white md:text-4xl">
            {title}
          </h2>

          {description && (
            <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-300 md:text-lg">
              {description}
            </p>
          )}

          {proofPoints && proofPoints.length > 0 && (
            <div className="mt-5 flex flex-wrap justify-center gap-2 md:justify-start">
              {proofPoints.map((point) => (
                <span
                  key={point}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-neutral-200"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" aria-hidden="true" />
                  {point}
                </span>
              ))}
            </div>
          )}

          {footer && <div className="mt-5 text-sm leading-6 text-neutral-400">{footer}</div>}
        </div>

        <div className="flex w-full flex-col items-stretch gap-3 md:w-[15rem]">
          <HeroCTA asChild className="w-full justify-center">
            <Link to={primaryAction.href} onClick={primaryAction.onClick}>
              {primaryAction.text}
            </Link>
          </HeroCTA>

          {secondaryAction && (
            <SecondaryAction asChild className="w-full justify-center">
              <Link to={secondaryAction.href} onClick={secondaryAction.onClick}>
                {secondaryAction.text}
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </SecondaryAction>
          )}
        </div>
      </div>
    </div>
  );
};
