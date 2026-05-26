import { ReactNode } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ListingEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export function ListingEditorModal({ open, onOpenChange, children }: ListingEditorModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1rem)] h-[calc(100vh-1rem)] max-w-none p-0 border-neutral-800 bg-neutral-950 text-white overflow-hidden sm:rounded-xl [&>button]:right-4 [&>button]:top-4">
        <div className="h-full overflow-y-auto">{children}</div>
      </DialogContent>
    </Dialog>
  );
}

