import Link from "next/link";
import { Filter, SearchX } from "lucide-react";
import { notFound } from "next/navigation";

import { NormCard } from "@/components/norms/norm-card";
import { TenantSearchForm } from "@/components/search/tenant-search-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { logSearch, searchService } from "@/server/search/search-service";
import { getTenantBundleBySlug } from "@/server/tenants/tenant-service";
import { type SearchFilters } from "@/types/domain";

function toFilters(searchParams: Record<string, string | string[] | undefined>): SearchFilters {
  return {
    query: typeof searchParams.query === "string" ? searchParams.query : undefined,
    number: typeof searchParams.number === "string" ? searchParams.number : undefined,
    year: typeof searchParams.year === "string" && searchParams.year ? Number(searchParams.year) : undefined,
    type: typeof searchParams.type === "string" ? searchParams.type : undefined,
    theme: typeof searchParams.theme === "string" ? searchParams.theme : undefined,
    classification: typeof searchParams.classification === "string" ? searchParams.classification : undefined,
    authorship: typeof searchParams.authorship === "string" ? searchParams.authorship : undefined,
    initiative: typeof searchParams.initiative === "string" ? searchParams.initiative : undefined,
    status: typeof searchParams.status === "string" ? (searchParams.status as SearchFilters["status"]) : undefined,
    dateFrom: typeof searchParams.dateFrom === "string" ? searchParams.dateFrom : undefined,
    dateTo: typeof searchParams.dateTo === "string" ? searchParams.dateTo : undefined,
    sort: typeof searchParams.sort === "string" ? (searchParams.sort as SearchFilters["sort"]) : "relevance"
  };
}

export default async function ResultsPage({
  params,
  searchParams
}: {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ tenant: tenantSlug }, rawSearchParams] = await Promise.all([params, searchParams]);
  const bundle = await getTenantBundleBySlug(tenantSlug);

  if (!bundle) {
    notFound();
  }

  const filters = toFilters(rawSearchParams);
  const result = await searchService.search(bundle.tenant.slug, filters);
  await logSearch(bundle.tenant.slug, filters);

  return (
    <main className="page-shell py-10">
      <section className="space-y-6">
        <div className="space-y-3">
          <span className="section-eyebrow text-[var(--tenant-primary)]">Resultados</span>
          <h1 className="text-5xl">Busca de legislacao em {bundle.tenant.name}</h1>
          <p className="max-w-2xl text-lg text-slate-600">
            Refine a pesquisa sem perder contexto. Os resultados abaixo estao filtrados pelo tenant atual.
          </p>
        </div>
        <TenantSearchForm
          tenantSlug={bundle.tenant.slug}
          mode="advanced"
          defaultValues={{
            query: filters.query,
            number: filters.number,
            year: filters.year ? String(filters.year) : "",
            type: filters.type,
            theme: filters.theme,
            classification: filters.classification,
            authorship: filters.authorship,
            initiative: filters.initiative,
            status: filters.status,
            dateFrom: filters.dateFrom,
            dateTo: filters.dateTo,
            sort: filters.sort
          }}
        />
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card className="h-fit">
          <CardHeader>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--tenant-secondary)]">
              <Filter className="h-5 w-5 text-[var(--tenant-primary)]" />
            </div>
            <CardTitle className="text-3xl">Contexto da busca</CardTitle>
            <CardDescription>Resumo do que foi aplicado nesta consulta.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              <strong>Total encontrado:</strong> {result.total}
            </p>
            <p>
              <strong>Consulta:</strong> {filters.query || "Sem texto livre"}
            </p>
            <div className="space-y-2 text-slate-600">
              {Object.entries(filters)
                .filter(([, value]) => Boolean(value))
                .map(([key, value]) => (
                  <p key={key}>
                    <strong>{key}:</strong> {String(value)}
                  </p>
                ))}
            </div>
            {result.suggestions.length > 0 ? (
              <div className="space-y-2">
                <p className="font-semibold text-slate-900">Sugestoes de termos</p>
                <div className="flex flex-wrap gap-2">
                  {result.suggestions.map((suggestion) => (
                    <Link
                      key={suggestion}
                      href={`/${bundle.tenant.slug}/resultados?query=${encodeURIComponent(suggestion)}`}
                      className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700"
                    >
                      {suggestion}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
            {result.popularQueries.length > 0 ? (
              <div className="space-y-2">
                <p className="font-semibold text-slate-900">Buscas recentes desta demo</p>
                <div className="flex flex-wrap gap-2">
                  {result.popularQueries.map((query) => (
                    <Link
                      key={query}
                      href={`/${bundle.tenant.slug}/resultados?query=${encodeURIComponent(query)}`}
                      className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700"
                    >
                      {query}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {result.items.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-start gap-4 p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                  <SearchX className="h-5 w-5 text-slate-500" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl">Nenhuma norma encontrada</h2>
                  <p className="max-w-xl text-sm text-slate-600">
                    Tente remover filtros ou buscar por palavras mais amplas, como tema, assunto ou tipo da norma.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : null}
          {result.items.map((norm) => (
            <NormCard key={norm.id} tenantSlug={bundle.tenant.slug} norm={norm} />
          ))}
        </div>
      </section>
    </main>
  );
}
