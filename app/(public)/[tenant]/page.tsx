import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookMarked,
  Bot,
  Building2,
  FileStack,
  Sparkles,
  Search,
  TrendingUp,
  Zap
} from "lucide-react";
import { notFound } from "next/navigation";

import { NormCard } from "@/components/norms/norm-card";
import { TenantSearchForm } from "@/components/search/tenant-search-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantBundleBySlug } from "@/server/tenants/tenant-service";

export default async function TenantHomePage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params;
  const bundle = await getTenantBundleBySlug(tenantSlug);

  if (!bundle) {
    notFound();
  }

  const featuredNorms = bundle.featuredNorms
    .map((item) => bundle.norms.find((norm) => norm.id === item.normId))
    .filter((norm): norm is NonNullable<typeof norm> => Boolean(norm));
  const mostAccessed = bundle.tenant.mostAccessedNormIds
    .map((id) => bundle.norms.find((norm) => norm.id === id))
    .filter((norm): norm is NonNullable<typeof norm> => Boolean(norm));
  const recent = bundle.tenant.recentNormIds
    .map((id) => bundle.norms.find((norm) => norm.id === id))
    .filter((norm): norm is NonNullable<typeof norm> => Boolean(norm));
  const popularThemes = bundle.tenant.popularThemeIds
    .map((id) => bundle.themes.find((theme) => theme.id === id))
    .filter((theme): theme is NonNullable<typeof theme> => Boolean(theme));

  return (
    <main className="pb-16">
      {/* ════════════════════════════════════════════════════════════
          SECTION 1 — Hero
       ════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 mesh-gradient" />
        <div className="absolute inset-0 deco-grid opacity-40" />
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[var(--tenant-primary)]/5 blur-3xl" />
        <div className="absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-[var(--tenant-accent)]/5 blur-3xl" />

        <div className="relative page-shell py-12 md:py-20">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            {/* Left — Text + Search */}
            <div className="space-y-8 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 rounded-full bg-[var(--tenant-secondary)]/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--tenant-primary)] backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5" />
                Portal oficial de consulta
              </div>

              <div className="space-y-5">
                <h1 className="max-w-2xl text-4xl leading-[1.15] md:text-5xl lg:text-6xl">
                  {bundle.tenant.profile.officialHeadline}
                </h1>
                <p className="max-w-xl text-lg leading-relaxed text-slate-600">
                  {bundle.tenant.profile.institutionalText}
                </p>
              </div>

              <TenantSearchForm tenantSlug={bundle.tenant.slug} className="max-w-2xl" />

              {/* Stats row */}
              <div className="grid gap-3 sm:grid-cols-3 animate-fade-in-up delay-300">
                <div className="stat-card">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--tenant-primary)]">
                    Normas publicadas
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-950">{bundle.tenant.stats.publishedNorms}</p>
                </div>
                <div className="stat-card">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--tenant-primary)]">
                    Buscas mensais
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-950">{bundle.tenant.stats.monthlySearches}</p>
                </div>
                <div className="stat-card">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--tenant-primary)]">
                    Atualizadas no ano
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-950">{bundle.tenant.stats.updatedThisYear}</p>
                </div>
              </div>
            </div>

            {/* Right — Hero image card */}
            <div className="relative animate-fade-in-up delay-200">
              <div className="absolute inset-0 rounded-[2rem] bg-[var(--tenant-primary)]/8 blur-3xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-slate-950 shadow-2xl">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={bundle.tenant.branding.heroImageUrl}
                    alt={`Ilustração de ${bundle.tenant.name}`}
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                </div>
                <div className="relative -mt-16 space-y-4 p-8">
                  <div className="flex items-center gap-3 text-amber-300">
                    <Sparkles className="h-5 w-5 animate-float" />
                    <span className="text-sm font-semibold uppercase tracking-[0.18em]">Experiência guiada</span>
                  </div>
                  <p className="text-sm leading-6 text-slate-300">
                    A home reorganiza o portal por contexto: busca em destaque, normas estratégicas, temas populares e
                    orientações para quem não domina linguagem jurídica.
                  </p>
                  <Button asChild variant="accent" size="lg">
                    <Link href={`/${bundle.tenant.slug}/busca`}>
                      Explorar busca avançada
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          SECTION 2 — Strategic shortcuts
       ════════════════════════════════════════════════════════════ */}
      <section className="page-shell -mt-2 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {bundle.tenant.profile.strategicShortcuts.map((shortcut, index) => (
          <Card
            key={shortcut.title}
            className={`card-hover border-slate-200/80 animate-fade-in-up delay-${(index + 1) * 100}`}
          >
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--tenant-secondary)] to-white shadow-sm">
                <BookMarked className="h-5 w-5 text-[var(--tenant-primary)]" />
              </div>
              <CardTitle className="text-lg">{shortcut.title}</CardTitle>
              <CardDescription className="line-clamp-2">{shortcut.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="ghost" size="sm" className="group">
                <Link href={shortcut.href}>
                  Abrir
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* ════════════════════════════════════════════════════════════
          SECTION 3 — Featured norms + How to search + Themes
       ════════════════════════════════════════════════════════════ */}
      <section className="page-shell mt-16 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="section-eyebrow">Normas em destaque</p>
              <h2 className="mt-2 text-3xl md:text-4xl">Comece pelo que mais importa</h2>
            </div>
            <Button asChild variant="outline">
              <Link href={`/${bundle.tenant.slug}/resultados?sort=popular`}>
                Ver tudo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-6">
            {featuredNorms.map((norm) => (
              <NormCard key={norm.id} tenantSlug={bundle.tenant.slug} norm={norm} />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {/* How to search card */}
          <Card className="glass-dark overflow-hidden">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Como pesquisar</CardTitle>
              <CardDescription className="text-slate-400">
                Passos pensados para usuários não especialistas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-0">
              {bundle.tenant.profile.howToSearch.map((step, index) => (
                <div key={step} className="step-line relative flex gap-4 pb-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-sm font-bold text-slate-950 shadow-lg">
                    {index + 1}
                  </div>
                  <p className="pt-2 text-sm leading-6 text-slate-300">{step}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Popular themes card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Temas populares</CardTitle>
              <CardDescription>Navegação por assunto para consultas do dia a dia.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2.5">
              {popularThemes.map((theme) => (
                <Link
                  key={theme.id}
                  href={`/${bundle.tenant.slug}/resultados?theme=${encodeURIComponent(theme.slug)}`}
                  className="group flex items-center justify-between rounded-2xl border border-slate-200/70 px-4 py-3.5 transition-all hover:border-[var(--tenant-primary)]/40 hover:bg-[var(--tenant-muted)]/50 hover:shadow-sm"
                >
                  <div>
                    <p className="font-semibold text-slate-900 transition-colors group-hover:text-[var(--tenant-primary)]">
                      {theme.name}
                    </p>
                    <p className="text-sm text-slate-500">{theme.description}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-[var(--tenant-primary)]">
                    <TrendingUp className="h-3.5 w-3.5" />
                    {theme.popularity}%
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          SECTION 4 — AI Legislativa (Coming Soon)
       ════════════════════════════════════════════════════════════ */}
      <section className="page-shell mt-16">
        <div className="relative overflow-hidden rounded-[2rem] border border-purple-200/30 bg-gradient-to-br from-slate-950 via-purple-950/90 to-slate-950 p-px">
          <div className="absolute inset-0 opacity-20 deco-grid" style={{ filter: 'invert(1)' }} />
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-purple-500/15 blur-3xl" />
          <div className="absolute -left-20 -bottom-20 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative grid gap-8 p-8 md:grid-cols-[1fr_auto] md:items-center md:p-12">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-purple-300 backdrop-blur-sm">
                <Bot className="h-3.5 w-3.5" />
                Inteligência Artificial
              </div>
              <h2 className="max-w-xl text-3xl leading-tight text-white md:text-4xl" style={{ fontFamily: 'var(--font-serif)' }}>
                <span className="gradient-text-ai">IA Legislativa</span> — O futuro da criação de leis
              </h2>
              <p className="max-w-xl text-base leading-7 text-slate-400">
                Em breve, nosso assistente de IA será capaz de analisar legislação existente, sugerir redações
                para novas normas, identificar conflitos legais automaticamente e auxiliar na consolidação de textos —
                tudo com supervisão humana garantida.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/20">
                    <Zap className="h-4 w-4 text-purple-400" />
                  </div>
                  Geração assistida
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/20">
                    <Search className="h-4 w-4 text-cyan-400" />
                  </div>
                  Análise de conflitos
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20">
                    <FileStack className="h-4 w-4 text-amber-400" />
                  </div>
                  Consolidação automática
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-500/30 to-cyan-500/20 backdrop-blur-sm animate-float">
                <Bot className="h-12 w-12 text-purple-300" />
              </div>
              <Button variant="glow" size="lg" className="bg-purple-600 hover:bg-purple-500 animate-pulse-glow" style={{ '--glow-primary': 'rgba(139, 92, 246, 0.4)' } as React.CSSProperties}>
                <Sparkles className="h-4 w-4" />
                Em breve
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          SECTION 5 — Most accessed + Recent
       ════════════════════════════════════════════════════════════ */}
      <section className="page-shell mt-16 grid gap-8 xl:grid-cols-2">
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--tenant-secondary)] to-white shadow-sm">
              <FileStack className="h-5 w-5 text-[var(--tenant-primary)]" />
            </div>
            <div>
              <p className="section-eyebrow">Mais acessadas</p>
              <h2 className="text-2xl md:text-3xl">Normas consultadas com frequência</h2>
            </div>
          </div>
          <div className="grid gap-5">
            {mostAccessed.map((norm) => (
              <NormCard key={norm.id} tenantSlug={bundle.tenant.slug} norm={norm} />
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--tenant-secondary)] to-white shadow-sm">
              <Building2 className="h-5 w-5 text-[var(--tenant-primary)]" />
            </div>
            <div>
              <p className="section-eyebrow">Recentes</p>
              <h2 className="text-2xl md:text-3xl">Últimas atualizações do acervo</h2>
            </div>
          </div>
          <div className="grid gap-5">
            {recent.map((norm) => (
              <NormCard key={norm.id} tenantSlug={bundle.tenant.slug} norm={norm} />
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          SECTION 6 — CTA
       ════════════════════════════════════════════════════════════ */}
      <section className="page-shell mt-16">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-[var(--tenant-primary)] via-[#138a9f] to-[var(--tenant-primary)] bg-[length:200%_100%] animate-gradient text-white">
          <div className="absolute inset-0 opacity-10 deco-grid" style={{ filter: 'invert(1)' }} />
          <div className="relative grid gap-8 p-8 md:grid-cols-[1fr_auto] md:items-center md:p-12">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">Pesquisa orientada</p>
              <h2 className="max-w-xl text-3xl text-white md:text-4xl" style={{ fontFamily: 'var(--font-serif)' }}>
                Precisa de ajuda para encontrar uma norma específica?
              </h2>
              <p className="max-w-2xl text-white/75">
                A busca avançada combina número, ano, tipo, classificação, autoria, iniciativa, situação e intervalo
                de datas. O objetivo é reduzir tentativas frustradas e tornar o portal compreensível.
              </p>
            </div>
            <Button asChild variant="accent" size="lg" className="shadow-lg">
              <Link href={`/${bundle.tenant.slug}/busca`}>
                <Search className="h-4 w-4" />
                Abrir busca guiada
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
