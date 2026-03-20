import { getMemoryStore } from "@/server/data/memory-store";
import { getTenantBundleBySlug } from "@/server/tenants/tenant-service";
import { type NormRecord, type SearchFilters, type SearchResult } from "@/types/domain";

export interface SearchService {
  search(tenantSlug: string, filters: SearchFilters): Promise<SearchResult>;
  suggest(tenantSlug: string, query: string): Promise<string[]>;
}

function getStringArray(values: string[] | undefined) {
  return Array.isArray(values) ? values : [];
}

function includesNormalized(value: string | undefined, query: string) {
  return (value ?? "").toLowerCase().includes(query.toLowerCase());
}

function scoreNorm(norm: NormRecord, query: string) {
  const keywords = getStringArray(norm.keywords);
  const tags = getStringArray(norm.tags);
  const source = [
    norm.fullCode,
    norm.title,
    norm.summary,
    norm.plainLanguageSummary,
    norm.subject,
    norm.authorship,
    norm.initiative,
    keywords.join(" "),
    tags.join(" ")
  ].join(" ");

  if (!query.trim()) {
    return 0;
  }

  const lowered = query.toLowerCase();

  if (norm.fullCode.toLowerCase() === lowered || norm.title.toLowerCase() === lowered) {
    return 120;
  }

  if (source.toLowerCase().includes(lowered)) {
    return 70;
  }

  return 0;
}

function applyFilters(norms: NormRecord[], filters: SearchFilters, themeNameById: Map<string, string>) {
  return norms.filter((norm) => {
    const query = filters.query?.trim().toLowerCase();
    const keywords = getStringArray(norm.keywords);
    const tags = getStringArray(norm.tags);
    const themeIds = getStringArray(norm.themeIds);

    if (query) {
      const inBody = [
        norm.fullCode,
        norm.title,
        norm.summary,
        norm.plainLanguageSummary,
        norm.fullText,
        norm.classification,
        norm.subject,
        norm.authorship,
        norm.initiative,
        keywords.join(" "),
        tags.join(" "),
        themeIds.map((themeId) => themeNameById.get(themeId) ?? "").join(" ")
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);

      if (!inBody) {
        return false;
      }
    }

    if (filters.number && !includesNormalized(norm.number, filters.number)) {
      return false;
    }

    if (filters.year && norm.year !== filters.year) {
      return false;
    }

    if (filters.type && !includesNormalized(norm.type, filters.type)) {
      return false;
    }

    if (filters.theme) {
      const match = themeIds.some((themeId) => includesNormalized(themeNameById.get(themeId), filters.theme!));
      if (!match) {
        return false;
      }
    }

    if (filters.classification && !includesNormalized(norm.classification, filters.classification)) {
      return false;
    }

    if (filters.authorship && !includesNormalized(norm.authorship, filters.authorship)) {
      return false;
    }

    if (filters.initiative && !includesNormalized(norm.initiative, filters.initiative)) {
      return false;
    }

    if (filters.status && norm.status !== filters.status) {
      return false;
    }

    if (filters.dateFrom && norm.publicationDate < filters.dateFrom) {
      return false;
    }

    if (filters.dateTo && norm.publicationDate > filters.dateTo) {
      return false;
    }

    return true;
  });
}

class PostgresLikeSearchService implements SearchService {
  async search(tenantSlug: string, filters: SearchFilters): Promise<SearchResult> {
    const bundle = await getTenantBundleBySlug(tenantSlug);

    if (!bundle) {
      return {
        items: [],
        total: 0,
        suggestions: [],
        popularQueries: []
      };
    }

    const themeNameById = new Map(bundle.themes.map((theme) => [theme.id, theme.name]));

    const filtered = applyFilters(bundle.norms, filters, themeNameById);
    const query = filters.query?.trim() ?? "";

    const sorted = [...filtered].sort((a, b) => {
      const sort = filters.sort ?? "relevance";

      if (sort === "recent") {
        return b.publicationDate.localeCompare(a.publicationDate);
      }

      if (sort === "popular") {
        return b.accessCount - a.accessCount;
      }

      const scoreDiff = scoreNorm(b, query) - scoreNorm(a, query);
      if (scoreDiff !== 0) {
        return scoreDiff;
      }

      return b.publicationDate.localeCompare(a.publicationDate);
    });

    const suggestions = await this.suggest(tenantSlug, query);
    const popularQueries = getMemoryStore()
      .searchLogs.filter((entry) => entry.tenantId === bundle.tenant.id)
      .map((entry) => entry.query)
      .filter(Boolean)
      .slice(-5)
      .reverse();

    return {
      items: sorted,
      total: sorted.length,
      suggestions,
      popularQueries
    };
  }

  async suggest(tenantSlug: string, query: string): Promise<string[]> {
    const bundle = await getTenantBundleBySlug(tenantSlug);

    if (!bundle) {
      return [];
    }

    const normalized = query.trim().toLowerCase();

    if (normalized.length < 2) {
      return bundle.themes.slice(0, 4).map((theme) => theme.name);
    }

    const suggestionPool = new Set<string>();

    bundle.themes.forEach((theme) => {
      if (theme.name.toLowerCase().includes(normalized)) {
        suggestionPool.add(theme.name);
      }
    });

    bundle.norms.forEach((norm) => {
      const keywords = getStringArray(norm.keywords);
      const tags = getStringArray(norm.tags);

      if (norm.title.toLowerCase().includes(normalized)) {
        suggestionPool.add(norm.title);
      }
      if (norm.fullCode.toLowerCase().includes(normalized)) {
        suggestionPool.add(norm.fullCode);
      }
      keywords.forEach((keyword) => {
        if (keyword.toLowerCase().includes(normalized)) {
          suggestionPool.add(keyword);
        }
      });
      tags.forEach((tag) => {
        if (tag.toLowerCase().includes(normalized)) {
          suggestionPool.add(tag);
        }
      });
    });

    return Array.from(suggestionPool).slice(0, 6);
  }
}

export const searchService: SearchService = new PostgresLikeSearchService();

export async function logSearch(tenantSlug: string, filters: SearchFilters) {
  const bundle = await getTenantBundleBySlug(tenantSlug);

  if (!bundle || !filters.query) {
    return;
  }

  getMemoryStore().searchLogs.unshift({
    id: `search-${Date.now()}`,
    tenantId: bundle.tenant.id,
    query: filters.query,
    filters: Object.fromEntries(
      Object.entries(filters).flatMap(([key, value]) => {
        if (!value) {
          return [];
        }

        return [[key, String(value)]];
      })
    ),
    createdAt: new Date().toISOString()
  });
}
