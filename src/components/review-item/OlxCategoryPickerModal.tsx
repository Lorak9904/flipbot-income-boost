import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronRight, House, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  getOlxCategoryPath,
  getOlxCategoryTree,
  searchOlxCategories,
  type OlxCategoryNode,
} from '@/lib/api/olx';

interface OlxCategoryPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCategoryId: number | string | null;
  selectedCategoryPath?: string | null;
  onSelectCategory: (node: OlxCategoryNode) => void;
}

type ParentKey = number | null;

function normalizeOlxCategoryId(raw: string | number | null | undefined): number | null {
  if (raw === null || raw === undefined || raw === '') {
    return null;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function hasChildrenForNode(node: OlxCategoryNode): boolean {
  if (node.has_children !== undefined) {
    return Boolean(node.has_children);
  }
  return !node.is_leaf;
}

function getPathText(nodes: OlxCategoryNode[]): string {
  return nodes.map((node) => node.name).filter(Boolean).join(' > ');
}

function withPath(node: OlxCategoryNode, pathNodes: OlxCategoryNode[]): OlxCategoryNode {
  return {
    ...node,
    path: node.path && node.path !== node.name ? node.path : getPathText([...pathNodes, node]),
  };
}

export default function OlxCategoryPickerModal({
  open,
  onOpenChange,
  selectedCategoryId,
  selectedCategoryPath,
  onSelectCategory,
}: OlxCategoryPickerModalProps) {
  const [pathNodes, setPathNodes] = useState<OlxCategoryNode[]>([]);
  const [pendingLeaf, setPendingLeaf] = useState<OlxCategoryNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [treeByParent, setTreeByParent] = useState<Map<ParentKey, OlxCategoryNode[]>>(
    () => new Map()
  );
  const [loadingParent, setLoadingParent] = useState<ParentKey>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<OlxCategoryNode[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const latestTreeRequestId = useRef(0);
  const latestSearchRequestId = useRef(0);

  const currentParentId = pathNodes.length ? pathNodes[pathNodes.length - 1]?.category_id : null;
  const currentNodes = treeByParent.get(currentParentId) || [];
  const trimmedSearchQuery = searchQuery.trim();
  const isSearching = trimmedSearchQuery.length >= 2;
  const hasShortSearchQuery = trimmedSearchQuery.length > 0 && trimmedSearchQuery.length < 2;
  const showLoadingState =
    open && !isSearching && currentNodes.length === 0 && loadingParent === currentParentId;

  const pendingPathText = useMemo(() => pendingLeaf?.path || '', [pendingLeaf]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setSearchQuery('');
    setError(null);
    setSearchResults([]);
    setSearchLoading(false);
    setSearchError(null);
    setTreeByParent(new Map());
    setPathNodes([]);

    const normalizedSelected = normalizeOlxCategoryId(selectedCategoryId);
    const existingPath = selectedCategoryPath?.trim() || '';
    setPendingLeaf(
      normalizedSelected
        ? {
            category_id: normalizedSelected,
            name: existingPath,
            path: existingPath,
            parent_id: null,
            is_leaf: true,
          }
        : null
    );
  }, [open, selectedCategoryId, selectedCategoryPath]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const normalizedSelected = normalizeOlxCategoryId(selectedCategoryId);
    if (!normalizedSelected) {
      return;
    }

    const controller = new AbortController();
    (async () => {
      try {
        const payload = await getOlxCategoryPath({
          categoryId: normalizedSelected,
          signal: controller.signal,
        });
        if (controller.signal.aborted || !payload.path.length) {
          return;
        }

        const selected = payload.selected || payload.path[payload.path.length - 1];
        const selectedIsLeaf = selected?.is_leaf ?? true;
        setPathNodes(selectedIsLeaf ? payload.path.slice(0, -1) : payload.path);
        setPendingLeaf(selectedIsLeaf ? selected : null);
      } catch {
        // Keep the ID placeholder if path resolution fails; traversal still works.
      }
    })();

    return () => controller.abort();
  }, [open, selectedCategoryId]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!isSearching) {
      setSearchResults([]);
      setSearchLoading(false);
      setSearchError(null);
      return;
    }

    const requestId = ++latestSearchRequestId.current;
    const controller = new AbortController();
    setSearchLoading(true);
    setSearchError(null);

    (async () => {
      try {
        const payload = await searchOlxCategories({
          query: trimmedSearchQuery,
          limit: 30,
          signal: controller.signal,
        });

        if (latestSearchRequestId.current !== requestId || controller.signal.aborted) {
          return;
        }

        setSearchResults(payload.results || []);
      } catch (err) {
        if (controller.signal.aborted || latestSearchRequestId.current !== requestId) {
          return;
        }
        setSearchError(err instanceof Error ? err.message : 'Failed to search OLX categories');
      } finally {
        if (latestSearchRequestId.current === requestId) {
          setSearchLoading(false);
        }
      }
    })();

    return () => controller.abort();
  }, [open, isSearching, trimmedSearchQuery]);

  useEffect(() => {
    if (!open || isSearching) {
      return;
    }

    const parentId = currentParentId;
    if (treeByParent.has(parentId)) {
      return;
    }

    const requestId = ++latestTreeRequestId.current;
    const controller = new AbortController();
    setLoadingParent(parentId);
    setError(null);

    (async () => {
      try {
        const payload = await getOlxCategoryTree({
          parentId,
          signal: controller.signal,
        });

        if (latestTreeRequestId.current !== requestId || controller.signal.aborted) {
          return;
        }

        setTreeByParent((prev) => {
          const next = new Map(prev);
          next.set(parentId, payload.results || []);
          return next;
        });
      } catch (err) {
        if (latestTreeRequestId.current !== requestId || controller.signal.aborted) {
          return;
        }
        setError(err instanceof Error ? err.message : 'Failed to load OLX categories');
      } finally {
        if (latestTreeRequestId.current === requestId) {
          setLoadingParent(null);
        }
      }
    })();

    return () => controller.abort();
  }, [open, isSearching, currentParentId, treeByParent]);

  const handleSelectNode = (node: OlxCategoryNode) => {
    const nodeWithPath = withPath(node, pathNodes);
    if (hasChildrenForNode(node)) {
      setPathNodes([...pathNodes, nodeWithPath]);
      setPendingLeaf(null);
      return;
    }
    setPendingLeaf(nodeWithPath);
    onSelectCategory(nodeWithPath);
    onOpenChange(false);
  };

  const handleJumpToPath = (index: number) => {
    setPathNodes(pathNodes.slice(0, index + 1));
    setPendingLeaf(null);
    setSearchQuery('');
  };

  const clearToRoot = () => {
    setPathNodes([]);
    setPendingLeaf(null);
    setSearchQuery('');
  };

  const handleSelectSearchResult = (match: OlxCategoryNode) => {
    const ancestors = match.ancestors || [];
    const nodeWithPath = {
      ...match,
      path: match.path || getPathText([...ancestors, match]),
    };

    if (match.is_leaf) {
      setPathNodes(ancestors);
      setPendingLeaf(nodeWithPath);
      setSearchQuery('');
      onSelectCategory(nodeWithPath);
      onOpenChange(false);
      return;
    }

    setPathNodes([...ancestors, nodeWithPath]);
    setPendingLeaf(null);
    setSearchQuery('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1rem)] h-[calc(100dvh-1rem)] max-w-none border-neutral-800 bg-neutral-950 p-0 text-white overflow-hidden sm:rounded-xl sm:w-[clamp(560px,50vw,840px)] sm:max-w-[clamp(560px,50vw,840px)] sm:h-[clamp(520px,72dvh,820px)] grid grid-rows-[auto_1fr_auto] gap-0">
        <DialogHeader className="border-b border-neutral-800 px-5 py-3">
          <DialogTitle className="text-lg sm:text-xl font-semibold tracking-tight text-neutral-100">
            Choose OLX category
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
              onClick={clearToRoot}
              title="All categories"
              aria-label="All categories"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-neutral-700 bg-neutral-800/60 text-neutral-200 hover:bg-neutral-800 hover:text-white"
            >
              <House className="h-3.5 w-3.5" />
            </button>
            {pathNodes.map((node, index) => (
              <button
                key={`${node.category_id}-${index}`}
                type="button"
                onClick={() => handleJumpToPath(index)}
                title={node.name || 'Category'}
                className="inline-flex max-w-full min-w-0 items-center rounded-full border border-cyan-500/45 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-100 hover:bg-cyan-500/20"
              >
                <span className="truncate">{node.name || 'Category'}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 min-h-0">
            {showLoadingState && (
              <div className="rounded-md border border-neutral-800 bg-neutral-900/60 px-4 py-3 text-sm text-neutral-400">
                Loading categories...
              </div>
            )}

            {error && !isSearching && (
              <div className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            {searchError && isSearching && (
              <div className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {searchError}
              </div>
            )}

            {(!error || isSearching) && (
              <div className="h-full rounded-lg border border-neutral-800 bg-neutral-900/60">
                <div className="h-full overflow-y-auto p-3">
                  {!isSearching && !hasShortSearchQuery && (
                    <div className="space-y-2">
                      {currentNodes.map((node) => {
                        const hasChildren = hasChildrenForNode(node);
                        const isSelectedLeaf = pendingLeaf?.category_id === node.category_id && !hasChildren;
                        const baseClass =
                          'flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400';
                        const activeClass = isSelectedLeaf
                          ? 'border-cyan-500/60 bg-cyan-500/10 text-cyan-50'
                          : 'border-neutral-700 bg-neutral-800/60 text-neutral-200 hover:border-cyan-500/35 hover:bg-neutral-800 hover:text-white';

                        return (
                          <button
                            key={node.category_id}
                            type="button"
                            onClick={() => handleSelectNode(node)}
                            className={`${baseClass} ${activeClass}`}
                          >
                            <span className="truncate text-left">{node.name}</span>
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

                      {!showLoadingState && currentNodes.length === 0 && (
                        <div className="rounded-md border border-neutral-800 bg-neutral-950/30 px-4 py-3 text-sm text-neutral-400">
                          No categories found at this level.
                        </div>
                      )}
                    </div>
                  )}

                  {hasShortSearchQuery && (
                    <div className="rounded-md border border-neutral-800 bg-neutral-950/30 px-3 py-2 text-sm text-neutral-400">
                      Type at least 2 characters.
                    </div>
                  )}

                  {isSearching && (
                    <div className="space-y-2">
                      {searchLoading && (
                        <div className="rounded-md border border-neutral-800 bg-neutral-950/30 px-3 py-2 text-sm text-neutral-400">
                          Searching...
                        </div>
                      )}

                      {!searchLoading && searchResults.length === 0 && (
                        <div className="rounded-md border border-neutral-800 bg-neutral-950/30 px-3 py-2 text-sm text-neutral-400">
                          No matches found.
                        </div>
                      )}

                      {searchResults.map((match) => {
                        const isLeaf = match.is_leaf;
                        const isSelected = pendingLeaf?.category_id === match.category_id && isLeaf;
                        const baseClass =
                          'flex w-full items-start justify-between gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400';
                        const activeClass = isSelected
                          ? 'border-cyan-500/60 bg-cyan-500/10 text-cyan-50'
                          : 'border-neutral-700 bg-neutral-800/60 text-neutral-200 hover:border-cyan-500/35 hover:bg-neutral-800 hover:text-white';

                        return (
                          <button
                            key={match.category_id}
                            type="button"
                            onClick={() => handleSelectSearchResult(match)}
                            className={`${baseClass} ${activeClass}`}
                          >
                            <div className="min-w-0 flex-1">
                              <p className="truncate">{match.name}</p>
                              <p className="mt-0.5 line-clamp-2 text-xs text-neutral-400">
                                {match.path}
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
          </div>
        </div>

        <div className="sticky bottom-0 flex flex-col gap-3 border-t border-neutral-800 bg-neutral-950/95 px-5 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            {pendingLeaf?.category_id ? (
              <div className="rounded-md border border-cyan-500/25 bg-cyan-500/10 px-3 py-2">
                <p className="text-sm font-medium text-cyan-50 whitespace-normal break-words">
                  {pendingPathText || pendingLeaf.name || 'Selected category'}
                </p>
              </div>
            ) : (
              <div className="h-6" />
            )}
          </div>
          <Button
            type="button"
            onClick={() => {
              if (!pendingLeaf?.category_id) {
                return;
              }
              onSelectCategory(pendingLeaf);
              onOpenChange(false);
            }}
            disabled={!pendingLeaf?.category_id}
            className="w-full bg-cyan-500 text-black hover:bg-cyan-400 disabled:bg-neutral-700 disabled:text-neutral-400 sm:w-auto"
          >
            Use this category
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
