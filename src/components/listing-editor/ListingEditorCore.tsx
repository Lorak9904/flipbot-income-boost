import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { GeneratedItemDataWithVinted, Platform } from '@/types/item';
import type { ReviewItemFormMode } from '@/components/review-item-form-mode';
import AddItemForm from '@/components/AddItemForm';
import ReviewItemForm from '@/components/ReviewItemForm';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 * i, duration: 0.6, ease: 'easeOut' },
  }),
};

interface ListingEditorCoreProps {
  step: 'add' | 'review';
  pageTitle: string;
  reviewTitle: string;
  addCardTitle: string;
  addCardDescription: string;
  reviewCardTitle: string;
  reviewCardDescription: string;
  language: string;
  generatedData: GeneratedItemDataWithVinted | null;
  reviewMode: ReviewItemFormMode;
  connectedPlatforms: Record<Platform, boolean>;
  onComplete: (data: GeneratedItemDataWithVinted) => void;
  onBack: () => void;
  editItemId?: string;
  publishedPlatforms: Platform[];
  publishPlatform?: Platform;
}

export function ListingEditorCore({
  step,
  pageTitle,
  reviewTitle,
  addCardTitle,
  addCardDescription,
  reviewCardTitle,
  reviewCardDescription,
  language,
  generatedData,
  reviewMode,
  connectedPlatforms,
  onComplete,
  onBack,
  editItemId,
  publishedPlatforms,
  publishPlatform,
}: ListingEditorCoreProps) {
  return (
    <div className="container mx-auto py-12 px-4 relative z-10">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="max-w-3xl mx-auto"
      >
        <motion.h1 variants={fadeUp} className="text-3xl font-bold mb-6">
          {step === 'add' ? pageTitle : reviewTitle}
        </motion.h1>

        {step === 'add' ? (
          <Card className="bg-neutral-900/50 backdrop-blur-sm ring-1 ring-neutral-700 transition-all duration-300 hover:ring-cyan-400/40 hover:shadow-xl border-0">
            <CardHeader>
              <CardTitle className="text-cyan-400">{addCardTitle}</CardTitle>
              <CardDescription className="text-neutral-300">{addCardDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              <AddItemForm onComplete={onComplete} language={language} />
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-neutral-900/50 backdrop-blur-sm ring-1 ring-neutral-700 transition-all duration-300 hover:ring-fuchsia-400/40 hover:shadow-xl border-0">
            <CardHeader>
              <CardTitle className="text-fuchsia-400">{reviewCardTitle}</CardTitle>
              <CardDescription className="text-neutral-300">{reviewCardDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              {generatedData && (
                <ReviewItemForm
                  initialData={generatedData}
                  mode={reviewMode}
                  connectedPlatforms={connectedPlatforms}
                  onBack={onBack}
                  language={language}
                  editItemId={editItemId}
                  publishedPlatforms={publishedPlatforms}
                  publishPlatform={publishPlatform}
                />
              )}
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
