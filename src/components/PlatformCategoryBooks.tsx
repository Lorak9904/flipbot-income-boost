import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getOlxCategoryPath, type OlxCategoryNode } from '@/lib/api/olx';
import { getVintedCategories, type VintedCategoryOption } from '@/lib/api/vinted';
import { searchAllegroCategories, type AllegroCategoryNode } from '@/lib/api/allegro';
import type { Platform, PlatformOverrides } from '@/types/item';
import OlxCategoryPickerModal from './review-item/OlxCategoryPickerModal';
import VintedCategoryPickerModal from './review-item/VintedCategoryPickerModal';
import AllegroCategoryPickerModal from './review-item/AllegroCategoryPickerModal';
import {
  buildVintedCategoryGraph,
  getVintedPathText,
  parseVintedCatalogId,
} from './review-item/vinted-category-tree';

interface PlatformCategoryBooksProps {
  draftId?: string;
  selectedPlatforms: Platform[];
  connectedPlatforms: Record<Platform, boolean>;
  platformOverrides: PlatformOverrides;
  vintedSuggestedCatalogId?: number;
  disabled?: boolean;
  onSetOlxCategory: (categoryId: string | number, categoryPath?: string) => void;
  onSetAllegroCategory: (categoryId: string, marketplaceId?: string, categoryPath?: string) => void;
  onSetVintedCatalog: (catalogId: string | number) => void;
}

const PLATFORM_LABELS: Record<Platform, string> = {
  facebook: 'Facebook',
  olx: 'OLX',
  vinted: 'Vinted',
  ebay: 'eBay',
  allegro: 'Allegro',
};

export default function PlatformCategoryBooks({
  selectedPlatforms,
  platformOverrides,
  vintedSuggestedCatalogId,
  disabled = false,
  onSetOlxCategory,
  onSetAllegroCategory,
  onSetVintedCatalog,
}: PlatformCategoryBooksProps) {
  const [activePlatform, setActivePlatform] = useState<Platform | null>(selectedPlatforms[0] || null);
  const [olxPickerOpen, setOlxPickerOpen] = useState(false);
  const [vintedPickerOpen, setVintedPickerOpen] = useState(false);
  const [allegroPickerOpen, setAllegroPickerOpen] = useState(false);
  const [vintedCategories, setVintedCategories] = useState<VintedCategoryOption[]>([]);
  const [vintedLoading, setVintedLoading] = useState(false);
  const [vintedError, setVintedError] = useState<string | null>(null);
  const hasOlx = selectedPlatforms.includes('olx');
  const hasVinted = selectedPlatforms.includes('vinted');
  const hasAllegro = selectedPlatforms.includes('allegro');

  useEffect(() => {
    if (!selectedPlatforms.length) {
      setActivePlatform(null);
      return;
    }
    if (!activePlatform || !selectedPlatforms.includes(activePlatform)) {
      setActivePlatform(selectedPlatforms[0]);
    }
  }, [selectedPlatforms, activePlatform]);

  useEffect(() => {
    if (!hasVinted) {
      return;
    }
    if (vintedCategories.length > 0) {
      return;
    }

    const controller = new AbortController();

    const loadVinted = async () => {
      setVintedLoading(true);
      setVintedError(null);
      try {
        const categories = await getVintedCategories({ signal: controller.signal });
        if (!controller.signal.aborted) {
          setVintedCategories(categories);
        }
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        setVintedError(
          error instanceof Error ? error.message : 'Failed to load Vinted categories'
        );
      } finally {
        if (!controller.signal.aborted) {
          setVintedLoading(false);
        }
      }
    };

    loadVinted();

    return () => {
      controller.abort();
    };
  }, [hasVinted, vintedCategories.length]);

  const vintedGraph = useMemo(
    () => buildVintedCategoryGraph(vintedCategories),
    [vintedCategories]
  );

  const selectedVintedCatalogId = parseVintedCatalogId(
    platformOverrides.vinted?.catalog_id ?? vintedSuggestedCatalogId ?? null
  );

  const selectedOlxCategoryId = useMemo(() => {
    const raw = platformOverrides.olx?.category_id;
    if (raw === null || raw === undefined || raw === '') {
      return null;
    }
    return String(raw);
  }, [platformOverrides.olx?.category_id]);

  const [olxSelectedHint, setOlxSelectedHint] = useState<{ id: string; path: string } | null>(
    null
  );

  const selectedOlxPath = useMemo(() => {
    if (!selectedOlxCategoryId) {
      return '';
    }
    if (olxSelectedHint?.id !== selectedOlxCategoryId) {
      return platformOverrides.olx?.category_path || '';
    }
    return olxSelectedHint.path || platformOverrides.olx?.category_path || '';
  }, [olxSelectedHint, platformOverrides.olx?.category_path, selectedOlxCategoryId]);

  const selectedAllegroCategoryId = useMemo(() => {
    const raw = platformOverrides.allegro?.category_id;
    if (raw === null || raw === undefined || raw === '') {
      return null;
    }
    return String(raw);
  }, [platformOverrides.allegro?.category_id]);

  const selectedAllegroMarketplaceId = useMemo(() => {
    return String(platformOverrides.allegro?.marketplace_id || 'allegro-pl');
  }, [platformOverrides.allegro?.marketplace_id]);

  const [allegroSelectedHint, setAllegroSelectedHint] = useState<{ id: string; path: string } | null>(
    null
  );
  const selectedAllegroStoredPath = platformOverrides.allegro?.category_path || '';

  const selectedAllegroPath = useMemo(() => {
    if (!selectedAllegroCategoryId) {
      return '';
    }
    if (allegroSelectedHint?.id !== selectedAllegroCategoryId) {
      return selectedAllegroStoredPath;
    }
    return allegroSelectedHint.path || selectedAllegroStoredPath;
  }, [allegroSelectedHint, selectedAllegroCategoryId, selectedAllegroStoredPath]);

  useEffect(() => {
    if (!selectedOlxCategoryId) {
      setOlxSelectedHint(null);
      return;
    }
    setOlxSelectedHint((prev) => {
      if (prev && prev.id === selectedOlxCategoryId) {
        return prev;
      }
      return null;
    });
  }, [selectedOlxCategoryId]);

  useEffect(() => {
    if (!hasOlx) {
      return;
    }
    if (!selectedOlxCategoryId) {
      return;
    }
    if (olxSelectedHint?.id === selectedOlxCategoryId && olxSelectedHint.path) {
      return;
    }

    const controller = new AbortController();
    (async () => {
      try {
        const payload = await getOlxCategoryPath({
          categoryId: selectedOlxCategoryId,
          signal: controller.signal,
        });
        if (controller.signal.aborted || !payload.selected?.path) {
          return;
        }
        setOlxSelectedHint({ id: selectedOlxCategoryId, path: payload.selected.path });
      } catch {
        // Best-effort: keep ID-based display if path resolution fails.
      }
    })();

    return () => controller.abort();
  }, [hasOlx, selectedOlxCategoryId, olxSelectedHint]);

  useEffect(() => {
    // If selection changed externally (e.g. loaded draft), drop any stale hint. Keep it only if it still matches.
    if (!selectedAllegroCategoryId) {
      setAllegroSelectedHint(null);
      return;
    }
    setAllegroSelectedHint((prev) => {
      if (prev && prev.id === selectedAllegroCategoryId) {
        return prev;
      }
      return null;
    });
  }, [selectedAllegroCategoryId, selectedAllegroMarketplaceId]);

  useEffect(() => {
    if (!hasAllegro) {
      return;
    }
    if (!selectedAllegroCategoryId) {
      return;
    }
    if (selectedAllegroStoredPath) {
      return;
    }
    if (allegroSelectedHint?.id === selectedAllegroCategoryId && allegroSelectedHint.path) {
      return;
    }

    const controller = new AbortController();
    (async () => {
      try {
        const payload = await searchAllegroCategories({
          query: selectedAllegroCategoryId,
          marketplaceId: selectedAllegroMarketplaceId,
          language: 'pl-PL',
          leafOnly: false,
          limit: 10,
          signal: controller.signal,
        });

        const exact = (payload.results || []).find(
          (match) => String(match.category_id) === selectedAllegroCategoryId
        );
        if (!exact || controller.signal.aborted) {
          return;
        }
        if (exact.path) {
          setAllegroSelectedHint({ id: selectedAllegroCategoryId, path: exact.path });
        }
      } catch {
        // Best-effort: keep ID-based display if search fails.
      }
    })();

    return () => controller.abort();
  }, [
    hasAllegro,
    selectedAllegroCategoryId,
    selectedAllegroMarketplaceId,
    selectedAllegroStoredPath,
    allegroSelectedHint,
  ]);

  const selectedVintedPath = useMemo(() => {
    if (selectedVintedCatalogId === null) {
      return '';
    }
    const path = getVintedPathText(vintedGraph, selectedVintedCatalogId);
    return path;
  }, [selectedVintedCatalogId, vintedGraph]);
  const vintedCategoryPlaceholder =
    selectedVintedCatalogId !== null && !selectedVintedPath
      ? 'Resolving selected category...'
      : 'Click to choose from Vinted category tree...';

  return (
    <div className="space-y-4 border-t border-neutral-700 pt-6">
      <h3 className="text-base sm:text-lg font-medium text-neutral-200">Category</h3>

      <Card className="bg-neutral-900/60 border-neutral-700">
        <CardHeader>
          <CardTitle className="text-neutral-200">Category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!selectedPlatforms.length && (
            <div className="rounded-md border border-neutral-700 bg-neutral-900/50 px-4 py-3 text-sm text-neutral-400">
              Select at least one platform to choose categories.
            </div>
          )}

          {selectedPlatforms.length > 0 && (
            <div className="space-y-3">
              <Label className="text-neutral-300">Platform</Label>
              <div className="flex flex-wrap gap-2">
                {selectedPlatforms.map((platform) => {
                  const isActive = activePlatform === platform;
                  return (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => setActivePlatform(platform)}
                      className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                        isActive
                          ? 'border-neutral-700 bg-neutral-700 text-white shadow-sm'
                          : 'border-neutral-700 bg-neutral-800/60 text-neutral-300 hover:bg-neutral-800 hover:text-neutral-200'
                      }`}
                    >
                      {PLATFORM_LABELS[platform]}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activePlatform === 'olx' && (
            <div className="space-y-2">
              <Label htmlFor="olx-category-field" className="text-neutral-300">
                OLX category
              </Label>
              <Input
                id="olx-category-field"
                value={selectedOlxPath}
                onClick={() => setOlxPickerOpen(true)}
                placeholder="Click to choose from OLX category tree..."
                disabled={disabled}
                readOnly
                className="cursor-pointer"
              />
              <p className="text-xs text-neutral-400">
                Click the field to open a layered category picker.
              </p>
            </div>
          )}

          {activePlatform === 'vinted' && (
            <div className="space-y-2">
              <Label htmlFor="vinted-category-field" className="text-neutral-300">
                Vinted category
              </Label>
              <Input
                id="vinted-category-field"
                value={selectedVintedPath}
                onClick={() => setVintedPickerOpen(true)}
                placeholder={vintedCategoryPlaceholder}
                disabled={disabled}
                readOnly
                className="cursor-pointer"
              />
              <p className="text-xs text-neutral-400">
                Click the field to open a layered category picker.
              </p>
              {vintedError && (
                <p className="text-xs text-red-300">
                  Vinted categories failed to load: {vintedError}
                </p>
              )}
            </div>
          )}

          {activePlatform === 'allegro' && (
            <div className="space-y-2">
              <Label htmlFor="allegro-category-field" className="text-neutral-300">
                Allegro category
              </Label>
              <Input
                id="allegro-category-field"
                value={selectedAllegroPath}
                onClick={() => setAllegroPickerOpen(true)}
                placeholder="Click to choose from Allegro category tree..."
                disabled={disabled}
                readOnly
                className="cursor-pointer"
              />
              <p className="text-xs text-neutral-400">
                Click the field to open a layered category picker.
              </p>
            </div>
          )}

          {activePlatform && activePlatform !== 'olx' && activePlatform !== 'vinted' && activePlatform !== 'allegro' && (
            <div className="min-h-[180px] rounded-md border border-dashed border-neutral-700 bg-neutral-900/40 p-4 text-sm text-neutral-400">
              {PLATFORM_LABELS[activePlatform]} category picker will be added next.
            </div>
          )}

          {activePlatform === 'olx' && hasOlx && (
            <OlxCategoryPickerModal
              open={olxPickerOpen}
              onOpenChange={setOlxPickerOpen}
              selectedCategoryId={selectedOlxCategoryId}
              selectedCategoryPath={selectedOlxPath}
              onSelectCategory={(node: OlxCategoryNode) => {
                setOlxSelectedHint({ id: String(node.category_id), path: node.path || '' });
                onSetOlxCategory(node.category_id, node.path);
              }}
            />
          )}

          {activePlatform === 'vinted' && (
            <VintedCategoryPickerModal
              open={vintedPickerOpen}
              onOpenChange={setVintedPickerOpen}
              categories={vintedCategories}
              loading={vintedLoading}
              error={vintedError}
              selectedCatalogId={selectedVintedCatalogId}
              onSelectCatalog={(catalogId) => onSetVintedCatalog(catalogId)}
            />
          )}

          {activePlatform === 'allegro' && hasAllegro && (
            <AllegroCategoryPickerModal
              open={allegroPickerOpen}
              onOpenChange={setAllegroPickerOpen}
              marketplaceId={selectedAllegroMarketplaceId}
              language="pl-PL"
              selectedCategoryId={selectedAllegroCategoryId}
              selectedCategoryPath={selectedAllegroPath}
              onSelectCategory={(node: AllegroCategoryNode, marketplaceId?: string) => {
                setAllegroSelectedHint({ id: node.category_id, path: node.path || '' });
                onSetAllegroCategory(node.category_id, marketplaceId, node.path);
              }}
            />
          )}

          {activePlatform === 'olx' && !selectedOlxCategoryId && (
            <div className="min-h-[120px] rounded-md border border-dashed border-neutral-700 bg-neutral-900/40 px-4 py-3 text-sm text-neutral-400">
              No OLX category selected yet.
            </div>
          )}

          {activePlatform === 'vinted' && selectedVintedCatalogId === null && (
            <div className="min-h-[120px] rounded-md border border-dashed border-neutral-700 bg-neutral-900/40 px-4 py-3 text-sm text-neutral-400">
              No Vinted category selected yet.
            </div>
          )}

          {activePlatform === 'allegro' && !selectedAllegroCategoryId && (
            <div className="min-h-[120px] rounded-md border border-dashed border-neutral-700 bg-neutral-900/40 px-4 py-3 text-sm text-neutral-400">
              No Allegro category selected yet.
            </div>
          )}

          {activePlatform === 'vinted' && selectedVintedCatalogId !== null && (
            <div className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-cyan-200">Selected category</p>
              {selectedVintedPath ? (
                <p className="mt-1 text-sm text-cyan-100">{selectedVintedPath}</p>
              ) : (
                <p className="mt-1 text-sm text-cyan-100/80">Resolving selected category...</p>
              )}
            </div>
          )}

          {activePlatform === 'olx' && selectedOlxCategoryId && (
            <div className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-cyan-200">Selected category</p>
              {selectedOlxPath ? (
                <p className="mt-1 text-sm text-cyan-100">{selectedOlxPath}</p>
              ) : (
                <p className="mt-1 text-sm text-cyan-100/80">Resolving selected category...</p>
              )}
            </div>
          )}

          {activePlatform === 'allegro' && selectedAllegroCategoryId && (
            <div className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-cyan-200">Selected category</p>
              {selectedAllegroPath ? (
                <p className="mt-1 text-sm text-cyan-100">{selectedAllegroPath}</p>
              ) : (
                <p className="mt-1 text-sm text-cyan-100/80">Resolving selected category...</p>
              )}
            </div>
          )}

          {!activePlatform && (
            <div className="min-h-[160px] rounded-md border border-dashed border-neutral-700 bg-neutral-900/40" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
