import Link from "next/link";
import { Download, ExternalLink, Printer, Share2 } from "lucide-react";
import { notFound } from "next/navigation";

import { FavoriteButton } from "@/components/norms/favorite-button";
import { NormTextTabs } from "@/components/norms/norm-text-tabs";
import { StatusBadge } from "@/components/norms/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";
import {
  extractArticleIndex,
  getCurrentNormText,
  getLatestPreviousNormText,
  getNormById,
  getNormChangeEvents,
  getNormRelatedItems,
  getNormTextVersions,
  getOriginalNormText
} from "@/server/norms/norm-service";
import { getTenantBundleBySlug } from "@/server/tenants/tenant-service";

export default async function NormDetailPage({
  params
}: {
  params: Promise<{ tenant: string; id: string }>;
}) {
  const { tenant: tenantSlug, id } = await params;
  const bundle = await getTenantBundleBySlug(tenantSlug);

  if (!bundle) {
    notFound();
  }

  const norm = await getNormById(bundle.tenant.slug, id);

  if (!norm) {
    notFound();
  }

  const relatedNorms = await getNormRelatedItems(bundle.tenant.slug, norm.id);
  const currentText = getCurrentNormText(norm);
  const originalText = getOriginalNormText(norm);
  const previousText = getLatestPreviousNormText(norm);
  const textVersions = getNormTextVersions(norm);
  const changeEvents = getNormChangeEvents(norm);
  const articleIndex = extractArticleIndex(currentText);
  const normById = new Map(bundle.norms.map((item) => [item.id, item]));

  return (
    <main className="page-shell py-10">
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="space-y-5 bg-[var(--tenant-muted)]">
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={norm.status} />
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                  {norm.classification}
                </span>
              </div>
              <div className="space-y-3">
                <CardDescription className="text-xs uppercase tracking-[0.18em] text-[var(--tenant-primary)]">
                  {norm.typeLabel} {norm.number}/{norm.year}
                </CardDescription>
                <CardTitle className="text-5xl leading-tight">{norm.title}</CardTitle>
                <CardDescription className="max-w-3xl text-base leading-7 text-slate-600">{norm.summary}</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild>
                  <a href={norm.pdfUrl} target="_blank" rel="noreferrer">
                    <Download className="h-4 w-4" />
                    Baixar PDF
                  </a>
                </Button>
                <Button asChild variant="outline">
                  <a href={norm.sourceUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    Fonte oficial
                  </a>
                </Button>
                <Button variant="ghost">
                  <Printer className="h-4 w-4" />
                  Imprimir
                </Button>
                <Button variant="ghost" asChild>
                  <Link href={`/${bundle.tenant.slug}/resultados?query=${encodeURIComponent(norm.fullCode)}`}>
                    <Share2 className="h-4 w-4" />
                    Compartilhar
                  </Link>
                </Button>
                <FavoriteButton tenantSlug={bundle.tenant.slug} normId={norm.id} />
              </div>
            </CardHeader>
            <CardContent className="space-y-8 p-6 md:p-8">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Publicacao</p>
                  <p className="mt-2 text-sm text-slate-800">{formatDate(norm.publicationDate)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Vigencia</p>
                  <p className="mt-2 text-sm text-slate-800">{formatDate(norm.effectiveDate)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Autoria</p>
                  <p className="mt-2 text-sm text-slate-800">{norm.authorship}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Iniciativa</p>
                  <p className="mt-2 text-sm text-slate-800">{norm.initiative}</p>
                </div>
              </div>

              <Card className="border-slate-200 bg-[var(--tenant-muted)] shadow-none">
                <CardHeader>
                  <CardTitle className="text-2xl">Entenda esta norma</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-7 text-[var(--tenant-foreground)]">{norm.plainLanguageSummary}</p>
                </CardContent>
              </Card>

              <NormTextTabs
                currentText={currentText}
                originalText={originalText}
                changeEvents={changeEvents.map((e) => ({
                  id: e.id,
                  kind: e.kind,
                  target: e.target,
                  summary: e.summary,
                  effectiveDate: e.effectiveDate,
                  beforeText: e.beforeText,
                  afterText: e.afterText,
                  notes: e.notes,
                  sourceNormId: e.sourceNormId,
                  sourceNormCode: e.sourceNormId
                    ? normById.get(e.sourceNormId)?.fullCode
                    : undefined
                }))}
                articleIndex={articleIndex}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Versoes registradas</CardTitle>
              <CardDescription>Original, intermedias e consolidada vigente.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {textVersions.length === 0 ? <p className="text-sm text-slate-600">Nenhuma versao adicional cadastrada.</p> : null}
              {textVersions.map((version) => {
                const sourceNorm = version.sourceNormId ? normById.get(version.sourceNormId) : null;

                return (
                  <div key={version.id} className="rounded-3xl border border-slate-200 px-4 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                        {version.kind}
                      </span>
                      {version.isCurrent ? (
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                          Atual
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-3 font-semibold text-slate-900">{version.label}</p>
                    <p className="mt-1 text-sm text-slate-600">{version.summary}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                      Desde {formatDate(version.validFrom)}
                      {version.validTo ? ` ate ${formatDate(version.validTo)}` : ""}
                    </p>
                    {sourceNorm ? (
                      <Link href={`/${bundle.tenant.slug}/normas/${sourceNorm.id}`} className="mt-3 inline-block text-sm font-semibold text-[var(--tenant-primary)]">
                        {sourceNorm.fullCode}
                      </Link>
                    ) : null}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Indice por artigos</CardTitle>
              <CardDescription>Navegue diretamente pelo texto.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {articleIndex.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="block rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:border-[var(--tenant-primary)]"
                >
                  {item.label}
                </a>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Historico de alteracoes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {changeEvents.length > 0 ? (
                <div className="rounded-3xl bg-[var(--tenant-muted)] px-4 py-4 text-sm leading-6 text-[var(--tenant-foreground)]">
                  Cada alteracao relevante foi registrada com data, norma alteradora e, quando aplicavel, texto antes e depois.
                </div>
              ) : null}
              {norm.changeHistory.map((entry) => (
                <div key={entry} className="rounded-3xl bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
                  {entry}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Normas relacionadas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {relatedNorms.length === 0 ? <p className="text-sm text-slate-600">Nao ha relacoes cadastradas.</p> : null}
              {relatedNorms.map((related) => (
                <Link
                  key={related.id}
                  href={`/${bundle.tenant.slug}/normas/${related.id}`}
                  className="block rounded-3xl border border-slate-200 px-4 py-4 hover:border-[var(--tenant-primary)]"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{related.fullCode}</p>
                  <p className="mt-2 font-semibold text-slate-900">{related.title}</p>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Anexos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {norm.attachments.map((attachment) => (
                <a
                  key={attachment.id}
                  href={attachment.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-3xl border border-slate-200 px-4 py-4 text-sm font-medium text-slate-700 hover:border-[var(--tenant-primary)]"
                >
                  {attachment.title}
                </a>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Metadados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <p>
                <strong>Assunto:</strong> {norm.subject}
              </p>
              <Separator />
              <p>
                <strong>Classificacao:</strong> {norm.classification}
              </p>
              <Separator />
              <p>
                <strong>Acessos:</strong> {norm.accessCount}
              </p>
              <Separator />
              <p>
                <strong>Atualizado em:</strong> {formatDate(norm.updatedAt)}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
