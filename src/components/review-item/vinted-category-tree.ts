import type { VintedCategoryOption } from '@/lib/api/vinted';

export interface VintedCategoryGraph {
  nodesById: Map<number, VintedCategoryOption>;
  childrenByParentId: Map<number | null, VintedCategoryOption[]>;
  rootNodes: VintedCategoryOption[];
}

export interface VintedCategorySearchResult {
  node: VintedCategoryOption;
  pathIds: number[];
  pathText: string;
  isLeaf: boolean;
  score: number;
}

function normalizeParentId(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === '') {
    return null;
  }
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  // Some payloads use 0 for "no parent" at root level.
  if (parsed <= 0) {
    return null;
  }
  return Math.trunc(parsed);
}

export function parseVintedCatalogId(raw: string | number | null | undefined): number | null {
  if (raw === null || raw === undefined) {
    return null;
  }
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  return Math.trunc(parsed);
}

export function buildVintedCategoryGraph(categories: VintedCategoryOption[]): VintedCategoryGraph {
  const nodesById = new Map<number, VintedCategoryOption>();
  const childrenByParentId = new Map<number | null, VintedCategoryOption[]>();

  for (const category of categories) {
    const id = Number(category.id);
    if (!Number.isFinite(id)) {
      continue;
    }
    nodesById.set(id, { ...category, id });
  }

  for (const node of nodesById.values()) {
    const parentId = normalizeParentId(node.parent_id);
    const siblings = childrenByParentId.get(parentId) || [];
    siblings.push(node);
    childrenByParentId.set(parentId, siblings);
  }

  for (const [parentId, siblings] of childrenByParentId.entries()) {
    childrenByParentId.set(
      parentId,
      siblings.sort((a, b) => a.title.localeCompare(b.title, 'pl', { sensitivity: 'base' }))
    );
  }

  return {
    nodesById,
    childrenByParentId,
    rootNodes: childrenByParentId.get(null) || [],
  };
}

export function getVintedPathIds(graph: VintedCategoryGraph, nodeId: number): number[] {
  if (!graph.nodesById.has(nodeId)) {
    return [];
  }

  const path: number[] = [];
  const seen = new Set<number>();
  let currentId: number | null = nodeId;

  while (currentId !== null) {
    if (seen.has(currentId)) {
      break;
    }
    seen.add(currentId);
    path.push(currentId);

    const node = graph.nodesById.get(currentId);
    if (!node) {
      break;
    }

    currentId = normalizeParentId(node.parent_id);
  }

  return path.reverse();
}

export function getVintedPathText(graph: VintedCategoryGraph, nodeId: number): string {
  const pathIds = getVintedPathIds(graph, nodeId);
  if (!pathIds.length) {
    return '';
  }
  return pathIds
    .map((id) => graph.nodesById.get(id)?.title || '')
    .filter(Boolean)
    .join(' > ');
}

export function isVintedLeaf(graph: VintedCategoryGraph, nodeId: number): boolean {
  return (graph.childrenByParentId.get(nodeId) || []).length === 0;
}

export function searchVintedCategories(
  graph: VintedCategoryGraph,
  query: string,
  limit = 30
): VintedCategorySearchResult[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [];
  }

  const results: VintedCategorySearchResult[] = [];

  for (const node of graph.nodesById.values()) {
    const title = (node.title || '').toLowerCase();
    const code = (node.code || '').toLowerCase();
    const pathIds = getVintedPathIds(graph, node.id);
    if (!pathIds.length) {
      continue;
    }

    const pathText = pathIds
      .map((id) => graph.nodesById.get(id)?.title || '')
      .filter(Boolean)
      .join(' > ');
    const normalizedPath = pathText.toLowerCase();

    const hasMatch =
      title.includes(normalized) ||
      code.includes(normalized) ||
      normalizedPath.includes(normalized) ||
      String(node.id).includes(normalized);
    if (!hasMatch) {
      continue;
    }

    let score = 0;
    if (title === normalized) score += 10;
    if (title.startsWith(normalized)) score += 8;
    if (title.includes(normalized)) score += 6;
    if (code.startsWith(normalized)) score += 4;
    if (normalizedPath.includes(normalized)) score += 2;
    if (String(node.id) === normalized) score += 10;
    score += Math.min(pathIds.length, 6);

    results.push({
      node,
      pathIds,
      pathText,
      isLeaf: isVintedLeaf(graph, node.id),
      score,
    });
  }

  return results
    .sort((a, b) => b.score - a.score || a.pathText.localeCompare(b.pathText, 'pl', { sensitivity: 'base' }))
    .slice(0, limit);
}
