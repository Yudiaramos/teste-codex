import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Building2,
  ChevronRight,
  LayoutDashboard,
  LogIn,
  Search,
  Sparkles
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { type TenantRecord } from "@/types/domain";

export function TenantShell({
  tenant,
  children
}: {
  tenant: TenantRecord;
  children: React.ReactNode;
}) {
  const themeStyle = {
    "--tenant-primary": tenant.branding.colors.primary,
    "--tenant-secondary": tenant.branding.colors.secondary,
    "--tenant-accent": tenant.branding.colors.accent,
    "--tenant-muted": tenant.branding.colors.muted,
    "--tenant-surface": tenant.branding.colors.surface,
    "--tenant-foreground": tenant.branding.colors.foreground
  } as React.CSSProperties;

  return (
    <div style={themeStyle} className="min-h-screen">
      {/* ── Accessibility bar ── */}
      <div className="border-b border-slate-200/50 bg-slate-950 text-xs text-slate-300">
        <div className="page-shell flex items-center justify-between py-1.5">
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline">Acessibilidade:</span>
            <button className="hover:text-white transition-colors" title="Aumentar fonte">A+</button>
            <button className="hover:text-white transition-colors" title="Diminuir fonte">A-</button>
            <button className="hover:text-white transition-colors" title="Alto contraste">◐</button>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/${tenant.slug}`} className="hover:text-white transition-colors flex items-center gap-1">
              <LogIn className="h-3 w-3" />
              Entrar
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main header ── */}
      <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
        <div className="page-shell flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
          <Link href={`/${tenant.slug}`} className="group flex items-center gap-4">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--tenant-secondary)] transition-transform duration-300 group-hover:scale-105">
              <Image
                src={tenant.branding.crestUrl}
                alt={`Brasão de ${tenant.name}`}
                width={42}
                height={42}
                className="h-10 w-10 object-contain"
              />
              <div className="absolute inset-0 rounded-2xl ring-2 ring-[var(--tenant-primary)]/10" />
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--tenant-primary)]">
                <Sparkles className="h-3 w-3" />
                Legislação Digital
              </p>
              <h1 className="font-sans text-xl font-extrabold text-slate-950">
                {tenant.name}-{tenant.stateCode}
              </h1>
            </div>
          </Link>

          <nav className="flex flex-wrap items-center gap-1.5 text-sm">
            <Button asChild variant="ghost" size="sm">
              <Link href={`/${tenant.slug}`}>
                <Building2 className="h-4 w-4" />
                Início
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href={`/${tenant.slug}/busca`}>
                <Search className="h-4 w-4" />
                Busca
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href={`/${tenant.slug}/resultados`}>
                <BookOpen className="h-4 w-4" />
                Normas
              </Link>
            </Button>
            <div className="mx-1 h-6 w-px bg-slate-200" />
            <Button asChild variant="outline" size="sm">
              <Link href="/admin">
                <LayoutDashboard className="h-4 w-4" />
                Admin
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* ── Content ── */}
      {children}

      {/* ── Footer ── */}
      <footer className="relative mt-20 overflow-hidden border-t border-slate-800 bg-slate-950 text-white">
        {/* Decorative mesh */}
        <div className="absolute inset-0 opacity-30 deco-grid" style={{ backgroundSize: '64px 64px', filter: 'invert(1)' }} />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--tenant-accent)] to-transparent" />

        <div className="relative page-shell grid gap-10 py-14 md:grid-cols-3">
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <Image
                  src={tenant.branding.crestUrl}
                  alt={`Brasão de ${tenant.name}`}
                  width={36}
                  height={36}
                  className="h-8 w-8 object-contain brightness-0 invert"
                />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-300">
                  Legislação Digital
                </p>
                <p className="font-sans text-lg font-bold">
                  {tenant.name}-{tenant.stateCode}
                </p>
              </div>
            </div>
            <p className="max-w-sm text-sm leading-6 text-slate-400">
              {tenant.profile.institutionalText}
            </p>
          </div>

          {/* Column 2: Quick links */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Acesso Rápido
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: "Página Inicial", href: `/${tenant.slug}` },
                { label: "Busca Avançada", href: `/${tenant.slug}/busca` },
                { label: "Normas Favoritas", href: `/${tenant.slug}` },
                { label: "Índice Cronológico", href: `/${tenant.slug}/resultados?sort=recent` }
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-2 text-sm text-slate-300 transition-colors hover:text-white"
                  >
                    <ChevronRight className="h-3 w-3 text-amber-400 transition-transform group-hover:translate-x-0.5" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Notices */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Institucional
            </h3>
            <div className="space-y-3 text-sm text-slate-400">
              {tenant.profile.notices.map((notice) => (
                <p key={notice}>{notice}</p>
              ))}
            </div>
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-xs text-slate-400">
                <Sparkles className="h-3 w-3 text-amber-400" />
                Preparado para IA Legislativa
              </div>
            </div>
          </div>
        </div>

        {/* Copyright bar */}
        <div className="relative border-t border-white/5">
          <div className="page-shell flex flex-col items-center justify-between gap-2 py-5 text-xs text-slate-500 sm:flex-row">
            <p>© {new Date().getFullYear()} Legislação Digital — Todos os direitos reservados</p>
            <p className="flex items-center gap-1">
              Desenvolvido com
              <span className="text-red-400">♥</span>
              para a democracia
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
