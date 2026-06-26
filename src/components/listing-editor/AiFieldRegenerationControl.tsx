import { useState } from 'react';
import { getCurrentLanguage, getTranslations } from '@/components/language-utils';
import { useToast } from '@/hooks/use-toast';
import {
  regenerateItemField,
  type RegeneratableItemField,
} from '@/lib/api/items';
import { reviewItemFormTranslations } from '@/utils/translations/review-item-form-translations';
import { AiFieldRegenerateButton } from './AiFieldRegenerateButton';

type RegenerationSuccessMode = 'draft' | 'saved';

interface AiFieldRegenerationControlProps {
  itemId?: string;
  field: RegeneratableItemField;
  fieldLabel: string;
  language?: string;
  context: Record<string, unknown>;
  disabled?: boolean;
  successMode?: RegenerationSuccessMode;
  onLoadingChange?: (loading: boolean) => void;
  onRegenerated: (value: string) => void | Promise<void>;
}

export function AiFieldRegenerationControl({
  itemId,
  field,
  fieldLabel,
  language,
  context,
  disabled = false,
  successMode = 'draft',
  onLoadingChange,
  onRegenerated,
}: AiFieldRegenerationControlProps) {
  const { toast } = useToast();
  const t = getTranslations(reviewItemFormTranslations);
  const [loading, setLoading] = useState(false);
  const normalizedFieldLabel = fieldLabel.toLowerCase();

  const handleRegenerate = async () => {
    if (!itemId) {
      toast({
        title: t.ai.missingItemTitle,
        description: t.ai.missingItemDescription,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    onLoadingChange?.(true);
    try {
      const result = await regenerateItemField(itemId, {
        field,
        language: language || getCurrentLanguage(),
        context,
      });

      await onRegenerated(result.value);
      toast({
        title: t.ai.regeneratedTitle,
        description: (
          successMode === 'saved'
            ? t.ai.regeneratedSavedDescription
            : t.ai.regeneratedDescription
        ).replace('{field}', normalizedFieldLabel),
      });
    } catch (error) {
      toast({
        title: t.ai.errorTitle,
        description: error instanceof Error ? error.message : t.toast.errorDesc,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      onLoadingChange?.(false);
    }
  };

  return (
    <AiFieldRegenerateButton
      label={t.ai.regenerateLabel.replace('{field}', normalizedFieldLabel)}
      tooltip={t.ai.regenerateTooltip}
      loading={loading}
      disabled={disabled}
      onClick={() => void handleRegenerate()}
    />
  );
}
