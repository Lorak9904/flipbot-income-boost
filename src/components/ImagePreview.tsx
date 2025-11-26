import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ImagePreviewProps {
  images: string[]; // Array of image URLs
  initialIndex?: number; // Which image to show first
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Lightweight image preview/lightbox component.
 * - Full screen on mobile, centered with backdrop on desktop
 * - Keyboard navigation (←/→ arrows, Esc to close)
 * - Touch-friendly prev/next buttons
 * - Reusable across AddItemForm, ReviewItemForm, UserItemsPage
 */
export const ImagePreview: React.FC<ImagePreviewProps> = ({
  images,
  initialIndex = 0,
  open,
  onOpenChange,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Reset to initial index when dialog opens
  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex);
    }
  }, [open, initialIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, currentIndex, images.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (images.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[95vw] md:max-w-5xl h-[95vh] md:h-auto p-0 border-0 bg-black/95 backdrop-blur-xl"
        // Remove default close button - we'll add custom one
        aria-describedby={undefined}
      >
        {/* Custom close button - top right */}
        <DialogClose asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 rounded-full bg-black/50 hover:bg-black/70 text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </DialogClose>

        {/* Main image container */}
        <div className="relative w-full h-full flex items-center justify-center p-4 md:p-8">
          <img
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1} of ${images.length}`}
            className="max-w-full max-h-[80vh] object-contain select-none"
            draggable={false}
          />

          {/* Navigation buttons (only show if multiple images) */}
          {images.length > 1 && (
            <>
              {/* Previous button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPrevious}
                className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 hover:bg-black/70 text-white h-12 w-12"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>

              {/* Next button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNext}
                className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 hover:bg-black/70 text-white h-12 w-12"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>

        {/* Image counter - bottom center */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-full">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* Thumbnail strip (optional - only on desktop with multiple images) */}
        {images.length > 1 && (
          <div className="hidden md:flex absolute bottom-16 left-1/2 -translate-x-1/2 gap-2 max-w-2xl overflow-x-auto px-4">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all ${
                  idx === currentIndex
                    ? 'ring-2 ring-white scale-110'
                    : 'opacity-50 hover:opacity-100'
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
