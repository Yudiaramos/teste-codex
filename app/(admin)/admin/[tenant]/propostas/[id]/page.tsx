import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { ReviewActions } from "@/components/editorial/review-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { getProposalById } from "@/server/editorial/editorial-service";
import { getNormById } from "@/server/norms/norm-service";
import { getTenantBundleBySlug } from "@/server/tenants/tenant-service";

const statusLabels: Record<string, { label: string; color: string }> = {
  draft: { label: "Rascunho", color: "bg-slate-100 text-slate-700" },
  pending_review: { label: "Aguardando revisão", color: "bg-amber-100 text-amber-800" },
  approved: { label: "Aprovada", color: "bg-blue-100 text-blue-800" },
  rejected: { label: "Rejeitada", color: "bg-rose-100 text-rose-800" },
  published: { label: "Publicada", color: "bg-emerald-100 text-emerald-800" }
};

export default async function ProposalDetailPage({
  params
}: {
  params: Promise<{ tenant: string; id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const { tenant, id } = await params;

  if (session.user.role !== "GLOBAL_ADMIN" && session.user.tenantSlug !== tenant) {
    redirect("/admin");
  }

  const proposal = await getProposalById(id);
  if (!proposal) notFound();

  const bundle = await getTenantBundleBySlug(tenant);
  const norm = bundle ? bundle.norms.find((n) => n.id === proposal.normId) : null;
  const info = statusLabels[proposal.status] ?? { label: proposal.status, color: "bg-slate-100 text-slate-700" };

  return (
    <main className="page-shell py-10">
      <Link href={`/admin/${tenant}/propostas`} className="text-sm font-semibold text-[var(--tenant-primary)] hover:underline">
        ← Voltar para propostas
      </Link>

      <section className="mt-6 mb-8 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${info.color}`}>
            {info.label}
          </span>
          <span className="text-xs text-slate-500">{formatDate(proposal.updatedAt)}</span>
        </div>
        <h1 className="text-5xl">{proposal.title}</h1>
        <p className="max-w-3xl text-lg text-slate-600">{proposal.description}</p>
        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
          <p>Autor: <strong>{proposal.authorEmail}</strong></p>
          {norm && <p>Norma: <strong>{norm.fullCode}</strong></p>}
          {proposal.reviewerEmail && <p>Revisor: <strong>{proposal.reviewerEmail}</strong></p>}
        </div>
      </section>

      {/* Review comment if present */}
      {proposal.reviewComment && (
        <Card className="mb-8 border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="text-lg">Comentário do revisor</CardTitle>
            <CardDescription>{proposal.reviewerEmail} • {formatDate(proposal.reviewedAt!)}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-7 text-slate-700">{proposal.reviewComment}</p>
          </CardContent>
        </Card>
      )}

      {/* Side-by-side comparison */}
      <section className="mb-8">
        <h2 className="text-3xl mb-4">Comparação de textos</h2>
        <div className="grid gap-4 xl:grid-cols-2">
          {/* Current text */}
          <Card className="border-slate-200">
            <CardHeader className="bg-slate-50">
              <CardTitle className="text-lg text-slate-700">
                <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600">A</span>
                Texto vigente (antes)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="max-h-[600px] overflow-auto rounded-xl bg-slate-50 p-4">
                {proposal.currentFullTextSnapshot.split("\n\n").map((paragraph, i) => (
                  <p key={i} className="mb-3 leading-7 text-sm text-slate-700">
                    {paragraph}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Proposed text */}
          <Card className="border-emerald-200">
            <CardHeader className="bg-emerald-50/50">
              <CardTitle className="text-lg text-emerald-800">
                <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-200 text-xs font-bold text-emerald-700">B</span>
                Texto proposto (depois)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="max-h-[600px] overflow-auto rounded-xl bg-emerald-50/30 p-4">
                {proposal.proposedFullText.split("\n\n").map((paragraph, i) => (
                  <p key={i} className="mb-3 leading-7 text-sm text-slate-700">
                    {paragraph}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Change events */}
      {proposal.changeEvents.length > 0 && (
        <section className="mb-8">
          <h2 className="text-3xl mb-4">Dispositivos alterados</h2>
          <div className="grid gap-4">
            {proposal.changeEvents.map((ce, index) => (
              <Card key={index} className="border-slate-200 shadow-none">
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                      {ce.changeType.replace("-", " ")}
                    </span>
                    <span className="text-sm font-semibold text-slate-700">{ce.target}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {ce.beforeText && (
                    <div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-700">Antes</p>
                      <p className="mt-2 text-sm leading-7 text-rose-900 line-through">{ce.beforeText}</p>
                    </div>
                  )}
                  {ce.afterText && (
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Depois</p>
                      <p className="mt-2 text-sm leading-7 text-emerald-900">{ce.afterText}</p>
                    </div>
                  )}
                  {ce.notes && <p className="text-sm text-slate-600">{ce.notes}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Timeline */}
      <section className="mb-8">
        <h2 className="text-3xl mb-4">Linha do tempo</h2>
        <div className="space-y-0">
          <TimelineItem label="Criação" date={proposal.createdAt} description={`Proposta criada por ${proposal.authorEmail}`} active />
          {proposal.status !== "draft" && (
            <TimelineItem label="Enviada para revisão" date={proposal.updatedAt} description="Status atualizado para revisão" active />
          )}
          {proposal.reviewedAt && (
            <TimelineItem
              label={proposal.status === "rejected" ? "Rejeitada" : "Aprovada"}
              date={proposal.reviewedAt}
              description={`Por ${proposal.reviewerEmail}`}
              active
              variant={proposal.status === "rejected" ? "danger" : "success"}
            />
          )}
          {proposal.publishedAt && (
            <TimelineItem label="Publicada" date={proposal.publishedAt} description="Texto público atualizado" active variant="success" />
          )}
        </div>
      </section>

      {/* Review actions */}
      <ReviewActions
        tenantSlug={tenant}
        proposalId={proposal.id}
        proposalStatus={proposal.status}
        userRole={session.user.role ?? ""}
      />
    </main>
  );
}

function TimelineItem({
  label,
  date,
  description,
  active,
  variant
}: {
  label: string;
  date: string;
  description: string;
  active?: boolean;
  variant?: "success" | "danger";
}) {
  const dotColor = variant === "success"
    ? "bg-emerald-500"
    : variant === "danger"
      ? "bg-rose-500"
      : active
        ? "bg-[var(--tenant-primary)]"
        : "bg-slate-300";

  return (
    <div className="flex gap-4 pb-6">
      <div className="flex flex-col items-center">
        <div className={`h-3 w-3 rounded-full ${dotColor}`} />
        <div className="w-px flex-1 bg-slate-200" />
      </div>
      <div className="-mt-0.5">
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        <p className="text-xs text-slate-500">{formatDate(date)} — {description}</p>
      </div>
    </div>
  );
}
