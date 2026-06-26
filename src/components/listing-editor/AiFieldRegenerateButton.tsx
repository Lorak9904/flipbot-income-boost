import { Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AiFieldRegenerateButtonProps {
  label: string;
  tooltip: string;
  loading?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export function AiFieldRegenerateButton({
  label,
  tooltip,
  loading = false,
  disabled = false,
  onClick,
}: AiFieldRegenerateButtonProps) {
  return (
    <TooltipProvider delayDuration={120}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={label}
            disabled={disabled || loading}
            onClick={onClick}
            className="h-8 w-8 shrink-0 border border-cyan-400/20 bg-cyan-400/5 text-cyan-300 hover:bg-cyan-400/10 hover:text-cyan-100"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-64 text-sm">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
