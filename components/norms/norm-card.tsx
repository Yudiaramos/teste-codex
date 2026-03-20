import Link from "next/link";
import { Download, ExternalLink, Eye, Share2 } from "lucide-react";

import { FavoriteButton } from "@/components/norms/favorite-button";
import { StatusBadge } from "@/components/norms/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCompactDate } from "@/lib/utils";
import { type NormRecord } from "@/types/domain";

export function NormCard({
  tenantSlug,
  norm
}: {
  tenantSlug: string;
  norm: NormRecord;
}) {
  return (
    <Card className="card-hover group h-full norm-border-left border-slate-200/80 animate-fade-in-up">
      <CardHeader className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={norm.status} />
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-slate-50 to-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 ring-1 ring-slate-200/60">
            {norm.classification}
          </span>
        </div>
        <div className="space-y-2">
          <CardDescription className="text-xs uppercase tracking-[0.18em] text-slate-400">
            {norm.typeLabel} {norm.number}/{norm.year} • {formatCompactDate(norm.publicationDate)}
          </CardDescription>
          <CardTitle className="text-xl leading-tight transition-colors group-hover:text-[var(--tenant-primary)]">
            {norm.title}
          </CardTitle>
          <CardDescription className="line-clamp-2 text-sm leading-6 text-slate-600">
            {norm.summary}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {norm.plainLanguageSummary ? (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--tenant-muted)] to-white p-4">
            <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-[var(--tenant-primary)] to-[var(--tenant-accent)]" />
            <span className="ml-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--tenant-primary)]">
              Entenda esta norma
            </span>
            <p className="ml-2 mt-1.5 text-sm leading-6 text-[var(--tenant-foreground)]">
              {norm.plainLanguageSummary}
            </p>
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link href={`/${tenantSlug}/normas/${norm.id}`}>
              <Eye className="h-3.5 w-3.5" />
              Ver detalhes
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href={norm.pdfUrl} target="_blank" rel="noreferrer">
              <Download className="h-3.5 w-3.5" />
              PDF
            </a>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <a href={norm.sourceUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="h-3.5 w-3.5" />
              Fonte
            </a>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href={`/${tenantSlug}/resultados?query=${encodeURIComponent(norm.title)}`}>
              <Share2 className="h-3.5 w-3.5" />
              Relacionadas
            </Link>
          </Button>
          <FavoriteButton tenantSlug={tenantSlug} normId={norm.id} />
        </div>
      </CardContent>
    </Card>
  );
}
