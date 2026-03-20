import { HelpCircle, SearchCheck } from "lucide-react";
import { notFound } from "next/navigation";

import { TenantSearchForm } from "@/components/search/tenant-search-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantBundleBySlug } from "@/server/tenants/tenant-service";

export default async function TenantSearchPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params;
  const bundle = await getTenantBundleBySlug(tenantSlug);

  if (!bundle) {
    notFound();
  }

  return (
    <main className="page-shell py-10">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="overflow-hidden">
          <CardHeader className="space-y-4 bg-[var(--tenant-muted)]">
            <span className="section-eyebrow text-[var(--tenant-primary)]">Busca do municipio</span>
            <CardTitle className="text-5xl">Encontre leis, decretos e codigos com menos atrito</CardTitle>
            <CardDescription className="max-w-2xl text-base text-slate-600">
              Use a pesquisa simples se souber apenas um termo. Abra a busca avancada para combinar filtros e reduzir
              resultados irrelevantes.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <TenantSearchForm tenantSlug={bundle.tenant.slug} mode="advanced" />
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card className="bg-slate-950 text-white">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <SearchCheck className="h-5 w-5 text-amber-300" />
              </div>
              <CardTitle className="text-3xl text-white">Modo simples e avancado</CardTitle>
              <CardDescription className="text-slate-300">
                A mesma busca se adapta ao contexto do usuario, sem esconder filtros importantes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-slate-200">
              <p>Autocomplete sugere normas, temas e termos do acervo.</p>
              <p>Resultados podem ser ordenados por relevancia, atualidade ou popularidade.</p>
              <p>Os filtros foram pensados para consultas reais do cidadao e da equipe tecnica.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--tenant-secondary)]">
                <HelpCircle className="h-5 w-5 text-[var(--tenant-primary)]" />
              </div>
              <CardTitle className="text-3xl">Ajuda rapida</CardTitle>
              <CardDescription>Pistas de uso para quem nao domina linguagem legislativa.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-slate-600">
              {bundle.tenant.profile.howToSearch.map((tip) => (
                <p key={tip}>{tip}</p>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
