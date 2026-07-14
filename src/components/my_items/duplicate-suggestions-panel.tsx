import { useState } from 'react';
import { AlertTriangle, Check, GitMerge, Images, Loader2, Search, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { formatMoney } from '@/lib/currency';
import { cdnThumb, resolveItemImageUrl } from '@/lib/images';
import { formatPlatformLabel } from '@/lib/platforms';
import type {
  DuplicateFieldConflict,
  DuplicateSuggestion,
  DuplicateSuggestionItem,
} from '@/lib/api/items';

interface DuplicateSuggestionsCopy {
  title: string;
  summary: string;
  countLabel: (count: number) => string;
  reviewButton: string;
  dialogTitle: string;
  dialogDescription: string;
  closeButton: string;
  recommendedLabel: string;
  selectedLabel: string;
  chooseDetailsLabel: string;
  untitledListing: string;
  noDescription: string;
  photoCount: (count: number) => string;
  mergeButton: string;
  mergingButton: string;
  dismissButton: string;
  dismissingButton: string;
  bulkMergeButton: string;
  bulkMergingButton: string;
  conflictLabel: (count: number) => string;
  conflictSummary: string;
  noConflictSummary: string;
  remoteListingsUnchanged: string;
  mergeDisabledNotice: string;
  reasonsLabel: string;
  differencesLabel: string;
  reasonLabels: Record<string, string>;
  fieldLabels: Record<string, string>;
}

interface DuplicateSuggestionsPanelProps {
  suggestions: DuplicateSuggestion[];
  mergingKey?: string | null;
  dismissingKey?: string | null;
  bulkMerging?: boolean;
  copy: DuplicateSuggestionsCopy;
  onMerge: (suggestion: DuplicateSuggestion, primaryItemId: string) => void;
  onDismiss: (suggestion: DuplicateSuggestion) => void;
  onBulkMerge: (suggestions: DuplicateSuggestion[]) => void;
}

// Keep comparison and dismissal available while merge behavior is paused.
const DUPLICATE_MERGE_ENABLED = false;

function PlatformBadges({ platforms }: { platforms: string[] }) {
  if (!platforms.length) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {platforms.map((platform) => (
        <Badge key={platform} className="border-neutral-700 bg-neutral-800 text-neutral-300">
          {formatPlatformLabel(platform)}
        </Badge>
      ))}
    </div>
  );
}

function ListingChoice({
  item,
  selected,
  recommended,
  selectionEnabled,
  copy,
}: {
  item: DuplicateSuggestionItem;
  selected: boolean;
  recommended: boolean;
  selectionEnabled: boolean;
  copy: DuplicateSuggestionsCopy;
}) {
  const title = item.title || copy.untitledListing;
  const imageUrl = resolveItemImageUrl(item.images?.[0]);
  const imageCount = item.images?.length || 0;

  return (
    <div className="min-w-0 flex-1">
      <div className="mb-3 flex items-start gap-3">
        {selectionEnabled && (
          <RadioGroupItem
            value={item.uuid}
            aria-label={title}
            className="mt-1 shrink-0 border-neutral-500 text-cyan-400"
          />
        )}
        <div className="min-w-0 flex-1">
          {selectionEnabled && <div className="mb-2 flex flex-wrap gap-1.5">
            {recommended && (
              <Badge className="border-cyan-500/40 bg-cyan-500/10 text-cyan-200">
                {copy.recommendedLabel}
              </Badge>
            )}
            {selected && (
              <Badge className="border-emerald-500/40 bg-emerald-500/10 text-emerald-200">
                <Check className="mr-1 h-3 w-3" aria-hidden="true" />
                {copy.selectedLabel}
              </Badge>
            )}
          </div>}
          <h3 className="line-clamp-2 text-sm font-semibold text-white">{title}</h3>
          <p className="mt-1 line-clamp-3 text-sm leading-5 text-neutral-400">
            {item.description || copy.noDescription}
          </p>
        </div>
      </div>

      {imageUrl ? (
        <img
          src={cdnThumb(imageUrl)}
          alt={title}
          className="aspect-[4/3] w-full rounded-md border border-neutral-800 object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex aspect-[4/3] w-full items-center justify-center rounded-md border border-dashed border-neutral-700 bg-neutral-950 text-neutral-500">
          <Images className="h-7 w-7" aria-hidden="true" />
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-base font-semibold text-white">{formatMoney(item.price, item.currency)}</span>
        <span className="text-xs text-neutral-400">{copy.photoCount(imageCount)}</span>
      </div>
      <div className="mt-2">
        <PlatformBadges platforms={item.platforms || []} />
      </div>
    </div>
  );
}

function formatConflictValue(conflict: DuplicateFieldConflict, side: 'primary' | 'duplicate', copy: DuplicateSuggestionsCopy) {
  const value = side === 'primary' ? conflict.primary_value : conflict.duplicate_value;
  if (conflict.field === 'images' && typeof value === 'number') {
    return copy.photoCount(value);
  }
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function DifferenceList({
  conflicts,
  copy,
  primaryTitle,
  duplicateTitle,
}: {
  conflicts: DuplicateFieldConflict[];
  copy: DuplicateSuggestionsCopy;
  primaryTitle: string;
  duplicateTitle: string;
}) {
  if (!conflicts.length) {
    return <p className="text-sm text-emerald-200">{copy.noConflictSummary}</p>;
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase text-neutral-500">{copy.differencesLabel}</p>
      <div className="hidden grid-cols-[8rem_1fr_1fr] gap-2 px-3 text-xs text-neutral-500 md:grid">
        <span />
        <span className="truncate">{primaryTitle}</span>
        <span className="truncate">{duplicateTitle}</span>
      </div>
      {conflicts.map((conflict) => (
        <div
          key={conflict.field}
          className="grid gap-2 rounded-md border border-neutral-800 bg-neutral-950/70 p-3 text-sm md:grid-cols-[8rem_1fr_1fr]"
        >
          <span className="font-medium text-neutral-300">
            {copy.fieldLabels[conflict.field] || conflict.field}
          </span>
          <span className="min-w-0 break-words text-neutral-400">
            <span className="mb-1 block truncate text-xs text-neutral-500 md:hidden">{primaryTitle}</span>
            {formatConflictValue(conflict, 'primary', copy)}
          </span>
          <span className="min-w-0 break-words text-neutral-400">
            <span className="mb-1 block truncate text-xs text-neutral-500 md:hidden">{duplicateTitle}</span>
            {formatConflictValue(conflict, 'duplicate', copy)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function DuplicateSuggestionsPanel({
  suggestions,
  mergingKey,
  dismissingKey,
  bulkMerging = false,
  copy,
  onMerge,
  onDismiss,
  onBulkMerge,
}: DuplicateSuggestionsPanelProps) {
  const [open, setOpen] = useState(false);
  const [selectedPrimaryIds, setSelectedPrimaryIds] = useState<Record<string, string>>({});

  if (suggestions.length === 0) return null;

  const conflictFreeSuggestions = suggestions.filter(
    (suggestion) => suggestion.confidence === 'high' && (suggestion.field_conflicts?.length || 0) === 0
  );

  return (
    <>
      <section className="mb-6 flex flex-col gap-3 rounded-lg border border-amber-500/30 bg-neutral-900/70 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="mt-0.5 rounded-md bg-amber-500/10 p-2 text-amber-300">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-semibold text-white">{copy.title}</h2>
              <Badge className="border-amber-500/40 bg-amber-500/10 text-amber-200">
                {copy.countLabel(suggestions.length)}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-neutral-400">{copy.summary}</p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setOpen(true)}
          className="min-h-11 shrink-0 border-neutral-700 bg-neutral-950 text-neutral-100 hover:bg-neutral-800 hover:text-white"
        >
          <Search className="mr-2 h-4 w-4" aria-hidden="true" />
          {copy.reviewButton}
        </Button>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          closeLabel={copy.closeButton}
          className="max-h-[90vh] w-[calc(100%_-_2rem)] max-w-5xl overflow-hidden border-neutral-800 bg-neutral-900 p-0 text-white"
        >
          <DialogHeader className="border-b border-neutral-800 px-5 py-4 pr-12 text-left">
            <DialogTitle>{copy.dialogTitle}</DialogTitle>
            <DialogDescription className="text-neutral-400">{copy.dialogDescription}</DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto px-5 pb-5">
            <div className="sticky top-0 z-10 flex flex-col gap-3 border-b border-neutral-800 bg-neutral-900 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-2xl text-xs leading-5 text-neutral-400">{copy.remoteListingsUnchanged}</p>
              {DUPLICATE_MERGE_ENABLED && conflictFreeSuggestions.length > 1 && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => onBulkMerge(conflictFreeSuggestions)}
                  disabled={bulkMerging || Boolean(mergingKey) || Boolean(dismissingKey)}
                  className="min-h-11 shrink-0 border border-cyan-400/60 bg-cyan-700 text-white hover:bg-cyan-600"
                >
                  {bulkMerging ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <GitMerge className="mr-2 h-4 w-4" />
                  )}
                  {bulkMerging
                    ? copy.bulkMergingButton
                    : copy.bulkMergeButton.replace('{count}', conflictFreeSuggestions.length.toString())}
                </Button>
              )}
              {!DUPLICATE_MERGE_ENABLED && <p className="text-xs text-amber-200">{copy.mergeDisabledNotice}</p>}
            </div>

            <div className="divide-y divide-neutral-800">
              {suggestions.map((suggestion) => {
                const isMerging = mergingKey === suggestion.key;
                const isDismissing = dismissingKey === suggestion.key;
                const conflicts = suggestion.field_conflicts || [];
                const selectedPrimaryId = selectedPrimaryIds[suggestion.key] || suggestion.primary_item.uuid;

                return (
                  <section key={suggestion.key} className="py-5">
                    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">{copy.chooseDetailsLabel}</p>
                        <p className="mt-1 text-xs text-neutral-400">
                          {conflicts.length ? copy.conflictSummary : copy.noConflictSummary}
                        </p>
                      </div>
                      {conflicts.length > 0 && (
                        <Badge className="w-fit border-amber-500/40 bg-amber-500/10 text-amber-200">
                          {copy.conflictLabel(conflicts.length)}
                        </Badge>
                      )}
                    </div>

                    <RadioGroup
                      value={selectedPrimaryId}
                      disabled={!DUPLICATE_MERGE_ENABLED}
                      onValueChange={(value) =>
                        setSelectedPrimaryIds((current) => ({ ...current, [suggestion.key]: value }))
                      }
                      className="grid gap-3 md:grid-cols-2"
                    >
                      <div
                        className={`flex rounded-lg border p-3 transition-colors ${
                          DUPLICATE_MERGE_ENABLED && selectedPrimaryId === suggestion.primary_item.uuid
                            ? 'border-cyan-500/60 bg-cyan-500/5'
                            : 'border-neutral-800 bg-neutral-950/40'
                        }`}
                      >
                        <ListingChoice
                          item={suggestion.primary_item}
                          selected={selectedPrimaryId === suggestion.primary_item.uuid}
                          recommended
                          selectionEnabled={DUPLICATE_MERGE_ENABLED}
                          copy={copy}
                        />
                      </div>
                      <div
                        className={`flex rounded-lg border p-3 transition-colors ${
                          DUPLICATE_MERGE_ENABLED && selectedPrimaryId === suggestion.duplicate_item.uuid
                            ? 'border-cyan-500/60 bg-cyan-500/5'
                            : 'border-neutral-800 bg-neutral-950/40'
                        }`}
                      >
                        <ListingChoice
                          item={suggestion.duplicate_item}
                          selected={selectedPrimaryId === suggestion.duplicate_item.uuid}
                          recommended={false}
                          selectionEnabled={DUPLICATE_MERGE_ENABLED}
                          copy={copy}
                        />
                      </div>
                    </RadioGroup>

                    <div className="mt-4">
                      <DifferenceList
                        conflicts={conflicts}
                        copy={copy}
                        primaryTitle={suggestion.primary_item.title || copy.untitledListing}
                        duplicateTitle={suggestion.duplicate_item.title || copy.untitledListing}
                      />
                    </div>

                    <div className="mt-4 flex flex-col gap-3 border-t border-neutral-800 pt-4 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase text-neutral-500">{copy.reasonsLabel}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {suggestion.reasons.slice(0, 5).map((reason) => (
                            <Badge key={reason} className="border-neutral-700 bg-neutral-950 text-neutral-300">
                              {copy.reasonLabels[reason] || reason}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => onDismiss(suggestion)}
                          disabled={isMerging || isDismissing || bulkMerging}
                          className="min-h-11 border-neutral-700 bg-neutral-950 text-neutral-200 hover:bg-neutral-800 hover:text-white"
                        >
                          {isDismissing ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <X className="mr-2 h-4 w-4" />
                          )}
                          {isDismissing ? copy.dismissingButton : copy.dismissButton}
                        </Button>
                        {DUPLICATE_MERGE_ENABLED && <Button
                          type="button"
                          onClick={() => onMerge(suggestion, selectedPrimaryId)}
                          disabled={isMerging || isDismissing || bulkMerging}
                          className="min-h-11 border border-cyan-400/60 bg-cyan-700 text-white hover:bg-cyan-600"
                        >
                          {isMerging ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <GitMerge className="mr-2 h-4 w-4" />
                          )}
                          {isMerging ? copy.mergingButton : copy.mergeButton}
                        </Button>}
                      </div>
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
