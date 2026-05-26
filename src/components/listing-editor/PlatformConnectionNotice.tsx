import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PlatformConnectionNoticeProps {
  title: string;
  description: string;
  ctaLabel: string;
}

export function PlatformConnectionNotice({
  title,
  description,
  ctaLabel,
}: PlatformConnectionNoticeProps) {
  return (
    <div className="mt-5 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 shadow-lg shadow-amber-950/10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-300/15 ring-1 ring-amber-200/30">
            <AlertCircle className="h-4 w-4 text-amber-200" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-100">{title}</p>
            <p className="mt-1 text-sm leading-6 text-neutral-300">{description}</p>
          </div>
        </div>

        <Button
          asChild
          variant="outline"
          size="sm"
          className="shrink-0 border-amber-200/40 bg-amber-200/10 text-amber-50 hover:bg-amber-200/20 hover:text-white"
        >
          <Link to="/connect-accounts">
            {ctaLabel}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
