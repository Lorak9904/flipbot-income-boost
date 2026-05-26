import { useEffect, useMemo, useState } from 'react';
import { ChevronRight, House, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { VintedCategoryOption } from '@/lib/api/vinted';
import {
  buildVintedCategoryGraph,
  getVintedPathIds,
  getVintedPathText,
  isVintedLeaf,
  searchVintedCategories,
} from './vinted-category-tree';

interface VintedCategoryPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: VintedCategoryOption[];
  loading: boolean;
  error: string | null;
  selectedCatalogId: number | null;
  onSelectCatalog: (catalogId: number) => void;
}

export default function VintedCategoryPickerModal({
  open,
  onOpenChange,
  categories,
  loading,
  error,
  selectedCatalogId,
  onSelectCatalog,
}: VintedCategoryPickerModalProps) {
  const graph = useMemo(() => buildVintedCategoryGraph(categories), [categories]);
  const [pathIds, setPathIds] = useState<number[]>([]);
  const [pendingCatalogId, setPendingCatalogId] = useState<number | null>(selectedCatalogId);
  const [searchQuery, setSearchQuery] = useState('');
  const trimmedSearchQuery = searchQuery.trim();
  const isSearching = trimmedSearchQuery.length >= 2;
  const hasShortSearchQuery = trimmedSearchQuery.length > 0 && trimmedSearchQuery.length < 2;

  useEffect(() => {
    if (!open) {
      return;
    }

    setSearchQuery('');

    if (selectedCatalogId !== null && graph.nodesById.has(selectedCatalogId)) {
      const selectedPath = getVintedPathIds(graph, selectedCatalogId);
      const selectedIsLeaf = isVintedLeaf(graph, selectedCatalogId);
      // Keep the drill-down list visible on open: when a leaf is selected, show its siblings
      // (i.e. stay on the leaf's parent level), and only highlight the chosen leaf.
      if (selectedIsLeaf && selectedPath.length > 0) {
        setPathIds(selectedPath.slice(0, -1));
      } else {
        setPathIds(selectedPath);
      }
      setPendingCatalogId(selectedIsLeaf ? selectedCatalogId : null);
      return;
    }

    setPathIds([]);
    setPendingCatalogId(null);
  }, [open, selectedCatalogId, graph]);

  const pendingPath = useMemo(() => {
    if (pendingCatalogId === null) {
      return '';
    }
    return getVintedPathText(graph, pendingCatalogId);
  }, [graph, pendingCatalogId]);

  const searchResults = useMemo(() => {
    if (!isSearching) {
      return [];
    }

    // Prefer leaf hits (those are the only confirmable categories), but keep non-leaf
    // matches so users can jump into a branch quickly.
    const results = searchVintedCategories(graph, trimmedSearchQuery, 50);
    return results.sort((a, b) => {
      if (a.isLeaf !== b.isLeaf) {
        return a.isLeaf ? -1 : 1;
      }
      return b.score - a.score;
    });
  }, [graph, isSearching, trimmedSearchQuery]);

  const hasNodes = graph.rootNodes.length > 0;
  const currentParentId = pathIds.length > 0 ? pathIds[pathIds.length - 1] : null;
  const currentNodes =
    currentParentId === null
      ? graph.rootNodes
      : graph.childrenByParentId.get(currentParentId) || [];
  const showLoadingState = loading && !hasNodes;
  const showEmptyState = !loading && !error && !hasNodes;

  const handleSelectNode = (node: VintedCategoryOption) => {
    const hasChildren = (graph.childrenByParentId.get(node.id) || []).length > 0;
    if (hasChildren) {
      setPathIds([...pathIds, node.id]);
      setPendingCatalogId(null);
      return;
    }

    setPendingCatalogId(node.id);
    onSelectCatalog(node.id);
    onOpenChange(false);
  };

  const handleSelectSearchResult = (catalogId: number) => {
    const selectedPath = getVintedPathIds(graph, catalogId);
    if (!selectedPath.length) {
      return;
    }

    const selectedIsLeaf = isVintedLeaf(graph, catalogId);
    if (selectedIsLeaf) {
      setPathIds(selectedPath.slice(0, -1));
      setPendingCatalogId(catalogId);
      onSelectCatalog(catalogId);
      onOpenChange(false);
    } else {
      // Jump to the branch.
      setPathIds(selectedPath);
      setPendingCatalogId(null);
    }

    setSearchQuery('');
  };

  const handleJumpToPath = (index: number) => {
    const nextPath = pathIds.slice(0, index + 1);
    setPathIds(nextPath);
    const lastId = nextPath[nextPath.length - 1];
    if (lastId !== undefined && isVintedLeaf(graph, lastId)) {
      setPendingCatalogId(lastId);
    } else {
      setPendingCatalogId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1rem)] h-[calc(100dvh-1rem)] max-w-none border-neutral-800 bg-neutral-950 p-0 text-white overflow-hidden sm:rounded-xl sm:w-[clamp(560px,50vw,840px)] sm:max-w-[clamp(560px,50vw,840px)] sm:h-[clamp(520px,72dvh,820px)] grid grid-rows-[auto_1fr_auto] gap-0">
        <DialogHeader className="border-b border-neutral-800 px-5 py-3">
          <DialogTitle className="text-lg sm:text-xl font-semibold tracking-tight text-neutral-100">
            Choose Vinted category
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-0 px-5 py-4 flex flex-col gap-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search"
              className="border-neutral-700 bg-neutral-900 pl-12 text-neutral-100 placeholder:text-neutral-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setPathIds([]);
                setPendingCatalogId(null);
              }}
              title="All categories"
              aria-label="All categories"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-neutral-700 bg-neutral-800/60 text-neutral-200 hover:bg-neutral-800 hover:text-white"
            >
              <House className="h-3.5 w-3.5" />
            </button>
            {pathIds.map((id, index) => (
              <button
                key={`${id}-${index}`}
                type="button"
                onClick={() => handleJumpToPath(index)}
                title={graph.nodesById.get(id)?.title || 'Category'}
                className="inline-flex max-w-full min-w-0 items-center rounded-full border border-cyan-500/45 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-100 hover:bg-cyan-500/20"
              >
                <span className="truncate">{graph.nodesById.get(id)?.title || 'Category'}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 min-h-0">
            {showLoadingState && (
              <div className="rounded-md border border-neutral-800 bg-neutral-900/60 px-4 py-3 text-sm text-neutral-400">
                Loading categories...
              </div>
            )}

            {error && (
              <div className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            {!error && hasNodes && (
              <div className="h-full rounded-lg border border-neutral-800 bg-neutral-900/60">
                <div className="h-full overflow-y-auto p-3">
                  {!isSearching && !hasShortSearchQuery && (
                    <div className="space-y-2">
                      {currentNodes.map((node) => {
                        const hasChildren = (graph.childrenByParentId.get(node.id) || []).length > 0;
                        const isSelectedLeaf = pendingCatalogId === node.id && !hasChildren;
                        const baseClass =
                          'flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400';
                        const activeClass = isSelectedLeaf
                          ? 'border-cyan-500/60 bg-cyan-500/10 text-cyan-50'
                          : 'border-neutral-700 bg-neutral-800/60 text-neutral-200 hover:border-cyan-500/35 hover:bg-neutral-800 hover:text-white';

                        return (
                          <button
                            key={node.id}
                            type="button"
                            onClick={() => handleSelectNode(node)}
                            className={`${baseClass} ${activeClass}`}
                          >
                            <span className="truncate text-left">{node.title}</span>
                            {hasChildren && (
                              <ChevronRight className="h-4 w-4 shrink-0 text-neutral-500" />
                            )}
                            {!hasChildren && isSelectedLeaf && (
                              <span className="shrink-0 text-xs font-medium text-cyan-100">
                                Selected
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {hasShortSearchQuery && (
                    <div className="rounded-md border border-neutral-800 bg-neutral-950/30 px-3 py-2 text-sm text-neutral-400">
                      Type at least 2 characters.
                    </div>
                  )}

                  {isSearching && (
                    <div className="space-y-2">
                      {searchResults.length === 0 && (
                        <div className="rounded-md border border-neutral-800 bg-neutral-950/30 px-3 py-2 text-sm text-neutral-400">
                          No matches found.
                        </div>
                      )}

                      {searchResults.map((result) => {
                        const isLeaf = result.isLeaf;
                        const isSelected = pendingCatalogId === result.node.id && isLeaf;
                        const baseClass =
                          'flex w-full items-start justify-between gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400';
                        const activeClass = isSelected
                          ? 'border-cyan-500/60 bg-cyan-500/10 text-cyan-50'
                          : 'border-neutral-700 bg-neutral-800/60 text-neutral-200 hover:border-cyan-500/35 hover:bg-neutral-800 hover:text-white';

                        return (
                          <button
                            key={result.node.id}
                            type="button"
                            onClick={() => handleSelectSearchResult(result.node.id)}
                            className={`${baseClass} ${activeClass}`}
                          >
                            <div className="min-w-0 flex-1">
                              <p className="truncate">{result.node.title}</p>
                              <p className="mt-0.5 line-clamp-2 text-xs text-neutral-400">
                                {result.pathText}
                              </p>
                            </div>
                            <div className="shrink-0 flex items-center gap-2 pt-0.5">
                              {!isLeaf && (
                                <span className="rounded-full border border-neutral-700 bg-neutral-900/60 px-2 py-0.5 text-[11px] text-neutral-300">
                                  Branch
                                </span>
                              )}
                              {isLeaf && (
                                <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-2 py-0.5 text-[11px] text-cyan-100">
                                  Leaf
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {showEmptyState && (
              <div className="rounded-md border border-neutral-800 bg-neutral-900/60 px-4 py-3 text-sm text-neutral-400">
                No Vinted categories available.
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 flex flex-col gap-3 border-t border-neutral-800 bg-neutral-950/95 px-5 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            {pendingCatalogId !== null ? (
              <div className="rounded-md border border-cyan-500/25 bg-cyan-500/10 px-3 py-2">
                <p className="text-sm font-medium text-cyan-50 whitespace-normal break-words">
                  {pendingPath}
                </p>
              </div>
            ) : (
              <div className="h-6" />
            )}
          </div>
          <Button
            type="button"
            onClick={() => {
              if (pendingCatalogId === null) {
                return;
              }
              onSelectCatalog(pendingCatalogId);
              onOpenChange(false);
            }}
            disabled={pendingCatalogId === null}
            className="w-full bg-cyan-500 text-black hover:bg-cyan-400 disabled:bg-neutral-700 disabled:text-neutral-400 sm:w-auto"
          >
            Use this category
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
