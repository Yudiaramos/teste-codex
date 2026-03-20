import Link from "next/link";
import { ArrowRight, Bot, Building2, LogIn, Search, Shield, Sparkles, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenants } from "@/server/tenants/tenant-service";



const capabilities = [
  {
    icon: Search,
    title: "Busca inteligente",
    description: "Busca simples, avançada e por tenant com arquitetura trocável para outros motores."
  },
  {
    icon: Shield,
    title: "Painel administrativo",
    description: "Controle por papel, destaque de normas, métricas básicas e auditoria."
  },
  {
    icon: Building2,
    title: "Multi-tenant",
    description: "Branding, home e módulos configuráveis para diferentes cidades sem duplicar código."
  },
  {
    icon: Bot,
    title: "IA Legislativa",
    description: "Em breve: geração assistida, análise de conflitos e consolidação automática."
  }
];

export default async function IndexPage() {
  const tenants = await getTenants();

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 mesh-gradient" />
        <div className="absolute inset-0 deco-grid opacity-30" />
        <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-cyan-500/5 blur-3xl" />

        <div className="relative page-shell py-16 md:py-24">
          <div className="mx-auto max-w-4xl text-center space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100/80 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.22em] text-slate-600 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Plataforma multi-tenant / white-label
            </div>

            <h1 className="text-5xl leading-tight md:text-6xl lg:text-7xl">
              Legislação municipal com experiência{" "}
              <span className="gradient-text">clara e confiável</span>
            </h1>

            <p className="mx-auto max-w-2xl text-lg text-slate-600 leading-relaxed">
              Um portal full-stack projetado para múltiplas cidades com branding próprio, busca avançada, área
              administrativa e arquitetura preparada para produção.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              {tenants.slice(0, 2).map((t, i) => (
                <Button key={t.slug} asChild size="lg" variant={i === 0 ? "default" : "outline"} className="h-14 px-8 text-base">
                  <Link href={`/${t.slug}`}>
                    {i === 0 ? <Shield className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
                    Explorar {t.name}-{t.stateCode}
                    {i === 0 && <ArrowRight className="h-4 w-4" />}
                  </Link>
                </Button>
              ))}
              <Button asChild variant="outline" size="lg" className="h-14 px-8 text-base border-slate-300 hover:border-slate-400">
                <Link href="/admin/login">
                  <LogIn className="h-4 w-4" />
                  Entrar
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="page-shell -mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {capabilities.map((cap, index) => (
          <Card key={cap.title} className={`card-hover animate-fade-in-up delay-${(index + 1) * 100}`}>
            <CardHeader>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-white shadow-sm ring-1 ring-slate-200/60">
                <cap.icon className="h-5 w-5 text-slate-700" />
              </div>
              <CardTitle className="text-lg">{cap.title}</CardTitle>
              <CardDescription>{cap.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      {/* Tenant showcase */}
      <section className="page-shell mt-16 grid gap-6 md:grid-cols-2">
        {tenants.map((tenant) => (
          <Card key={tenant.slug} className="card-hover overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-white ring-1 ring-slate-200/60">
                  <Building2 className="h-5 w-5 text-slate-700" />
                </div>
                <CardTitle className="text-2xl">
                  {tenant.name}-{tenant.stateCode}
                </CardTitle>
              </div>
              <CardDescription className="mt-2">
                Portal de legislação municipal de {tenant.name}-{tenant.stateCode}.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4">
              <p className="max-w-md text-sm text-slate-500">
                Acesse a experiência multi-tenant em modo público e valide a diferença de branding entre municípios.
              </p>
              <Button asChild variant="outline" className="group shrink-0">
                <Link href={`/${tenant.slug}`}>
                  Abrir portal
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* AI teaser */}
      <section className="page-shell mt-16 mb-16">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-purple-950/90 to-slate-950">
          <div className="absolute inset-0 opacity-15 deco-grid" style={{ filter: 'invert(1)' }} />
          <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-purple-500/15 blur-3xl" />

          <div className="relative grid gap-8 p-8 md:grid-cols-[1fr_auto] md:items-center md:p-12">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-purple-300">
                <Bot className="h-3.5 w-3.5" />
                Novidade em desenvolvimento
              </div>
              <h2 className="text-3xl text-white md:text-4xl" style={{ fontFamily: 'var(--font-serif)' }}>
                <span className="gradient-text-ai">IA Legislativa</span> — em breve disponível
              </h2>
              <p className="max-w-xl text-slate-400 leading-7">
                Geração assistida de redações, análise automática de conflitos legais e consolidação de textos.
                Tudo com supervisão humana e rastreabilidade completa.
              </p>
            </div>
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-purple-500/20 animate-float">
              <Zap className="h-10 w-10 text-purple-400" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
