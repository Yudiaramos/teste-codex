import { NextResponse } from "next/server";

import { logSearch, searchService } from "@/server/search/search-service";
import { getTenantBundleBySlug } from "@/server/tenants/tenant-service";
import { type SearchFilters } from "@/types/domain";

function parseFilters(searchParams: URLSearchParams): SearchFilters {
  return {
    query: searchParams.get("query") ?? undefined,
    number: searchParams.get("number") ?? undefined,
    year: searchParams.get("year") ? Number(searchParams.get("year")) : undefined,
    type: searchParams.get("type") ?? undefined,
    theme: searchParams.get("theme") ?? undefined,
    classification: searchParams.get("classification") ?? undefined,
    authorship: searchParams.get("authorship") ?? undefined,
    initiative: searchParams.get("initiative") ?? undefined,
    status: (searchParams.get("status") as SearchFilters["status"] | null) ?? undefined,
    dateFrom: searchParams.get("dateFrom") ?? undefined,
    dateTo: searchParams.get("dateTo") ?? undefined,
    sort: (searchParams.get("sort") as SearchFilters["sort"] | null) ?? "relevance"
  };
}

export async function GET(request: Request, { params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;
  const bundle = await getTenantBundleBySlug(tenant);

  if (!bundle) {
    return NextResponse.json({ message: "Tenant nao encontrado." }, { status: 404 });
  }

  const url = new URL(request.url);
  const suggest = url.searchParams.get("suggest");

  if (suggest === "1") {
    const query = url.searchParams.get("query") ?? "";
    const suggestions = await searchService.suggest(bundle.tenant.slug, query);
    return NextResponse.json({ suggestions });
  }

  const filters = parseFilters(url.searchParams);
  const result = await searchService.search(bundle.tenant.slug, filters);
  await logSearch(bundle.tenant.slug, filters);

  return NextResponse.json(result);
}
