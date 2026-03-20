"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Check,
  Eye,
  Image as ImageIcon,
  Loader2,
  Palette,
  RotateCcw
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type TenantData = {
  id: string;
  slug: string;
  name: string;
  stateCode: string;
  branding: {
    logoUrl: string;
    crestUrl: string;
    heroImageUrl: string;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      muted: string;
      surface: string;
      foreground: string;
    };
  };
};

function ColorField({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-12 cursor-pointer rounded-lg border border-slate-200"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono text-sm"
        />
      </div>
    </div>
  );
}

export default function PersonalizadorPage({ params }: { params: { tenant: string } }) {
  const tenantSlug = params.tenant;
  const router = useRouter();
  const [tenant, setTenant] = useState<TenantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Editable state
  const [colors, setColors] = useState({
    primary: "#0B6E4F",
    secondary: "#E8F5E9",
    accent: "#FFB300",
    muted: "#F5F7FA",
    surface: "#FFFFFF",
    foreground: "#162436"
  });
  const [logoUrl, setLogoUrl] = useState("");
  const [crestUrl, setCrestUrl] = useState("");
  const [heroImageUrl, setHeroImageUrl] = useState("");

  useEffect(() => {
    fetch(`/api/tenants/${tenantSlug}`)
      .then((res) => res.json())
      .then((data) => {
        const t = data.tenant;
        if (t) {
          setTenant(t);
          setColors(t.branding.colors);
          setLogoUrl(t.branding.logoUrl);
          setCrestUrl(t.branding.crestUrl);
          setHeroImageUrl(t.branding.heroImageUrl);
        }
      })
      .catch(() => setError("Falha ao carregar dados do município."))
      .finally(() => setLoading(false));
  }, [tenantSlug]);

  function resetToOriginal() {
    if (!tenant) return;
    setColors(tenant.branding.colors);
    setLogoUrl(tenant.branding.logoUrl);
    setCrestUrl(tenant.branding.crestUrl);
    setHeroImageUrl(tenant.branding.heroImageUrl);
    setSuccess(null);
    setError(null);
  }

  async function handleSave() {
    if (!tenant) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/admin/tenants/${tenant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branding: {
            logoUrl,
            crestUrl,
            heroImageUrl,
            colors
          }
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erro ao salvar.");
      }

      const updated = await res.json();
      setTenant(updated);
      setSuccess("Personalização salva com sucesso! Atualize a página do portal para ver as mudanças.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="page-shell py-10 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </main>
    );
  }

  if (!tenant) {
    return (
      <main className="page-shell py-10">
        <p className="text-slate-600">Município não encontrado.</p>
      </main>
    );
  }

  return (
    <main className="page-shell py-10">
      {/* Header */}
      <section className="mb-8 space-y-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao painel
          </Link>
        </Button>
        <span className="section-eyebrow">Personalizador</span>
        <h1 className="text-5xl">
          {tenant.name}-{tenant.stateCode}
        </h1>
        <p className="max-w-2xl text-lg text-slate-600">
          Altere as cores, logos e identidade visual do portal público deste município.
        </p>
      </section>

      {/* Messages */}
      {success && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 flex items-center gap-2">
          <Check className="h-4 w-4" />
          {success}
        </div>
      )}
      {error && (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      )}

      <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
        {/* Left: Edit form */}
        <div className="space-y-6">
          {/* Colors */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-slate-600" />
                <CardTitle className="text-2xl">Cores do Tema</CardTitle>
              </div>
              <CardDescription>
                Estas cores são aplicadas em todo o portal público do município.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <ColorField
                  label="Cor Primária"
                  value={colors.primary}
                  onChange={(v) => setColors((c) => ({ ...c, primary: v }))}
                />
                <ColorField
                  label="Cor Secundária"
                  value={colors.secondary}
                  onChange={(v) => setColors((c) => ({ ...c, secondary: v }))}
                />
                <ColorField
                  label="Cor de Destaque (Accent)"
                  value={colors.accent}
                  onChange={(v) => setColors((c) => ({ ...c, accent: v }))}
                />
                <ColorField
                  label="Fundo Suave (Muted)"
                  value={colors.muted}
                  onChange={(v) => setColors((c) => ({ ...c, muted: v }))}
                />
                <ColorField
                  label="Superfície (Surface)"
                  value={colors.surface}
                  onChange={(v) => setColors((c) => ({ ...c, surface: v }))}
                />
                <ColorField
                  label="Texto (Foreground)"
                  value={colors.foreground}
                  onChange={(v) => setColors((c) => ({ ...c, foreground: v }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-slate-600" />
                <CardTitle className="text-2xl">Imagens e Logos</CardTitle>
              </div>
              <CardDescription>
                URLs das imagens de identidade visual do município.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo do município</Label>
                <Input
                  id="logoUrl"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="crestUrl">Brasão do município</Label>
                <Input
                  id="crestUrl"
                  value={crestUrl}
                  onChange={(e) => setCrestUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heroImageUrl">Imagem hero (banner principal)</Label>
                <Input
                  id="heroImageUrl"
                  value={heroImageUrl}
                  onChange={(e) => setHeroImageUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button size="lg" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {saving ? "Salvando..." : "Salvar Personalização"}
            </Button>
            <Button variant="outline" size="lg" onClick={resetToOriginal}>
              <RotateCcw className="h-4 w-4" />
              Restaurar Original
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={`/${tenantSlug}`} target="_blank">
                <Eye className="h-4 w-4" />
                Ver Portal
              </Link>
            </Button>
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Preview ao vivo
          </h3>

          {/* Mini portal preview */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-lg">
            {/* Mini header */}
            <div style={{ background: colors.surface, borderBottom: `2px solid ${colors.primary}` }} className="p-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg" style={{ background: colors.secondary }}>
                  {logoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoUrl} alt="" className="h-8 w-8 object-contain rounded-lg" />
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.primary }}>
                    Legislação Digital
                  </p>
                  <p className="text-sm font-bold" style={{ color: colors.foreground }}>
                    {tenant.name}-{tenant.stateCode}
                  </p>
                </div>
              </div>
            </div>

            {/* Mini hero */}
            <div style={{ background: `linear-gradient(135deg, ${colors.primary}15, ${colors.accent}10)` }} className="p-6">
              <div className="space-y-2">
                <div
                  className="inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
                  style={{ background: `${colors.secondary}90`, color: colors.primary }}
                >
                  Portal oficial
                </div>
                <p className="text-lg font-bold" style={{ color: colors.foreground }}>
                  Legislação de {tenant.name}
                </p>
                <p className="text-xs" style={{ color: `${colors.foreground}99` }}>
                  Portal com busca, normas e gestão legislativa.
                </p>
              </div>
            </div>

            {/* Mini cards */}
            <div className="p-4 space-y-2" style={{ background: colors.muted }}>
              {["Busca inteligente", "Normas em destaque", "Temas populares"].map((title) => (
                <div
                  key={title}
                  className="rounded-xl p-3"
                  style={{ background: colors.surface, border: `1px solid ${colors.primary}15` }}
                >
                  <p className="text-xs font-semibold" style={{ color: colors.foreground }}>{title}</p>
                  <div className="mt-1 h-1.5 w-16 rounded-full" style={{ background: colors.accent }} />
                </div>
              ))}
            </div>

            {/* Mini footer */}
            <div className="p-3 text-center" style={{ background: colors.foreground }}>
              <p className="text-[10px]" style={{ color: `${colors.surface}88` }}>
                © {new Date().getFullYear()} Legislação Digital
              </p>
            </div>
          </div>

          {/* Color swatches */}
          <div className="rounded-2xl border border-slate-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Paleta de cores</p>
            <div className="grid grid-cols-6 gap-2">
              {Object.entries(colors).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className="h-10 w-full rounded-lg shadow-sm border border-slate-100" style={{ background: value }} />
                  <p className="mt-1 text-[10px] text-slate-500 truncate">{key}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
