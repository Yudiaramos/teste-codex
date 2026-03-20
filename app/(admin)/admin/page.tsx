import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { SignOutButton } from "@/components/admin/sign-out-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCompactDate } from "@/lib/utils";
import { getAdminOverview, getTenantAdminData } from "@/server/admin/admin-service";

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  const overview = await getAdminOverview();
  const tenantData = session.user.tenantSlug ? await getTenantAdminData(session.user.tenantSlug) : null;
  const visibleTenants = session.user.role === "GLOBAL_ADMIN" ? overview.tenants : overview.tenants.filter((tenant) => tenant.slug === session.user.tenantSlug);

  return (
    <main className="page-shell py-10">
      <section className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <span className="section-eyebrow">Admin</span>
          <h1 className="text-5xl">Painel operacional</h1>
          <p className="max-w-2xl text-lg text-slate-600">
            Visualize tenants, normas, buscas recentes e use as APIs REST para operacoes de cadastro e edicao.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {session.user.role === "GLOBAL_ADMIN" && (
            <Button asChild variant="outline">
              <Link href="/admin/municipios">Gerenciar Municípios</Link>
            </Button>
          )}
          <SignOutButton />
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Tenants cadastrados</CardDescription>
            <CardTitle className="text-4xl">{overview.tenants.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Normas no acervo demo</CardDescription>
            <CardTitle className="text-4xl">{overview.totalNorms}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Buscas registradas</CardDescription>
            <CardTitle className="text-4xl">{overview.totalSearches}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Favoritos criados</CardDescription>
            <CardTitle className="text-4xl">{overview.favoriteCount}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <section className="mt-10 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Tenants visiveis para este usuario</CardTitle>
            <CardDescription>
              {session.user.role === "GLOBAL_ADMIN"
                ? "Usuario global com visao de todos os municipios."
                : `Usuario restrito ao tenant ${session.user.tenantSlug}.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {visibleTenants.map((tenant) => (
              <div key={tenant.id} className="rounded-3xl border border-slate-200 px-4 py-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {tenant.name}-{tenant.stateCode}
                    </p>
                    <p className="text-sm text-slate-600">Slug: {tenant.slug}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/${tenant.slug}`}>Abrir portal</Link>
                    </Button>
                    <Button asChild size="sm">
                      <Link href={`/admin/${tenant.slug}/propostas`}>Propostas</Link>
                    </Button>
                    <Button asChild size="sm">
                      <Link href={`/admin/${tenant.slug}/editor`}>Editor</Link>
                    </Button>
                    <Button asChild variant="secondary" size="sm">
                      <Link href={`/admin/${tenant.slug}/ingestao`}>Ingestão</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/${tenant.slug}/personalizador`}>Personalizador</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Buscas recentes</CardTitle>
            <CardDescription>Ultimas consultas registradas nesta sessao de desenvolvimento.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {overview.recentSearches.length === 0 ? <p className="text-sm text-slate-600">Nenhuma busca registrada ainda.</p> : null}
            {overview.recentSearches.map((entry) => (
              <div key={entry.id} className="rounded-3xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">{entry.query}</p>
                <p>{formatCompactDate(entry.createdAt)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {tenantData ? (
        <section className="mt-10 grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Normas do tenant</CardTitle>
              <CardDescription>Resumo operacional do municipio administrado.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {tenantData.norms.slice(0, 5).map((norm) => (
                <div key={norm.id} className="rounded-3xl border border-slate-200 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{norm.fullCode}</p>
                  <p className="mt-2 font-semibold text-slate-900">{norm.title}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Endpoints uteis</CardTitle>
              <CardDescription>Rotas REST prontas para integracoes e painel.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <p>GET /api/tenants</p>
              <p>GET /api/tenants/{tenantData.tenant.slug}</p>
              <p>GET /api/{tenantData.tenant.slug}/norms</p>
              <p>GET /api/{tenantData.tenant.slug}/search</p>
              <p>POST /api/admin/{tenantData.tenant.slug}/norms</p>
            </CardContent>
          </Card>
        </section>
      ) : null}
    </main>
  );
}
