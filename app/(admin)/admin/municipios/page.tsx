"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Building2,
  Palette,
  Plus,
  Loader2,
  ExternalLink,
  Image as ImageIcon
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type TenantSummary = {
  id: string;
  slug: string;
  name: string;
  stateCode: string;
  branding: {
    logoUrl: string;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
  };
};

export default function MunicipiosPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<TenantSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    stateCode: "",
    primaryColor: "#0B6E4F",
    secondaryColor: "#E8F5E9",
    accentColor: "#FFB300",
    logoUrl: ""
  });

  async function loadTenants() {
    try {
      const res = await fetch("/api/tenants");
      const data = await res.json();
      setTenants(data.items ?? []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTenants();
  }, []);

  function handleNameChange(value: string) {
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    const slug = form.stateCode
      ? `${form.slug}-${form.stateCode.toLowerCase()}`
      : form.slug;

    try {
      const res = await fetch("/api/admin/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          slug,
          logoUrl: form.logoUrl || undefined
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erro ao criar município.");
      }

      setSuccess(`Município "${form.name}" criado com sucesso!`);
      setForm({
        name: "",
        slug: "",
        stateCode: "",
        primaryColor: "#0B6E4F",
        secondaryColor: "#E8F5E9",
        accentColor: "#FFB300",
        logoUrl: ""
      });
      setShowForm(false);
      await loadTenants();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page-shell py-10">
      {/* Header */}
      <section className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin">
                <ArrowLeft className="h-4 w-4" />
                Voltar ao painel
              </Link>
            </Button>
          </div>
          <span className="section-eyebrow">Gestão de Municípios</span>
          <h1 className="text-5xl">Municípios cadastrados</h1>
          <p className="max-w-2xl text-lg text-slate-600">
            Gerencie os municípios (tenants) da plataforma. Cada município possui sua própria identidade visual, cores
            e portal público.
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="lg" className="shrink-0">
          <Plus className="h-4 w-4" />
          Novo Município
        </Button>
      </section>

      {/* Success / Error messages */}
      {success && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <Card className="mb-8 animate-fade-in-up">
          <CardHeader>
            <CardTitle className="text-2xl">Criar novo município</CardTitle>
            <CardDescription>
              Preencha os dados abaixo. O slug será gerado automaticamente a partir do nome.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-6 md:grid-cols-2" onSubmit={handleSubmit}>
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  <Building2 className="inline h-3.5 w-3.5 mr-1" />
                  Nome do Município
                </Label>
                <Input
                  id="name"
                  placeholder="Ex: Santos"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                />
              </div>

              {/* State code */}
              <div className="space-y-2">
                <Label htmlFor="stateCode">UF (Estado)</Label>
                <Input
                  id="stateCode"
                  placeholder="Ex: SP"
                  maxLength={2}
                  value={form.stateCode}
                  onChange={(e) => setForm((p) => ({ ...p, stateCode: e.target.value.toUpperCase() }))}
                  required
                />
              </div>

              {/* Slug (read-only, auto-generated) */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input
                  id="slug"
                  value={form.stateCode ? `${form.slug}-${form.stateCode.toLowerCase()}` : form.slug}
                  readOnly
                  className="bg-slate-50 text-slate-500"
                />
                <p className="text-xs text-slate-500">
                  O portal ficará acessível em: /{form.stateCode ? `${form.slug}-${form.stateCode.toLowerCase()}` : form.slug || "..."}
                </p>
              </div>

              {/* Logo URL */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="logoUrl">
                  <ImageIcon className="inline h-3.5 w-3.5 mr-1" />
                  URL do Logo (opcional)
                </Label>
                <Input
                  id="logoUrl"
                  type="url"
                  placeholder="https://exemplo.com/logo.svg"
                  value={form.logoUrl}
                  onChange={(e) => setForm((p) => ({ ...p, logoUrl: e.target.value }))}
                />
              </div>

              {/* Colors */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-2 mb-3">
                  <Palette className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-semibold text-slate-700">Cores do tema</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Cor Primária</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        id="primaryColor"
                        value={form.primaryColor}
                        onChange={(e) => setForm((p) => ({ ...p, primaryColor: e.target.value }))}
                        className="h-10 w-12 cursor-pointer rounded-lg border border-slate-200"
                      />
                      <Input
                        value={form.primaryColor}
                        onChange={(e) => setForm((p) => ({ ...p, primaryColor: e.target.value }))}
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Cor Secundária</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        id="secondaryColor"
                        value={form.secondaryColor}
                        onChange={(e) => setForm((p) => ({ ...p, secondaryColor: e.target.value }))}
                        className="h-10 w-12 cursor-pointer rounded-lg border border-slate-200"
                      />
                      <Input
                        value={form.secondaryColor}
                        onChange={(e) => setForm((p) => ({ ...p, secondaryColor: e.target.value }))}
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accentColor">Cor de Destaque</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        id="accentColor"
                        value={form.accentColor}
                        onChange={(e) => setForm((p) => ({ ...p, accentColor: e.target.value }))}
                        className="h-10 w-12 cursor-pointer rounded-lg border border-slate-200"
                      />
                      <Input
                        value={form.accentColor}
                        onChange={(e) => setForm((p) => ({ ...p, accentColor: e.target.value }))}
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview swatch */}
              <div className="md:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Preview</p>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl shadow-sm" style={{ background: form.primaryColor }} title="Primária" />
                  <div className="h-12 w-12 rounded-xl shadow-sm" style={{ background: form.secondaryColor }} title="Secundária" />
                  <div className="h-12 w-12 rounded-xl shadow-sm" style={{ background: form.accentColor }} title="Destaque" />
                  <span className="text-sm text-slate-500 ml-2">
                    {form.name || "Município"}-{form.stateCode || "UF"}
                  </span>
                </div>
              </div>

              {/* Submit */}
              <div className="md:col-span-2 flex gap-3">
                <Button type="submit" size="lg" disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  {submitting ? "Criando..." : "Criar Município"}
                </Button>
                <Button type="button" variant="outline" size="lg" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Existing tenants grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : tenants.length === 0 ? (
        <Card className="py-16 text-center">
          <CardContent>
            <Building2 className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-4 text-lg font-semibold text-slate-600">Nenhum município cadastrado</p>
            <p className="mt-1 text-sm text-slate-500">Clique em &quot;Novo Município&quot; para começar.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tenants.map((tenant) => (
            <Card key={tenant.id} className="card-hover group">
              <CardHeader>
                <div className="flex items-center gap-3">
                  {/* Color swatch */}
                  <div className="flex gap-1">
                    <div className="h-8 w-8 rounded-lg shadow-sm" style={{ background: tenant.branding?.colors?.primary || "#0B6E4F" }} />
                    <div className="h-8 w-3 rounded-md" style={{ background: tenant.branding?.colors?.accent || "#FFB300" }} />
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      {tenant.name}-{tenant.stateCode}
                    </CardTitle>
                    <CardDescription className="text-xs">/{tenant.slug}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button asChild variant="outline" size="sm" className="group/btn">
                  <Link href={`/${tenant.slug}`}>
                    <ExternalLink className="h-3.5 w-3.5" />
                    Portal público
                  </Link>
                </Button>
                <Button asChild size="sm">
                  <Link href={`/admin/${tenant.slug}/editor`}>
                    Editar
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
